
import React from 'react';
import { Belt, BeltColor } from '../../types';
import { BELT_COLOR_CLASSES } from '../../constants';

interface BadgeProps {
  text?: string;
  belt?: Belt;
  colorClass?: string; // Allow overriding for statuses etc.
  size?: 'sm' | 'md';
  className?: string;
}

const BeltStripe: React.FC<{ count: number; beltColor: BeltColor }> = ({ count, beltColor }) => {
  if (count === 0) return null;
  const stripeColor = beltColor === BeltColor.BLACK ? 'bg-red-500' : 'bg-gray-600'; // Red stripes on black belt, otherwise dark grey/black
  return (
    <div className="flex space-x-0.5 ml-1">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`inline-block w-1 h-3 ${stripeColor} rounded-sm`}></span>
      ))}
    </div>
  );
};


const Badge: React.FC<BadgeProps> = ({ text, belt, colorClass, size = 'md', className = '' }) => {
  let displayClass = colorClass;
  let displayText = text;
  let stripes = 0;
  let currentBeltColor = BeltColor.WHITE; // default

  if (belt) {
    displayClass = BELT_COLOR_CLASSES[belt.color];
    displayText = belt.color;
    stripes = belt.stripes;
    currentBeltColor = belt.color;
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center ${sizeStyles[size]} font-medium rounded-full ${displayClass} ${className}`}
    >
      {displayText}
      {belt && <BeltStripe count={stripes} beltColor={currentBeltColor} />}
    </span>
  );
};

export default Badge;
