import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { Student, Belt, AttendanceRecord, PaymentRecord, AuthUser } from '../types';
import { DEFAULT_PROFILE_IMAGE } from '../constants';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { calculateAge, formatDate, getMonthName } from '../utils/helpers';
import { ArrowLeftIcon, PencilIcon, CalendarDaysIcon, CurrencyDollarIcon, UserPlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import BeltProgressionIndicator from '../components/students/BeltProgressionIndicator';
import { isEligibleForPromotion } from '../services/beltService';
import StudentForm from '../components/students/StudentForm'; // Import StudentForm

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { getStudentById, logAttendance, logPayment, promoteStudent, addNotification, updateStudent, students } = useAppData(); // Declare students here
  const { authUser } = useAuth(); // Get authenticated user
  
  const [student, setStudent] = useState<Student | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For editing student
  
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [className, setClassName] = useState('Aula Geral');
  
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMonth, setPaymentMonth] = useState(new Date().getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear());
  
  const [nextBeltToPromote, setNextBeltToPromote] = useState<Belt | null>(null);
  const eligibility = student ? isEligibleForPromotion(student) : { eligible: false, nextBelt: undefined, reason: '' };

  const isOwnProfile = authUser?.role === 'student' && authUser.id === studentId;
  const isAdmin = authUser?.role === 'admin';


  useEffect(() => {
    if (studentId) {
      const foundStudent = getStudentById(studentId);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        addNotification({type: 'error', message: `Aluno com ID ${studentId} não foi encontrado.`});
        navigate(isAdmin ? '/students' : '/dashboard'); 
      }
    }
  }, [studentId, getStudentById, navigate, addNotification, students, isAdmin]); // Added students to dependency array

  useEffect(() => {
    if (student) {
      const currentEligibility = isEligibleForPromotion(student);
      if (currentEligibility.eligible && currentEligibility.nextBelt) {
        setNextBeltToPromote(currentEligibility.nextBelt);
      } else {
        setNextBeltToPromote(null);
      }
    }
  }, [student]);


  const handleLogAttendance = () => {
    if (student && (isAdmin || isOwnProfile)) { // Students can log their own attendance
      const newRecord: Omit<AttendanceRecord, 'id'> = { date: attendanceDate, attended: true, className };
      logAttendance(student.id, newRecord);
      setIsAttendanceModalOpen(false);
    }
  };

  const handleLogPayment = () => {
    if (student && isAdmin && paymentAmount > 0) { // Only admin can log payments
      const newPayment: Omit<PaymentRecord, 'id'> = { studentId: student.id, amount: paymentAmount, month: paymentMonth, year: paymentYear, status: 'Pago', paymentDate: new Date().toISOString().split('T')[0] };
      logPayment(newPayment);
      setIsPaymentModalOpen(false);
    } else if (paymentAmount <= 0) {
        addNotification({type: 'error', message: 'O valor do pagamento deve ser maior que 0.'});
    }
  };
  
  const handlePromoteStudent = () => {
    if (student && nextBeltToPromote && isAdmin) { // Only admin can promote
      promoteStudent(student.id, nextBeltToPromote, new Date().toISOString().split('T')[0]);
      setIsPromotionModalOpen(false);
    }
  };
  
  const handleSaveStudent = (studentData: Student) => { // For editing
    if (isAdmin) {
        updateStudent(studentData);
        setIsEditModalOpen(false);
        // Student state will update via useEffect hook that depends on `students` from useAppData
    }
  };


  if (!student) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academy-accent mx-auto"></div>
        <p className="mt-4 text-lg">Carregando detalhes do aluno...</p>
      </div>
    );
  }

  const age = calculateAge(student.dateOfBirth);
 
  return (
    <div className="space-y-6">
      <button onClick={() => navigate(isAdmin ? '/students' : '/dashboard')} className="inline-flex items-center text-academy-accent hover:underline mb-4">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Voltar
      </button>

      <div className="bg-academy-secondary p-6 rounded-lg shadow-xl flex flex-col md:flex-row items-center gap-6">
        <img 
            src={student.profileImageUrl || DEFAULT_PROFILE_IMAGE} 
            alt={student.name} 
            className="w-32 h-32 rounded-full object-cover border-4 border-academy-accent shadow-md"
            onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_IMAGE)}
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-academy-text">{student.name}</h2>
          <p className="text-academy-text-secondary">{student.category} - {age} anos</p>
          <p className="text-sm font-mono bg-gray-700 inline-block px-2 py-1 rounded mt-2 text-academy-text-secondary">ID de Acesso: {student.id}</p>
          <div className="mt-2">
            <Badge belt={student.currentBelt} size="md" />
          </div>
          <p className="text-xs text-academy-text-secondary mt-1">Inscrito em: {formatDate(student.joinDate)}</p>
          {student.lastPromotionDate && <p className="text-xs text-academy-text-secondary">Última Promoção: {formatDate(student.lastPromotionDate)}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          {(isAdmin || isOwnProfile) && ( /* Students can log own attendance */
            <Button variant="secondary" onClick={() => setIsAttendanceModalOpen(true)} leftIcon={<CalendarDaysIcon className="h-5 w-5"/>}>Registrar Minha Presença</Button>
          )}
          {isAdmin && ( /* Only admin logs payments and promotes */
            <>
              <Button variant="secondary" onClick={() => setIsPaymentModalOpen(true)} leftIcon={<CurrencyDollarIcon className="h-5 w-5"/>}>Registrar Pagamento</Button>
              {eligibility.eligible && eligibility.nextBelt && (
                <Button variant="primary" onClick={() => { 
                  if (eligibility.nextBelt) {
                    setNextBeltToPromote(eligibility.nextBelt); 
                    setIsPromotionModalOpen(true); 
                  }
                }} leftIcon={<SparklesIcon className="h-5 w-5"/>}>Promover</Button>
              )}
               <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} leftIcon={<PencilIcon className="h-5 w-5"/>}>Editar Aluno</Button>
            </>
          )}
        </div>
      </div>

      <BeltProgressionIndicator student={student} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-academy-secondary p-5 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-academy-text">Histórico de Presença ({student.attendanceRecords.length})</h3>
          {student.attendanceRecords.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {[...student.attendanceRecords].reverse().map(record => (
                <li key={record.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <div>
                    <span className="text-sm text-academy-text">{formatDate(record.date)}</span>
                    <span className="text-xs text-academy-text-secondary ml-2">({record.className || 'Aula'})</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${record.attended ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {record.attended ? 'Presente' : 'Ausente'}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-academy-text-secondary">Nenhum registro de presença ainda.</p>}
        </div>

        <div className="bg-academy-secondary p-5 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-academy-text">Histórico de Pagamentos ({student.paymentHistory.length})</h3>
          {student.paymentHistory.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {[...student.paymentHistory].reverse().map(payment => (
                <li key={payment.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <div>
                    <span className="text-sm text-academy-text">R${payment.amount.toFixed(2).replace('.', ',')} - {getMonthName(payment.month)} {payment.year}</span>
                    {payment.paymentDate && <span className="text-xs text-academy-text-secondary ml-2">(Pago em: {formatDate(payment.paymentDate)})</span>}
                  </div>
                  <Badge 
                    text={payment.status} 
                    colorClass={payment.status === 'Pago' ? 'bg-green-500 text-white' : payment.status === 'Pendente' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          ) : <p className="text-academy-text-secondary">Nenhum registro de pagamento ainda.</p>}
        </div>
      </div>
      
      {isAdmin && student.notes && (
        <div className="bg-academy-secondary p-5 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-academy-text">Observações do Instrutor</h3>
            <p className="text-academy-text-secondary whitespace-pre-wrap">{student.notes}</p>
        </div>
       )}

      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title="Registrar Presença">
        <div className="space-y-4">
          <Input label="Data da Aula" type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
          <Input label="Nome da Turma" type="text" value={className} onChange={e => setClassName(e.target.value)} placeholder="ex: Infantil Iniciante, Adulto Sparring"/>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsAttendanceModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleLogAttendance}>Marcar como Presente</Button>
          </div>
        </div>
      </Modal>

      {isAdmin && (
        <>
          <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Registrar Pagamento">
            <div className="space-y-4">
              <Input label="Valor" type="number" value={paymentAmount === 0 ? '' : paymentAmount.toString()} onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Mês (1-12)" type="number" min="1" max="12" value={paymentMonth} onChange={e => setPaymentMonth(parseInt(e.target.value))} />
                <Input label="Ano" type="number" value={paymentYear} onChange={e => setPaymentYear(parseInt(e.target.value))} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleLogPayment}>Registrar Pagamento</Button>
              </div>
            </div>
          </Modal>
          
          <Modal isOpen={isPromotionModalOpen} onClose={() => setIsPromotionModalOpen(false)} title="Confirmar Promoção">
            {nextBeltToPromote && (
              <div className="space-y-4">
                <p className="text-academy-text">
                  Tem certeza que deseja promover {student.name} de <Badge belt={student.currentBelt} /> para <Badge belt={nextBeltToPromote} />?
                </p>
                <p className="text-sm text-academy-text-secondary">A promoção será registrada com a data de hoje.</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setIsPromotionModalOpen(false)}>Cancelar</Button>
                  <Button variant="primary" onClick={handlePromoteStudent}>Confirmar Promoção</Button>
                </div>
              </div>
            )}
          </Modal>
          
           <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Detalhes do Aluno" size="lg">
             <StudentForm student={student} onSave={(updatedStudentData) => handleSaveStudent(updatedStudentData as Student)} onCancel={() => setIsEditModalOpen(false)} />
          </Modal>
        </>
      )}
    </div>
  );
};

export default StudentDetailPage;