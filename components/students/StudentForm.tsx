import React, { useState, useEffect } from 'react';
import { Student, StudentCategory, BeltColor, Belt } from '../../types';
import { CATEGORIES, BELT_COLORS } from '../../constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
// import { useAppData } from '../../hooks/useAppData'; // Not used in this component directly

interface StudentFormDataType {
  name: string;
  dateOfBirth: string;
  category: StudentCategory;
  currentBeltColor: BeltColor;
  currentBeltStripes: number;
  joinDate: string;
  contactEmail?: string;
  contactPhone?: string;
  profileImageUrl?: string;
  notes?: string;
  lastPromotionDate?: string;
}

const initialFormData: StudentFormDataType = {
  name: '',
  dateOfBirth: '',
  category: StudentCategory.ADULT,
  currentBeltColor: BeltColor.WHITE,
  currentBeltStripes: 0,
  joinDate: new Date().toISOString().split('T')[0], // Default to today
  contactEmail: '',
  contactPhone: '',
  profileImageUrl: '',
  notes: '',
  // lastPromotionDate is optional and can be undefined initially
};

interface StudentFormProps {
  student?: Student | null; // For editing
  onSave: (student: Omit<Student, 'id' | 'attendanceRecords' | 'paymentHistory'> | Student) => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState<StudentFormDataType>(initialFormData);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        dateOfBirth: student.dateOfBirth,
        category: student.category,
        currentBeltColor: student.currentBelt.color,
        currentBeltStripes: student.currentBelt.stripes,
        joinDate: student.joinDate,
        contactEmail: student.contactEmail || '',
        contactPhone: student.contactPhone || '',
        profileImageUrl: student.profileImageUrl || '',
        notes: student.notes || '',
        lastPromotionDate: student.lastPromotionDate || undefined,
      });
    } else {
      setFormData(initialFormData); // Reset to initial if no student (e.g., for adding new)
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'currentBeltStripes' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentDataWithBeltObject = {
      ...formData,
      currentBelt: { color: formData.currentBeltColor, stripes: formData.currentBeltStripes },
    };
    // Remove form-specific belt fields before saving, as onSave expects `currentBelt` object
    const { currentBeltColor, currentBeltStripes, ...saveData } = studentDataWithBeltObject;

    if (student) { // Editing
      onSave({ ...student, ...saveData });
    } else { // Adding
      onSave(saveData as Omit<Student, 'id' | 'attendanceRecords' | 'paymentHistory'>);
    }
  };

  const categoryOptions = CATEGORIES.map(cat => ({ value: cat, label: cat }));
  const beltColorOptions = BELT_COLORS.map(color => ({ value: color, label: color }));
  const stripeOptions = Array.from({ length: 5 }, (_, i) => ({ value: i, label: i.toString() })); // 0-4 stripes

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {student && (
        <Input 
          name="studentId" 
          label="ID de Acesso do Aluno (Login)" 
          value={student.id} 
          readOnly 
          disabled 
          className="bg-gray-800 text-academy-text-secondary cursor-not-allowed"
        />
      )}
      <Input name="name" label="Nome Completo" value={formData.name} onChange={handleChange} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="dateOfBirth" label="Data de Nascimento" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
        <Select name="category" label="Categoria" value={formData.category} onChange={handleChange} options={categoryOptions} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select name="currentBeltColor" label="Faixa Atual" value={formData.currentBeltColor} onChange={handleChange} options={beltColorOptions} required />
        <Select name="currentBeltStripes" label="Graus" value={formData.currentBeltStripes.toString()} onChange={handleChange} options={stripeOptions} required />
      </div>
      <Input name="joinDate" label="Data de Inscrição" type="date" value={formData.joinDate} onChange={handleChange} required />
       <Input name="lastPromotionDate" label="Última Promoção (Opcional)" type="date" value={formData.lastPromotionDate || ''} onChange={handleChange} />
      <Input name="contactEmail" label="E-mail" type="email" value={formData.contactEmail} onChange={handleChange} />
      <Input name="contactPhone" label="Telefone" type="tel" value={formData.contactPhone} onChange={handleChange} />
      <Input name="profileImageUrl" label="URL da Imagem de Perfil (Opcional)" value={formData.profileImageUrl} onChange={handleChange} placeholder="https://picsum.photos/200" />
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-academy-text-secondary mb-1">Observações</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-academy-accent focus:border-academy-accent sm:text-sm text-academy-text"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="primary">{student ? 'Salvar Alterações' : 'Adicionar Aluno'}</Button>
      </div>
    </form>
  );
};

export default StudentForm;