import Room from '@/models/room';
import React, { useState } from 'react';

interface Props {
    room: Room | null;
    setRoom: (room: Room) => void;
}
const Difficulties = ({room, setRoom}: Props) => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

    const handleSelectDifficulty = (difficulty: string) => {
        setSelectedDifficulty(difficulty)
        setRoom({...room, difficulty: difficulty})
    }
        
    return (
        <div className='flex flex-col gap-4 justify-center items-center'>
             <h2 className="text-xl text-white">Select the difficulty</h2>
             <div className='flex gap-3'>
                    {difficulties.map((difficulty, index) => (
                        <button
                            key={index}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${selectedDifficulty === difficulty ? 'bg-blue-700' : ''}`}
                            onClick={() => handleSelectDifficulty(difficulty)}
                        >
                            {difficulty}
                        </button>
                    ))}
             </div>
        </div>
    );
};

export default Difficulties;