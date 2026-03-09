import React, { useState, useEffect } from 'react';
import './Taskbar.css'; // We will create this next

const Taskbar = () => {
  const [time, setTime] = useState(new Date());

  // Update the clock every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timerId);
  }, []);

  // Format the time to look like the classic Windows clock (e.g., "6:26 PM")
  const formattedTime = time.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <div className="xp-taskbar">
      {/* 1. The Start Button */}
      <button className="xp-start-button">
        <img 
          src="https://win98icons.alexmeub.com/icons/png/windows-0.png" 
          alt="Windows Logo" 
          className="start-icon"
        />
        <span className="start-text">start</span>
      </button>

      {/* 2. The Active Programs Area (Middle) */}
      <div className="xp-taskbar-programs">
        <div className="active-program">
          <img 
            src="https://win98icons.alexmeub.com/icons/png/cd_audio_cd_a-3.png" 
            alt="MyTunes Icon" 
            className="program-icon"
          />
          MyTunes
        </div>
      </div>

      {/* 3. The System Tray (Right side with the clock) */}
      <div className="xp-system-tray">
        <img 
          src="https://win98icons.alexmeub.com/icons/png/loudspeaker_rays-0.png" 
          alt="Volume" 
          className="tray-icon"
        />
        <span className="xp-clock">{formattedTime}</span>
      </div>
    </div>
  );
};

export default Taskbar;