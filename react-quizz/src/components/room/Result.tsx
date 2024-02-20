import Room from '@/models/room';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import User from '@/models/user';
import Link from 'next/link';

interface Props {
    usersAnswers: any;
    room: Room | null;
    user: User | null;
    socket: any;
    nextQuestion: () => void;
}

const Result = ({usersAnswers, room, user, nextQuestion, socket}: Props) => {
    const [users, setUsers] = useState<any[]>([]);

        socket.on("users", (users: any) => {
            setUsers(users);
        });

    return (
      <div>
        <h1 className="text-2xl font-bold">
          {room?.nbQuestions === room?.quizz?.length ? "Quizz Finished !" : "Results"}
        </h1>
        {users.length > 0 && room?.nbQuestions === room?.quizz?.length && (
          <div className="bg-[#FFD700] my-4 py-4 px-6 text-xl text-black rounded">
            <div className="font-bold flex flex-col items-center justify-center gap-2">
              <div className="flex gap-3 items-center">
                <span>The winner is:</span>
                <Image
                  src={`/${
                    users?.reduce((prev, current) => (prev.point > current.point ? prev : current)).avatar
                  }.jpg`}
                  alt="@shadcn"
                  width={45}
                  height={45}
                  className="rounded-full"
                />
                {
                  users?.reduce((prev, current) => (prev.point > current.point ? prev : current)).username
                }
              </div>
              <p>
                Points:{" "}
                {
                  users?.reduce((prev, current) => (prev.point > current.point ? prev : current)).point
                }
              </p>
            </div>
          </div>
        )}

        <p>
          My points:{" "}
          {users.map((u) => {
            if (u.id === user?.id) {
              return u.point;
            }
          })}
        </p>
        <p className="my-2 bg-blue-500 text-white py-2 px-4 rounded">
          Question {room?.quizz?.length}: {room?.quizz?.[room?.quizz?.length - 1].question}{" "}
        </p>
        <h2 className="text-md bg-green-500 text-white py-2 px-4 rounded my-4">
          Correct answer : {room?.quizz?.[room?.quizz?.length - 1].answer}{" "}
        </h2>
        <ul>
          {usersAnswers?.map((userAnswer: any, idx: number) => (
            <li
              key={idx}
              className={`flex items-center gap-3 py-2 px-4 rounded border my-2 ${
                userAnswer?.answer === room?.quizz?.[room?.quizz?.length - 1].answer
                  ? "border-green-600"
                  : "border-red-600"
              } `}
            >
              <Image
                src={`/${userAnswer?.user.avatar}.jpg`}
                alt="@shadcn"
                width={45}
                height={45}
                className="rounded-full"
              />
              <h2>{userAnswer?.user.username}: </h2>
              <p>{userAnswer?.answer}</p>
              {users.length > 0 &&
                users?.map((client: any) => {
                  if (client.id === userAnswer?.user.id) {
                    return <p>Points: {client.point}</p>;
                  }
                })}
            </li>
          ))}
        </ul>
        {/* next question if creator */}
        {user?.id === room?.creator?.id && room?.nbQuestions !== room?.quizz?.length && (
          <Button className="bg-green-600 hover:bg-green-700" onClick={nextQuestion}>
            Next question
          </Button>
        )}
        {room?.nbQuestions === room?.quizz?.length && (
          <Link href="/room/join" className="mt-2">
            <Button>Back to rooms</Button>
          </Link>
        )}
      </div>
    );
};

export default Result;