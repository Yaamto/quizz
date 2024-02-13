"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { io } from "socket.io-client";
import useStore from "@/store/socketStore";

const socket = io("http://localhost:3000", {
  autoConnect: false,
});

export default function Home() {
  const avatars = [
    "avatar1",
    "avatar2",
    "avatar3",
    "avatar4",
    "avatar5",
    "avatar6",
    "avatar7",
    "avatar8",
  ];
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [isUserSet, setIsUserSet] = useState(false);
  const updateSocket = useStore((state: any) => state.updateSocket);
  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const handleUsernameChange = (event: any) => {
    setUsername(event.target.value);
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    // déconnecte le socket dans le cas où l'on a déjà un socket d'ouvert
    socket.disconnect();
    socket.auth = { username, avatar: selectedAvatar, point: 0 };
    socket.on('connect', () => {
      // Ajoutez l'ID du socket à l'objet auth
      socket.auth = { ...socket.auth, id: socket.id };
  });
    socket.connect();
    updateSocket(socket);
    socket.on("connect", () => {
      console.log("connect");
    });
    setIsUserSet(true);
  };



  const isButtonDisabled = !selectedAvatar || !username;

  return (
    <>
      {!isUserSet ? (
        <div className="w-full flex flex-col justify-center items-center gap-3  text-white">
          <h1 className="text-4xl font-extrabold">Welcome to your favorite quizz !</h1>
          <h2 className="text-xl">Start by choosing your avatar and username !</h2>
          <div className="flex gap-3 w-1/2 flex-wrap justify-center items-center">
            {avatars.map((avatar) => (
              <Image
                src={`/${avatar}.jpg`}
                alt="@shadcn"
                width={200}
                height={200}
                className={`cursor-pointer ${selectedAvatar === avatar ? "selected-avatar" : ""}`}
                onClick={() => handleAvatarClick(avatar)}
              />
            ))}
          </div>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Username..."
              value={username}
              onChange={handleUsernameChange}
            />
            <Button type="submit" disabled={isButtonDisabled} onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </div>
      ) :   ( <div className=" text-white gap-3 mt-5 h-full flex flex-col justify-center items-center">
      <h1>Create or join a room !</h1>
      <div className="flex gap-4">
      <Link href="/room/create"><Button>Create</Button></Link>
      <Link href="/room/join"><Button>Join</Button></Link>
      </div>
    </div>)
      }
    </>
  );
}
