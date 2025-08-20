import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import StudentCard from '../components/students/StudentCard';
import StudentForm from '../components/students/StudentForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { Student, StudentCategory, BeltColor } from '../types';
import { PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CATEGORIES, BELT_COLORS } from '../constants';

const StudentsPage: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBelt, setFilterBelt] = useState('');

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [studentToDeleteId, setStudentToDeleteId] = useState<string | null>(null);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (studentId: string) => {
    setStudentToDeleteId(studentId);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDeleteId) {
      deleteStudent(studentToDeleteId);
    }
    setIsConfirmDeleteOpen(false);
    setStudentToDeleteId(null);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'attendanceRecords' | 'paymentHistory'> | Student) => {
    if ('id' in studentData) { // Editing existing student
      updateStudent(studentData as Student);
    } else { // Adding new student
      addStudent(studentData);
    }
    setIsModalOpen(false);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = filterCategory ? student.category === filterCategory : true;
      const beltMatch = filterBelt ? student.currentBelt.color === filterBelt : true;
      return nameMatch && categoryMatch && beltMatch;
    });
  }, [students, searchTerm, filterCategory, filterBelt]);

  const categoryOptions = [{ value: '', label: 'Todas as Categorias' }, ...CATEGORIES.map(cat => ({ value: cat, label: cat }))];
  const beltOptions = [{ value: '', label: 'Todas as Faixas' }, ...BELT_COLORS.map(color => ({ value: color, label: color }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-academy-secondary rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-academy-text">Gerenciar Alunos ({filteredStudents.length})</h2>
        <Button onClick={handleAddStudent} leftIcon={<PlusIcon className="h-5 w-5" />}>
          Adicionar Aluno
        </Button>
      </div>

      <div className="p-4 bg-academy-secondary rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input 
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700"
            wrapperClassName="mb-0"
            label="Buscar Alunos"
          />
          <Select
            label="Filtrar por Categoria"
            options={categoryOptions}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as StudentCategory | '')}
            wrapperClassName="mb-0"
          />
          <Select
            label="Filtrar por Faixa"
            options={beltOptions}
            value={filterBelt}
            onChange={(e) => setFilterBelt(e.target.value as BeltColor | '')}
            wrapperClassName="mb-0"
          />
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={handleEditStudent}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-academy-secondary rounded-lg shadow">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-academy-text-secondary mb-4" />
          <p className="text-xl text-academy-text-secondary">Nenhum aluno encontrado com seus critérios.</p>
          {students.length > 0 && <p className="text-sm text-academy-text-secondary mt-2">Tente ajustar seus filtros ou termo de busca.</p>}
          {students.length === 0 && <p className="text-sm text-academy-text-secondary mt-2">Comece adicionando um novo aluno!</p>}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStudent ? 'Editar Aluno' : 'Adicionar Novo Aluno'}>
        <StudentForm
          student={editingStudent}
          onSave={handleSaveStudent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Exclusão" size="sm">
        <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-academy-text-secondary mb-4">Tem certeza que deseja excluir este aluno? Esta ação removerá todos os seus dados e não pode ser desfeita.</p>
            <div className="flex justify-center space-x-4">
                <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>Cancelar</Button>
                <Button variant="danger" onClick={confirmDelete}>Excluir Aluno</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsPage;