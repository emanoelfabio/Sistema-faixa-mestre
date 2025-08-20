
import React, { useState, useMemo, ChangeEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { Student, PaymentRecord, AuthUser } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import { formatDate, getMonthName } from '../utils/helpers';
import { BanknotesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const FinancePage: React.FC = () => {
  const { students, logPayment, addNotification } = useAppData();
  const { authUser } = useAuth(); // Get authenticated user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMonth, setPaymentMonth] = useState<number>(new Date().getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  const isAdmin = authUser?.role === 'admin';

  const handleOpenModal = (studentId?: string) => {
    if (!isAdmin) return; // Only admin can open this modal
    setSelectedStudentId(studentId || (students.length > 0 ? students[0].id : ''));
    setPaymentAmount(100);
    setPaymentMonth(new Date().getMonth() + 1);
    setPaymentYear(new Date().getFullYear());
    setIsModalOpen(true);
  };

  const handleLogPayment = () => {
    if (!isAdmin) return;
    if (!selectedStudentId) {
      addNotification({type: 'error', message: 'Por favor, selecione um aluno.'});
      return;
    }
    if (paymentAmount <= 0) {
      addNotification({type: 'error', message: 'O valor do pagamento deve ser positivo.'});
      return;
    }
    const paymentData: Omit<PaymentRecord, 'id'> = {
      studentId: selectedStudentId,
      amount: paymentAmount,
      month: paymentMonth,
      year: paymentYear,
      status: 'Pago',
      paymentDate: new Date().toISOString().split('T')[0],
    };
    logPayment(paymentData);
    setIsModalOpen(false);
  };
  
  const studentOptions = students.map(s => ({ value: s.id, label: s.name }));
  const monthOptions = [{value: '', label: 'Todos os Meses'}, ...Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: getMonthName(i + 1) }))];
  const currentYear = new Date().getFullYear();
  const yearOptions = [{value: '', label: 'Todos os Anos'}, ...Array.from({ length: 5 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }))];


  const allPayments = useMemo(() => {
    let payments: (PaymentRecord & { studentName: string })[] = [];
    const sourceStudents = isAdmin ? students : students.filter(s => s.id === authUser?.id);

    sourceStudents.forEach(student => {
      student.paymentHistory.forEach(p => {
        payments.push({ ...p, studentName: student.name });
      });
    });
    
    if (filterMonth) {
      payments = payments.filter(p => p.month === parseInt(filterMonth));
    }
    if (filterYear) {
      payments = payments.filter(p => p.year === parseInt(filterYear));
    }
    
    return payments.sort((a,b) => new Date(b.paymentDate || b.id).getTime() - new Date(a.paymentDate || a.id).getTime());
  }, [students, filterMonth, filterYear, isAdmin, authUser]);

  const totalPaidFiltered = useMemo(() => {
    return allPayments.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.amount, 0);
  }, [allPayments]);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-academy-secondary rounded-lg shadow flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold text-academy-text">
          {isAdmin ? 'Visão Geral Financeira' : 'Meu Histórico de Pagamentos'}
        </h2>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} leftIcon={<BanknotesIcon className="h-5 w-5" />}>
            Registrar Novo Pagamento
          </Button>
        )}
      </div>
      
      <div className="p-4 bg-academy-secondary rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Filtrar Pagamentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Mês" options={monthOptions} value={filterMonth} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterMonth(e.target.value)} placeholder="Todos os Meses" />
            <Select label="Ano" options={yearOptions} value={filterYear} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterYear(e.target.value)} placeholder="Todos os Anos" />
             <div className="md:col-start-3 flex items-end">
                <div className="p-3 bg-gray-700 rounded-md w-full">
                    <p className="text-sm text-academy-text-secondary">Total Pago (Filtrado):</p>
                    <p className="text-2xl font-bold text-green-400">R${totalPaidFiltered.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>
        </div>
      </div>


      <div className="bg-academy-secondary rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Nome do Aluno</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Valor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Período</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Data do Pagamento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-academy-text-secondary uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-academy-secondary divide-y divide-gray-700">
            {allPayments.length > 0 ? allPayments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-academy-text">{payment.studentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-academy-text">R${payment.amount.toFixed(2).replace('.', ',')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-academy-text-secondary">{getMonthName(payment.month)} {payment.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-academy-text-secondary">{payment.paymentDate ? formatDate(payment.paymentDate) : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    payment.status === 'Pago' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 
                    payment.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
                  }`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-academy-text-secondary">
                  {isAdmin ? 'Nenhum registro de pagamento corresponde aos seus filtros.' : 'Você не tem registros de pagamento correspondentes aos filtros.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    {isAdmin && (
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Novo Pagamento">
        <div className="space-y-4">
          <Select label="Aluno" options={studentOptions} value={selectedStudentId} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedStudentId(e.target.value)} placeholder="Selecione um aluno" />
          <Input label="Valor (R$)" type="number" step="0.01" value={paymentAmount === 0 ? '' : paymentAmount.toString()} onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Mês de Referência" options={Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: getMonthName(i + 1) }))} value={paymentMonth.toString()} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPaymentMonth(parseInt(e.target.value))} />
            <Select label="Ano de Referência" options={Array.from({ length: 5 }, (_, i) => ({ value: (currentYear - i).toString(), label: (currentYear - i).toString() }))} value={paymentYear.toString()} onChange={(e: ChangeEvent<HTMLSelectElement>) => setPaymentYear(parseInt(e.target.value))} />
          </div>
          <p className="text-xs text-academy-text-secondary">O pagamento será marcado como 'Pago' com a data de hoje.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleLogPayment}>Registrar Pagamento</Button>
          </div>
        </div>
      </Modal>
    )}
    </div>
  );
};

export default FinancePage;
