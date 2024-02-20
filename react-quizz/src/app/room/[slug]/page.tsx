"use client";
import RoomInfos from "@/components/room/RoomInfos";
import { Button } from "@/components/ui/button";
import Room from "@/models/room";
import useStore from "@/store/socketStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Result from "@/components/room/Result";
import React, { useEffect, useState } from "react";
import QuizzDisplay from "@/components/room/QuizzDisplay";

const page = ({ params }: { params: { slug: string } }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [index, setIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [user, setUser] = useState<any>("");
  const [timeLeft, setTimeLeft] = useState<number | null>(5); // Initialisez avec la durée du timer
  const [usersAnswers, setUsersAnswers] = useState<any[]>([]);
  const socket = useStore((state: any) => state.socket);

  const router = useRouter();
  if (!socket) {
    return router.push("/");
  }

  useEffect(() => {
    setUser(socket.auth);
    socket.emit("room", params.slug);

    const handleRoomEvent = (room: Room) => {
      setRoom(room);
    };

    const handleTimeUp = (data: any) => {
      setUsersAnswers(data.answers);
    }

    const handleTimerUpdate = (data: any) => {
          setTimeLeft(data.timeLeft);
    }

    const handleNewQuestion = () => {
      setIndex(index + 1);
      setSelectedAnswer("");
      setUsersAnswers([]);
      setTimeLeft(5);
    }

    socket.on('timer', handleTimerUpdate);
    socket.on("room", handleRoomEvent);
    socket.on('time-up', handleTimeUp);
    socket.on('new-question', handleNewQuestion);
    socket.on("clue", (clue: string) => {
      console.log(clue);
    });
  }, []);

  const handleStartQuizz = () => {
    socket.emit("start-quizz", room?.id);
    socket.emit("create-question", room);
  };

  const handleSubmitAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    socket.emit("submit-answer", { roomId: room?.id, answer });
  }

const nextQuestion = () => {
    socket.emit("create-question", room);
}

  return (
    <div className="text-white">
      <h1>Room: {params.slug}</h1>
      <Link href="/room/join" className="mt-2">
        <Button>All rooms</Button>
      </Link>
      { !room?.isStarted 
      ? 
      (<RoomInfos room={room} setRoom={setRoom} handleStartQuizz={handleStartQuizz} user={user} />)  
      : 
      usersAnswers?.length > 0 || timeLeft == 0 || room?.isQuestionResults
      ? 
      (<Result room={room} usersAnswers={usersAnswers} user={user} nextQuestion={nextQuestion} socket={socket} />) 
      : 
      (<QuizzDisplay room={room} selectedAnswer={selectedAnswer} timeLeft={timeLeft} handleSubmitAnswer={handleSubmitAnswer} socket={socket} />)
      }
    </div>
  );
};

export default page;
