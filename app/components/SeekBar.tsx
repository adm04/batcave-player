'use client';

import React, { useRef, useState, useCallback } from 'react';

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (newTime: number) => void;
}

export const SeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateTimeFromPointer = useCallback(
    (clientX: number) => {
      if (!barRef.current || duration <= 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = clickX / rect.width;
      return percentage * duration;
    },
    [duration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const newTime = calculateTimeFromPointer(e.clientX);
    onSeek(newTime);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const updatedTime = calculateTimeFromPointer(moveEvent.clientX);
      onSeek(updatedTime);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      ref={barRef}
      onPointerDown={handlePointerDown}
      className="group relative h-6 w-full flex items-center cursor-pointer touch-none select-none"
    >
      {/* Visible rail: 3px bg-white/15 */}
      <div className="h-[3px] w-full bg-white/15 rounded-full overflow-hidden relative">
        {/* Progress fill using crimson accent */}
        <div
          className="h-full bg-crimson-bright shadow-[0_0_10px_rgba(200,29,37,0.8)] transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Hover/Drag Knob */}
      <div
        className={`absolute w-3 h-3 rounded-full bg-white shadow-md ring-2 ring-crimson-bright -translate-x-1/2 transition-opacity duration-150 ${
          isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{ left: `${progressPercent}%` }}
      />
    </div>
  );
};
