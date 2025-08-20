
import React from 'react';
import { Link } from 'react-router-dom';
import { Student } from '../../types';
import { DEFAULT_PROFILE_IMAGE, BELT_COLOR_CLASSES } from '../../constants';
import { calculateAge, formatDate } from '../../utils/helpers';
import Badge from '../common/Badge';
import { PencilSquareIcon, TrashIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete }) => {
  const age = calculateAge(student.dateOfBirth);

  return (
    <div className="bg-academy-secondary rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="relative">
        <img 
            src={student.profileImageUrl || DEFAULT_PROFILE_IMAGE} 
            alt={student.name} 
            className="w-full h-48 object-cover" 
            onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_IMAGE)}
        />
        <div className={`absolute top-2 right-2`}>
            <Badge belt={student.currentBelt} size="md" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-academy-text mb-1">{student.name}</h3>
        <p className="text-sm text-academy-text-secondary mb-1">{student.category} - {age} anos</p>
        <p className="text-sm text-academy-text-secondary mb-3">Inscrito em: {formatDate(student.joinDate)}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <Link to={`/students/${student.id}`} className="text-sm text-academy-accent hover:underline flex items-center">
            Ver Detalhes <ArrowRightCircleIcon className="h-4 w-4 ml-1" />
          </Link>
          <div className="space-x-2">
            <button onClick={() => onEdit(student)} className="text-blue-400 hover:text-blue-300" title="Editar">
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button onClick={() => onDelete(student.id)} className="text-red-400 hover:text-red-300" title="Excluir">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
