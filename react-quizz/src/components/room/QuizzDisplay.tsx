import Room from '@/models/room';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';

interface Props {
    room: Room | null;
    selectedAnswer: string;
    timeLeft: number | null;
    handleSubmitAnswer: (answer: string) => void;
    socket: any;

}

const QuizzDisplay = ({room, selectedAnswer, timeLeft, handleSubmitAnswer, socket}: Props) => {
  const [clue, setClue] = useState<string>("");
  const getClue = () => {
    socket.emit("get-clue", room);
}

useEffect(() => {
    socket.on("clue", (clue: string) => {
        setClue(clue);
    });
  }, [])

    return (
      <div className="flex justify-center items-center flex-col gap-3 bg-gray-100 min-h-[80vh]">
        <div className="text-center p-3 max-w-2xl bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Question {room?.quizz && room.quizz.length > 0 ? room?.quizz?.length : 1}:{" "}
            {room?.quizz?.[room?.quizz?.length - 1]?.question}
          </h2>
          <div className="text-gray-600">Temps restant : {timeLeft} secondes</div>
          <ul className="flex flex-col gap-4 md:flex-row md:flex-wrap justify-center items-center">
            {room?.quizz?.[room?.quizz?.length - 1]?.possibleAnswers &&
            room.quizz[room?.quizz?.length - 1].possibleAnswers.length > 0 ? (
              room.quizz[room?.quizz?.length - 1].possibleAnswers.map(
                (answer: any, idx: number) => (
                  <li key={idx} className="w-full md:w-1/2 lg:w-1/3">
                    <button
                      className={`${
                        selectedAnswer === answer && "bg-slate-900"
                      } w-full text-left px-4 py-2 border rounded-lg text-gray-700 font-medium hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2  focus:text-white focus:ring-opacity-50 transition ease-in-out duration-150`}
                      onClick={() => handleSubmitAnswer(answer)}
                    >
                      {answer}
                    </button>
                  </li>
                )
              )
            ) : (
              <p className="text-black">Chargement des réponses...</p>
            )}
          </ul>
          {room?.quizz?.[room?.quizz?.length - 1]?.possibleAnswers &&
            room.quizz[room?.quizz?.length - 1].possibleAnswers.length > 0 && (
              <Button className="my-2" onClick={getClue} disabled={clue !== ""}>
                Get a clue
              </Button>
            )}
          {clue && <p className="text-blue-500 my-2">{clue}</p>}
        </div>
      </div>
    );
};

export default QuizzDisplay;