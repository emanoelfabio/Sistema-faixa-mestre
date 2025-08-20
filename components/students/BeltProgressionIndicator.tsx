
import React from 'react';
import { Student, BeltColor } from '../../types';
import { BELT_PROGRESSION_RULES, BELT_COLOR_CLASSES } from '../../constants';
import { isEligibleForPromotion } from '../../services/beltService';
import { InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface BeltProgressionIndicatorProps {
  student: Student;
}

const BeltProgressionIndicator: React.FC<BeltProgressionIndicatorProps> = ({ student }) => {
  const progressionPath = BELT_PROGRESSION_RULES[student.category];
  if (!progressionPath) return <p className="text-sm text-academy-text-secondary">Caminho de progressão não definido para esta categoria.</p>;

  const currentBeltIndex = progressionPath.indexOf(student.currentBelt.color);
  const eligibility = isEligibleForPromotion(student);

  return (
    <div className="my-4 p-4 bg-gray-700 rounded-lg">
      <h4 className="text-md font-semibold text-academy-text mb-3">Progressão de Faixa ({student.category})</h4>
      <div className="flex items-center space-x-1 overflow-x-auto pb-2">
        {progressionPath.map((beltColor, index) => {
          const isActive = index === currentBeltIndex;
          const isAchieved = index < currentBeltIndex;
          const isNext = eligibility.eligible && eligibility.nextBelt?.color === beltColor && index === currentBeltIndex + 1;
          
          let bgColor = 'bg-gray-600'; // Default for future belts
          let textColor = 'text-gray-400';
          let borderColor = 'border-gray-500';

          if (isAchieved) {
            bgColor = BELT_COLOR_CLASSES[beltColor].split(' ')[0]; // Get bg color part
            textColor = BELT_COLOR_CLASSES[beltColor].includes('text-black') ? 'text-black' : 'text-white';
            borderColor = 'border-green-500';
          } else if (isActive) {
            bgColor = BELT_COLOR_CLASSES[beltColor].split(' ')[0];
            textColor = BELT_COLOR_CLASSES[beltColor].includes('text-black') ? 'text-black' : 'text-white';
            borderColor = 'border-academy-accent';
          } else if (isNext) {
             borderColor = 'border-yellow-400 animate-pulse';
          }


          return (
            <div key={beltColor} title={beltColor} className={`min-w-[80px] text-center p-2 rounded-md border-2 ${borderColor} ${bgColor} ${textColor} transition-all`}>
              <span className="text-xs font-medium block truncate">{beltColor}</span>
              {isActive && <span className="text-xs block">Atual</span>}
              {isAchieved && <CheckCircleIcon className="h-4 w-4 mx-auto text-green-300" />}
            </div>
          );
        })}
      </div>
      {eligibility.eligible && eligibility.nextBelt && (
        <div className="mt-3 p-3 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-md text-yellow-300 text-sm flex items-start">
          <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <strong>Alerta de Promoção:</strong> Elegível para {eligibility.nextBelt.color}
            {eligibility.nextBelt.stripes > 0 ? ` (${eligibility.nextBelt.stripes} grau(s))` : ''}.
            <p className="text-xs text-yellow-400">{eligibility.reason}</p>
          </div>
        </div>
      )}
       {!eligibility.eligible && eligibility.reason && (
        <div className="mt-3 p-3 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-md text-blue-300 text-sm flex items-start">
          <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <div>
            <strong>Próximos Passos:</strong> {eligibility.reason}
          </div>
        </div>
      )}
    </div>
  );
};

export default BeltProgressionIndicator;
