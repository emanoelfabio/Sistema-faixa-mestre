
import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { Student, AttendanceRecord, AuthUser } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/helpers';
import { CheckCircleIcon, XCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const AttendancePage: React.FC = () => {
  const { students, logAttendance, addNotification } = useAppData();
  const { authUser } = useAuth(); // Get authenticated user
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Todas as Turmas'); // For filtering display
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToMark, setStudentToMark] = useState<Student | null>(null);
  const [classNameForMarking, setClassNameForMarking] = useState<string>('Aula Geral');


  const openAttendanceModal = (student: Student) => {
    setStudentToMark(student);
    // If student is marking for themselves, and it's today, default class might be different or pre-filled
    setClassNameForMarking('Aula Geral'); // Reset or set based on context
    setIsModalOpen(true);
  };

  const handleMarkAttendance = (attended: boolean) => {
    if (studentToMark) {
      // Ensure only admin or the student themselves can mark their attendance
      if (authUser?.role === 'admin' || (authUser?.role === 'student' && authUser.id === studentToMark.id)) {
        const record: Omit<AttendanceRecord, 'id'> = {
          date: selectedDate, // Use selectedDate for marking
          attended: attended,
          className: classNameForMarking,
        };
        logAttendance(studentToMark.id, record);
        addNotification({type: 'success', message: `Presença marcada para ${studentToMark.name}`});
      } else {
        addNotification({type: 'error', message: `Você não tem autorização para marcar a presença de ${studentToMark.name}`});
      }
      setIsModalOpen(false);
      setStudentToMark(null);
    }
  };

  const displayStudents = useMemo(() => {
    if (authUser?.role === 'student') {
      return students.filter(s => s.id === authUser.id);
    }
    return students;
  }, [students, authUser]);

  const attendanceForSelectedDate = useMemo(() => {
    return displayStudents.map(student => {
      const record = student.attendanceRecords.find(r => r.date === selectedDate && (selectedClassFilter === 'Todas as Turmas' || r.className === selectedClassFilter));
      return {
        student,
        attended: record?.attended,
        className: record?.className,
      };
    });
  }, [displayStudents, selectedDate, selectedClassFilter]);
  
  const uniqueClassNames = useMemo(() => {
    const classSet = new Set<string>();
    classSet.add('Todas as Turmas');
    // Populate based on all students' records if admin, or just own if student
    const sourceStudents = authUser?.role === 'admin' ? students : displayStudents;
    sourceStudents.forEach(s => s.attendanceRecords.forEach(r => r.className && classSet.add(r.className)));
    return Array.from(classSet).map(name => ({value: name, label: name}));
  }, [students, displayStudents, authUser]);


  return (
    <div className="space-y-6">
      <div className="p-4 bg-academy-secondary rounded-lg shadow flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold text-academy-text">
          {authUser?.role === 'student' ? 'Minha Presença' : 'Controle de Presença'}
        </h2>
      </div>

      <div className="p-4 bg-academy-secondary rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Selecionar Data"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Select 
            label="Filtrar por Turma"
            options={uniqueClassNames}
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-academy-secondary rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Nome do Aluno</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Status para {formatDate(selectedDate)}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Turma Registrada</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-academy-secondary divide-y divide-gray-700">
            {attendanceForSelectedDate.map(({ student, attended, className: markedClassName }) => (
              <tr key={student.id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-academy-text">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {attended === true && <span className="flex items-center text-green-400"><CheckCircleIcon className="h-5 w-5 mr-1"/> Presente</span>}
                  {attended === false && <span className="flex items-center text-red-400"><XCircleIcon className="h-5 w-5 mr-1"/> Ausente</span>}
                  {attended === undefined && <span className="text-academy-text-secondary">Não Marcado</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-academy-text-secondary">
                  {markedClassName || (attended !== undefined ? 'N/A' : '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  { (authUser?.role === 'admin' || (authUser?.role === 'student' && authUser.id === student.id)) && // Student can mark own
                    <Button size="sm" variant="ghost" onClick={() => openAttendanceModal(student)} leftIcon={<PlusCircleIcon className="h-4 w-4"/>}>
                      Marcar Presença
                    </Button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendanceForSelectedDate.length === 0 && (
            <p className="text-center py-4 text-academy-text-secondary">
              {authUser?.role === 'student' ? 'Nenhum registro de presença para os filtros selecionados.' : 'Nenhum aluno para exibir ou que corresponda aos filtros.'}
            </p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Marcar Presença para ${studentToMark?.name || ''} em ${formatDate(selectedDate)}`}>
        <div className="space-y-4">
          <Input 
            label="Nome da Turma"
            value={classNameForMarking}
            onChange={(e) => setClassNameForMarking(e.target.value)}
            placeholder="ex: Sparring Infantil, Fundamentos Adulto"
          />
          <p className="text-sm text-academy-text-secondary">Selecione o status de presença:</p>
          <div className="flex justify-around space-x-3">
            <Button variant="primary" onClick={() => handleMarkAttendance(true)} className="flex-1 bg-green-500 hover:bg-green-600" leftIcon={<CheckCircleIcon className="h-5 w-5"/>}>
              Presente
            </Button>
            <Button variant="danger" onClick={() => handleMarkAttendance(false)} className="flex-1" leftIcon={<XCircleIcon className="h-5 w-5"/>}>
              Ausente
            </Button>
          </div>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="w-full mt-2">Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AttendancePage;
