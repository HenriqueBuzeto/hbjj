'use client';

import React from 'react';

interface MacroCircleProps {
  label: string;
  val: number;
  max: number;
  color: string;
}

const MacroCircle: React.FC<MacroCircleProps> = ({ label, val, max, color }) => {
  const percentage = Math.min((val / max) * 100, 100);
  const circumference = 2 * Math.PI * 18; // raio = 18
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label}: ${val} de ${max}`}>
      <div className="relative w-12 h-12">
        <svg className="transform -rotate-90 w-12 h-12">
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-100 dark:text-gray-700"
          />
          <circle
            cx="24"
            cy="24"
            r="18"
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
            {Math.round(val)}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">
        {label}
      </span>
    </div>
  );
};

export default MacroCircle;
