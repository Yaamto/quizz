import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { time } from 'console';
import OpenAI from 'openai';
import { Socket } from 'socket.io';
import { User, room, UserAnswer, Question } from './room.interface';

const apiKey = "";
const openai = new OpenAI({
  apiKey: apiKey
});

async function generateQuestion(room: room) {
  //get all questions from the room and put them in a string
  let questions = '';
  for (const question of room.quizz) {
    questions += question.question + ', ';
  }
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: `Generate a single question for a quizz with different parameters using Json only generating an object like : {question: string, possibleAnswers: string[], answer: string}. With 4 possibleAnswers. Don't ask the same question in this lists : ${questions}` },
      { role: 'user', content: `Generate a single question for a quizz with ${room.difficulty} difficulty, ${room.isRandomTheme ? ' mixed random themes' : room.theme + ' theme.'}.`}
    ],
    model: 'gpt-3.5-turbo',
  });
  
  return chatCompletion.choices[0].message.content
}

@WebSocketGateway({ cors: true })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;
  users: User[] = [];
  rooms: room[] = []; 

  //Permet de set le username et l'avatar de l'utilisateur
  @SubscribeMessage('user-set')
  handleUsernameSet(client: any, payload: any): void {
    const c = this.users.find((c) => c.id === client.id);
    if (c) {
      c.username = payload.username;
      c.avatar = payload.avatar;
    }
  }
// Permet de créer une room
  @SubscribeMessage('room-create')
  async handleRoomCreate(client: any, payload: any) {
    const c = this.users.find((c) => c.id === client.id);
    if (c) {
      const room: room = {
        id: payload.id,
        creator: c,
        clients: [c],
        difficulty: payload.difficulty,
        theme: payload.theme,
        isPrivate: payload.isPrivate,
        nbQuestions: payload.nbQuestions,
        isRandomTheme: payload.isRandomTheme,
        quizz: [],
        isStarted: false,
        isQuestionResults: false
      };
      this.rooms.push(room);
      //On rejoins la room puis on emit le changement pour tout les clients, on met à jour aussi la room
      client.join(room.id);
      this.server.emit('rooms', this.rooms);
      this.server.to(room.id).emit('room', room);
    }
  }
  //Permet de renvoyer la room
  @SubscribeMessage('room')
  handleRoom(client: any, payload: any) {
    const room = this.rooms.find((r) => r.id === payload);
    if (room) {
      client.emit('room', room);
    }
  }
// Permet de récupérer toutes les rooms
  @SubscribeMessage('get-rooms')
  handleRooms(client: any) {
    this.server.emit('rooms', this.rooms);
  }
// Permet de rejoindre une room
  @SubscribeMessage('join-room')
  handleJoinRoom(client: any, payload: any) {
    // Quitter toutes les rooms précédentes
  for (const room of this.rooms) {
    const index = room.clients.findIndex(u => u.id === client.id);
    const user = this.users.find(u => u.id === client.id);
    user.point = 0;
    if (index !== -1) {
      room.clients.splice(index, 1);
      client.leave(room.id);
    }
  }
  // Rejoindre la nouvelle room
  const room = this.rooms.find(r => r.id === payload);
  if (room) {
    const joiningUser = this.users.find(u => u.id === client.id);
    if (joiningUser && !room.clients.some(u => u.id === client.id)) {
      room.clients.push(joiningUser);
      client.join(room.id); // Rejoindre la room avec Socket.IO
      // envoyer 'room' event à tout les clients dans la room
      this.server.to(room.id).emit('room', room);
      // Indiquer qu'il y a quelqu'un qui a rejoins cette room à tout les clients
      this.server.emit('rooms', this.rooms);
    }
  }
  }
// Permet de quitter une room
  @SubscribeMessage('leave-room')
handleLeaveRoom(client: Socket, roomId: string) {
  // leave all rooms previously joined
  for (const room of this.rooms) {
    const index = room.clients.findIndex(u => u.id === client.id);
    if (index !== -1) {
      room.clients.splice(index, 1);
      client.leave(room.id);
      // send 'room' event to all clients in room
      this.server.to(room.id).emit('room', room);
      this.server.emit('rooms', this.rooms);
    }
  }
}
// Evenement permettant de démarrer le quizz
@SubscribeMessage('start-quizz')
handleStartQuizz(client: any, roomId: string) {
  const room = this.rooms.find(r => r.id === roomId);
  if (room) {
    room.isStarted = true;
    this.server.to(room.id).emit('room', room);
  }
}
// Fait appel à l'api openai pour générer une question
@SubscribeMessage('create-question')
async handleCreateQuestion(client: any, payload: any) {
  const room = this.rooms.find(r => r.id === payload.id);
  if (room) {
    const aiQuestion = await generateQuestion(room);
    const question = await JSON.parse(aiQuestion);

    //Créer le timestamp lorsque la question est générée
    const timeStamp = Date.now();
    // Vérifie si la question est un tableau ou non, si oui, on push la première question
    if (Array.isArray(question)) {
      const questionToPush = question[0];
      questionToPush.id = Math.random().toString(36).substr(2, 9);
      room.quizz.push(questionToPush);
      //Sinon il récupère la question générée
    } else {
      question.id = Math.random().toString(36).substr(2, 9);
      room.quizz.push(question);
    }
    room.isQuestionResults = false;
    this.server.to(room.id).emit('room', room);
    this.server.to(room.id).emit('new-question');

    this.createTimer(timeStamp, room);
  }
}
// Fonction permettant de créer le timer et de gérer les réponses
createTimer = (timeStamp: any, room: room) => {
  let startTime = 5
  let timeLeft = 5;

  const timerId = setInterval(() => {
    this.server.to(room.id).emit('timer', { timeLeft });
    timeLeft -= 1;

    if (timeLeft < 0) {
      clearInterval(timerId);
      const answers = room.quizz[room.quizz.length - 1].userAnswers;
      const users = []
      if(!answers) {
        room.isQuestionResults = true;
        this.server.to(room.id).emit('users', users);
        this.server.to(room.id).emit('time-up', {answers});
        return;
      }
      for (const answer of answers) {
        if (answer.answer === room.quizz[room.quizz.length - 1].answer) {
          // calculer le temps pris par l'utilisateur pour répondre
          const timeTaken = answer.timeStamps - timeStamp
          // calculer les points gagnés par l'utilisateur
          const pointsEarned = timeTaken > 4000 ? 100 : 100 * (startTime - (timeTaken / 1000));
          // attribuer les points a l'utilisateur 
          const user = room.clients.find((u) => u.id === answer.user.id);
          user.point += Math.round(Math.max(0, pointsEarned));
          users.push(user);
        }else {
          const user = room.clients.find((u) => u.id === answer.user.id);
          users.push(user);
        }
      }
      room.isQuestionResults = true;
      //Renvoie tout les utilisateurs et les points
      this.server.to(room.id).emit('users', users);
      // renvoie les réponses des utilistateurs
      this.server.to(room.id).emit('time-up', {answers});
    }
  }, 1000);
}
// Evènement permettant de soumettre une réponse
@SubscribeMessage('submit-answer')
handleAnswerSubmit(client: Socket, { roomId, answer }: { roomId: string; answer: string }) {
  const user = this.users.find((u) => u.id === client.id);
  const room = this.rooms.find((r) => r.id === roomId);
  const question = room.quizz[room.quizz.length - 1];

  if (!question.userAnswers) {
    question.userAnswers = [];
  }
  // check if user already answered, if yes, update the user's answer
  const index = question.userAnswers.findIndex((ua) => ua.user.id === user.id);
  if (index !== -1) {
    question.userAnswers[index].answer = answer;
    question.userAnswers[index].timeStamps = Date.now();
    return;
  }else {
    question.userAnswers.push({ user, answer, timeStamps: Date.now() });
  }
}

  handleConnection(client: Socket, payload: any) {
    console.log('client connected ', client.handshake.auth);
    this.users.push({
      id: client.id,
      username: client.handshake.auth.username,
      avatar: client.handshake.auth.avatar,
      point: 0
    });
  }

  handleDisconnect(client: any) {
    console.log('client disconnected ', client.id);
    this.users = this.users.filter((c) => c.id !== client.id);
    // remove rooms with creator === client
    this.rooms = this.rooms.filter(r => r.creator.id !== client.id);
    this.server.emit('rooms', this.rooms);
    client.leaveAll();
  }
}
