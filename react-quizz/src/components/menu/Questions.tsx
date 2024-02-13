import Room from '@/models/room';
import React, { useState } from 'react';

interface Props {
    room: Room | null;
    setRoom: (room: Room) => void;
}
const Questions = ({room, setRoom}: Props) => {
    const nbQuestions = [5, 10, 15, 20];
    const [selectedNbQuestions, setSelectedNbQuestions] = useState(10);
    const handleSelectNbQuestions = (nbQuestions: number) => {
        setSelectedNbQuestions(nbQuestions)
        setRoom({...room, nbQuestions: nbQuestions})
    }
    return (
      <div className="flex flex-col gap-4 justify-center items-center">
        <h2 className="text-xl text-white">Select the number of questions</h2>
        <div className="flex gap-3">
          {nbQuestions.map((nbQuestion, index) => (
            <button
              key={index}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                selectedNbQuestions === nbQuestion ? "bg-blue-700" : ""
              }`}
              onClick={() => {
                handleSelectNbQuestions(nbQuestion);
              }}
            >
              {nbQuestion}
            </button>
          ))}
        </div>
      </div>
    );
};

export default Questions;