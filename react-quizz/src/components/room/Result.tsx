import Room from '@/models/room';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import User from '@/models/user';


interface Props {
    usersAnswers: any;
    room: Room | null;
    user: User | null;
    socket: any;
    nextQuestion: () => void;
}

const Result = ({usersAnswers, room, user, nextQuestion, socket}: Props) => {
    const [users, setUsers] = useState<any[]>([]);
    console.log(users)
    useEffect(() => {
        socket.on("users", (users: any) => {
            setUsers(users);
        });
    }, [])
    return (
        <div>
        <h1>Results</h1>
        <p>My points: {users.map((u) => {
            if(u.id === user?.id){
                return u.point
            }
        })}</p>
        <h2 className="text-md bg-green-500 text-white py-2 px-4 rounded my-4">Correct answer : {room?.quizz?.[room?.quizz?.length -1].answer} </h2>
        <ul>
          {usersAnswers?.map((userAnswer: any, idx: number) => (
            <li key={idx} className={`flex items-center gap-3 py-2 px-4 rounded border my-2 ${userAnswer?.answer === room?.quizz?.[room?.quizz?.length -1].answer ? "border-green-600" : "border-red-600"} `} >
                <Image
                  src={`/${userAnswer?.user.avatar}.jpg`}
                  alt="@shadcn"
                  width={45}
                  height={45}
                  className="rounded-full"
                />
              <h2>{userAnswer?.user.username}: </h2>
              <p>{userAnswer?.answer}</p>
              {users?.map((client: any) => {
                console.log(client.point)
                if(client.id === userAnswer?.user.id){
                  return <p>Points: {client.point}</p>
                }
              }
            )}
            </li>
          ))}
        </ul>
        {/* next question if creator */}
        {user?.id === room?.creator?.id && (
          <Button className="bg-green-600 hover:bg-green-700" onClick={nextQuestion}>
            Next question
          </Button>
        )}
       
      </div>
    );
};

export default Result;