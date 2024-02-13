import Room from '@/models/room';
import React, { useState } from 'react';
interface Props {
    room: Room | null;
    setRoom: (room: Room) => void;
}
const Theme = ({room, setRoom}: Props) => {
    const themes = ['Geography', 'History', 'Science', 'Sports', 'Art', 'Celebrities', 'Animals', 'Politics', 'General Knowledge'];
    const [selectedTheme, setSelectedTheme] = useState('');

    const handleSelectTheme = (theme: string) => {
        setSelectedTheme(theme)
        setRoom({...room, theme: theme, isRandomTheme: null})
    }

    const handleSelectRandomTheme = () => {
        setSelectedTheme('Random')
        setRoom({...room, isRandomTheme: true})
    }
        
    return (
      <div className="flex flex-col gap-4 justify-center items-center md:w-1/3">
        <h2 className="text-xl text-white">Select the theme</h2>
        <div className="flex gap-3 flex-wrap justify-center">
        <button className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${selectedTheme === "Random" ? "bg-blue-700" : ""}`}
              onClick={() => handleSelectRandomTheme()}
            >
                Mixed themes
            </button>
          {themes.map((theme, index) => (
            <button
              key={index}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                selectedTheme === theme ? "bg-blue-700" : ""
              }`}
              onClick={() => handleSelectTheme(theme)}
            >
              {theme}
            </button>
          ))}
          
        </div>
      </div>
    );
};

export default Theme;