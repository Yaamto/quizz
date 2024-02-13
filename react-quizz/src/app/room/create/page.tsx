"use client";
import Difficulties from '@/components/menu/Difficulties';
import Privacy from '@/components/menu/Privacy';
import Questions from '@/components/menu/Questions';
import Theme from '@/components/menu/Theme';
import { Button } from '@/components/ui/button';
import Room from '@/models/room';
import useStore from "@/store/socketStore";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const create = () => {
    const [user, setUser] = useState<any>("");
    const socket = useStore((state: any) => state.socket);
    const [room, setRoom] = useState<Room | null>({ id: new Date().getTime().toString(), creator: null, difficulty: '', isPrivate: null, clients: [], theme: '', isRandomTheme: null, nbQuestions: 10, quizz: [], isStarted: false });
    const router = useRouter()

    if(!socket){
        return router.push('/') 
      }

    useEffect(() => {
        setUser(socket.auth);
        socket.emit("leave-room");
    }, [])
    
    const handleCreateRoom = () => {  
        socket.emit('room-create', room);
      }
      
    return (
        <div className="flex flex-col gap-4 justify-center items-center">
           <div className="flex flex-col items-center text-white">
          <Link href={"/"}><Button className="bg-gray-500">↩ Back to home</Button></Link>
          <Link href="/room/join" className="mt-3"><Button>Join</Button></Link>
          <h1 className="text-2xl my-2">Create a quizz room</h1>
          <h2 className="text-xl">Hello {user.username}</h2>
          <Image src={`/${user.avatar}.jpg`} alt="@shadcn" width={200} height={200} />
        </div>
        <Privacy room={room} setRoom={setRoom}/>
        <Difficulties room={room} setRoom={setRoom}/>
        <Theme room={room} setRoom={setRoom}/>
        <Questions room={room} setRoom={setRoom}/>
        
          <Button 
          onClick={handleCreateRoom} 
          disabled={!room?.difficulty || (!room.theme && room.isRandomTheme === null) || !room.nbQuestions || room.isPrivate === null }
          >
            <Link href={`/room/${room?.id}`}>
            Create room
          </Link>
          </Button>
      </div>
    );
};

export default create;




