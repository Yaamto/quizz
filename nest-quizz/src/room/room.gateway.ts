import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { time } from 'console';
import OpenAI from 'openai';
import { Socket } from 'socket.io';

const apiKey = "";
const openai = new OpenAI({
  apiKey: apiKey
});

interface User {
  id: string;
  username?: string;
  avatar?: string;
  point?: number;
}

interface UserAnswer {
  user: User;
  answer: string;
  timeStamps: number;
}

interface room {
  id: string;
  creator: User;
  clients: User[];
  difficulty: string;
  theme: string;
  isPrivate: boolean;
  nbQuestions: number;
  isRandomTheme: boolean;
  quizz?: Question[];
  isStarted: boolean;
}

interface Question {
  id: string;
  question: string;
  possibleAnswers: string[];
  answer: string;
  userAnswers?: UserAnswer[];
}


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
  roomAnswers: { [roomId: string]: UserAnswer[] } = {};
  themes: string[] = ['Geography', 'History', 'Science', 'Sports', 'Art', 'Celebrities', 'Animals', 'Politics', 'General Knowledge'];
  difficulties: string[] = ['Easy', 'Medium', 'Hard'];

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('user-set')
  handleUsernameSet(client: any, payload: any): void {
    const c = this.users.find((c) => c.id === client.id);
    if (c) {
      c.username = payload.username;
      c.avatar = payload.avatar;
    }
  }

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
        isStarted: false
      };
      this.rooms.push(room);
      client.join(room.id);
      this.server.emit('rooms', this.rooms);
      this.server.to(room.id).emit('room', room);
    }
  }
  
  @SubscribeMessage('room')
  handleRoom(client: any, payload: any) {
    const room = this.rooms.find((r) => r.id === payload);
    if (room) {
      client.emit('room', room);
    }
  }

  @SubscribeMessage('get-rooms')
  handleRooms(client: any) {
    this.server.emit('rooms', this.rooms);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: any, payload: any) {
    // Quitter toutes les rooms précédentes
  for (const room of this.rooms) {
    const index = room.clients.findIndex(u => u.id === client.id);
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

      this.server.to(room.id).emit('room', room);
      this.server.emit('rooms', this.rooms);
    }
  }
  }

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
@SubscribeMessage('start-quizz')
handleStartQuizz(client: any, roomId: string) {
  const room = this.rooms.find(r => r.id === roomId);
  if (room) {
    room.isStarted = true;
    this.server.to(room.id).emit('room', room);
  }
}

@SubscribeMessage('create-question')
async handleCreateQuestion(client: any, payload: any) {
  const room = this.rooms.find(r => r.id === payload.id);
  if (room) {
    const test = await generateQuestion(room);
    console.log(test)
    const question = await JSON.parse(test);

    console.log(question)

    //check if question is an array of objects so take the first object but if it's an object take it directly
    const timeStamp = Date.now();
    if (Array.isArray(question)) {
      const questionToPush = question[0];
      questionToPush.id = Math.random().toString(36).substr(2, 9);
      room.quizz.push(questionToPush);
    } else {
      question.id = Math.random().toString(36).substr(2, 9);
      room.quizz.push(question);
    }

    this.server.to(room.id).emit('room', room);
    this.server.to(room.id).emit('new-question');
    let startTime = 5
    let timeLeft = 5; // Temps en secondes
    
    const timerId = setInterval(() => {
      this.server.to(room.id).emit('timer', { timeLeft });
      timeLeft -= 1;

      if (timeLeft < 0) {
        clearInterval(timerId);
        const answers = room.quizz[room.quizz.length - 1].userAnswers;
        const users = []
        for (const answer of answers) {
          if (answer.answer === room.quizz[room.quizz.length - 1].answer) {
            const timeTaken = answer.timeStamps - timeStamp
            console.log(timeTaken)
            console.log(timeLeft - (timeTaken / 1000))
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
        this.server.to(room.id).emit('users', users);
        this.server.to(room.id).emit('time-up', {answers});
      }
    }, 1000);
  }
}

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
