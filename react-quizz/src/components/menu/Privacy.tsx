import Room from '@/models/room';
import React, { useState } from 'react';

interface Props {
    room: Room | null;
    setRoom: (room: Room) => void;
}
const Privacy = ({room, setRoom}: Props) => {
    const privacies = ['Public', 'Private'];
    const [selectedPrivacy, setSelectedPrivacy] = useState<string | null>(null);
    const handleSelectPrivacy = (privacy: string) => {
        setSelectedPrivacy(privacy)
        setRoom({...room, isPrivate: privacy === 'Private' ? true : false})
    }
    return (
        <div className='flex flex-col gap-4 justify-center items-center'>
            <h2 className="text-xl text-white">Select the room's privacy</h2>
            <div className='flex gap-3'>
                {privacies.map((privacy, index) => (
                    <button
                        key={index}
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${selectedPrivacy === privacy ? 'bg-blue-700' : ''}`}
                        onClick={() => handleSelectPrivacy(privacy)}
                    >
                        {privacy}
                    </button>
                ))}
            
            </div>
        </div>
    );
};

export default Privacy;