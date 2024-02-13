import Room from '@/models/room';
import React from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';

interface Props {
    room: Room | null;
    setRoom: (room: Room) => void;
    handleStartQuizz: () => void;
    user: any;
}

const RoomInfos = ({room, setRoom, handleStartQuizz, user}: Props) => {

    const sortedClients = () => {
        if (!room || !room.clients) return [];
    
        // Supposons que `currentUser` est l'ID de l'utilisateur actuel
        const creatorId = room.creator?.id;
        const creator = room.clients.find(client => client.id === creatorId);
        const otherClients = room.clients.filter(client => client.id !== creatorId);
    
        // Place le créateur en premier, suivi des autres clients
        return creator ? [creator, ...otherClients] : [...otherClients];
    };
    return (
        <div className="flex gap-10 mt-5 w-full justify-center">
          <div className="flex flex-col gap-3 bg-slate-900 shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold">Room's infos :</h2>
            <div className="flex flex-col">
              <p className="text-lg font-semibold mb-2">
                Privacy:{" "}
                <span className="font-normal">{room?.isPrivate ? "Private" : "Public"}</span>
              </p>
              <p className="text-lg font-semibold mb-2">
                Difficulty: <span className="font-normal">{room?.difficulty}</span>
              </p>
              <p className="text-lg font-semibold mb-2">
                Theme:{" "}
                <span className="font-normal">
                  {room?.isRandomTheme ? "Mixed themes" : room?.theme}
                </span>
              </p>
              <p className="text-lg font-semibold">
                Questions: <span className="font-normal">{room?.nbQuestions}</span>
              </p>
            </div>
            {user.id === room?.creator?.id && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleStartQuizz}>
                Start Quizz
              </Button>
            )}
          </div>
          <div className="w-[150px]">
            <h2 className="text-xl">Users :</h2>
            <ul className="mt-4">
              {sortedClients().map((client) => (
                <li className="flex gap-3 items-center my-2" key={client.id}>
                  <Image
                    src={`/${client.avatar}.jpg`}
                    alt="@shadcn"
                    width={45}
                    height={45}
                    className="rounded-full"
                  />
                  <span>{client.username}</span>
                  {client.id === room?.creator?.id && (
                    <Image
                      src={`/couronne.png`}
                      alt="couronne"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
    );
};

export default RoomInfos;