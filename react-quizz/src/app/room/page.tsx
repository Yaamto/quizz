"use client";
import { Button } from "@/components/ui/button";
import useStore from "@/store/socketStore";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

const Room = () => {
  
  const [user, setUser] = useState<any>();
  const socket = useStore((state: any) => state.socket);
    const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    setUser(socket.auth);
    socket.on("rooms", (rooms: any) => {
        setRooms(rooms);
        });
        socket.emit("get-rooms")
        socket.emit("leave-room");
  }, []);

  return (
    <div className="text-white flex gap-4 justify-center items-center">
      <div>
      <Link href="/" className="my-4">
        <Button className="bg-gray-500">↩ Back to home</Button>
      </Link>
      {user && (
        <div className="flex gap-3 my-4">
          <Image
            src={`/${user.avatar}.jpg`}
            alt="@shadcn"
            width={45}
            height={45}
            className="rounded-full"
          />
          <span>{user.username}</span>
        </div>
      )}
      <h1 className="mt-5">Rooms</h1>
      <div className="flex gap-2 mt-2">
            <Input type="text" placeholder="Room ID..." />
            <Button>Join private room</Button>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
            {rooms?.map((room) => (
            <li className="flex gap-3 items-center" key={room.id}>
                <Link href={`/room/${room.id}`}>
                <Button>{room.id}</Button>
                </Link>
                <span>Players: {room.clients?.length}</span>
            </li>
            ))}
        </ul>
        </div>
        
    </div>
  );
};

export default Room;
