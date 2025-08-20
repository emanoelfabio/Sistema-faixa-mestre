import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { UserGroupIcon, CurrencyDollarIcon, CalendarDaysIcon, StarIcon, ArrowUpRightIcon, BellAlertIcon, GiftIcon, DocumentArrowDownIcon, PencilSquareIcon, ClipboardDocumentListIcon, PlusIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Student, BeltColor, AuthUser, Announcement } from '../types';
import { Link } from 'react-router-dom';
import { isEligibleForPromotion } from '../services/beltService';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { formatDate, calculateAge, exportToCsv, getMonthName } from '../utils/helpers';
import { BELT_COLOR_CLASSES, DEFAULT_PROFILE_IMAGE } from '../constants';
import BeltProgressionIndicator from '../components/students/BeltProgressionIndicator';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass?: string;
  linkTo?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, colorClass = 'bg-academy-secondary', linkTo }) => {
  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-academy-text">{title}</h3>
        <div className={`p-2 ${colorClass === 'bg-academy-secondary' ? 'bg-gray-700' : 'bg-opacity-20 bg-white'} rounded-full text-academy-accent`}>
          {icon}
        </div>
      </div>
      <p className="text-4xl font-bold text-academy-text">{value}</p>
      {trend && <p className="text-sm text-green-400 mt-1 flex items-center"><ArrowUpRightIcon className="h-4 w-4 mr-1"/>{trend}</p>}
    </>
  );
  
  if (linkTo) {
    return (
      <Link to={linkTo} className={`${colorClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 block`}>
        {content}
      </Link>
    );
  }
  return <div className={`${colorClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300`}>{content}</div>;
};


const UpcomingPromotionsWidget: React.FC<{ students: Student[], authUser: AuthUser | null }> = ({ students, authUser }) => {
  let promotableItems: { student: Student, eligibility: ReturnType<typeof isEligibleForPromotion> }[] = [];

  if (authUser?.role === 'admin') {
    promotableItems = students
      .map(s => ({ student: s, eligibility: isEligibleForPromotion(s) }))
      .filter(item => item.eligibility.eligible && item.eligibility.nextBelt)
      .slice(0, 5);
  } else if (authUser?.role === 'student') {
    const studentUser = students.find(s => s.id === authUser.id);
    if (studentUser) {
      const eligibility = isEligibleForPromotion(studentUser);
      if (eligibility.eligible && eligibility.nextBelt) {
        promotableItems.push({ student: studentUser, eligibility });
      }
    }
  }

  if (promotableItems.length === 0) {
    return (
      <div className="bg-academy-secondary p-6 rounded-xl shadow-lg">
        <h4 className="text-lg font-semibold text-academy-text mb-3">
          {authUser?.role === 'student' ? "Minha Próxima Graduação" : "Próximas Promoções"}
        </h4>
        <p className="text-academy-text-secondary">Nenhuma promoção prevista com base nos critérios atuais.</p>
      </div>
    );
  }

  return (
    <div className="bg-academy-secondary p-6 rounded-xl shadow-lg">
      <h4 className="text-lg font-semibold text-academy-text mb-4">
         {authUser?.role === 'student' ? "Minha Próxima Graduação" : "Próximas Promoções"}
      </h4>
      <ul className="space-y-3">
        {promotableItems.map(({ student, eligibility }) => (
          <li key={student.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
            <div>
              <Link to={`/students/${student.id}`} className="font-medium text-academy-text hover:text-academy-accent">{student.name}</Link>
              <p className="text-xs text-academy-text-secondary">Atual: <Badge belt={student.currentBelt} size="sm" /></p>
            </div>
            <div className="text-right">
              <span className="text-sm text-yellow-400">Elegível para:</span>
              {eligibility.nextBelt && <Badge belt={eligibility.nextBelt} size="sm" className="ml-1"/>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const UpcomingBirthdaysWidget: React.FC<{ students: Student[], authUser: AuthUser | null }> = ({ students, authUser }) => {
  const today = new Date();
  let relevantStudents = students;
  if(authUser?.role === 'student') {
    relevantStudents = students.filter(s => s.id === authUser.id);
  }

  const upcomingBirthdays = relevantStudents
    .map(s => {
      const dob = new Date(s.dateOfBirth);
      const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      return { ...s, nextBirthdayDate: nextBirthday, ageNext: calculateAge(s.dateOfBirth) + (nextBirthday.getFullYear() > today.getFullYear() ? 1:0) };
    })
    .sort((a,b) => a.nextBirthdayDate.getTime() - b.nextBirthdayDate.getTime())
    .filter(s => {
        const diffDays = Math.ceil((s.nextBirthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= (authUser?.role === 'student' ? 365 : 30); // Show own birthday anytime, for admin show next 30 days
    })
    .slice(0, authUser?.role === 'student' ? 1 : 5);


  if (upcomingBirthdays.length === 0) {
     return (
      <div className="bg-academy-secondary p-6 rounded-xl shadow-lg">
        <h4 className="text-lg font-semibold text-academy-text mb-3">Próximos Aniversários {authUser?.role === 'admin' && "(Próximos 30 Dias)"}</h4>
        <p className="text-academy-text-secondary">Nenhum aniversário próximo.</p>
      </div>
    );
  }

  return (
    <div className="bg-academy-secondary p-6 rounded-xl shadow-lg">
      <h4 className="text-lg font-semibold text-academy-text mb-4">Próximos Aniversários {authUser?.role === 'admin' && "(Próximos 30 Dias)"}</h4>
      <ul className="space-y-3">
        {upcomingBirthdays.map(student => (
          <li key={student.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
            <Link to={`/students/${student.id}`} className="font-medium text-academy-text hover:text-academy-accent">{student.name}</Link>
            <span className="text-sm text-academy-text-secondary">{formatDate(student.nextBirthdayDate.toISOString(), { month: 'long', day: 'numeric' })} (Completando {student.ageNext} anos)</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AnnouncementsWidget: React.FC<{
  announcements: Announcement[],
  isAdmin: boolean,
  onAdd: () => void,
  onDelete: (id: string) => void
}> = ({ announcements, isAdmin, onAdd, onDelete }) => {
  return (
    <div className="bg-academy-secondary p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-academy-text">Notícias e Anúncios da Academia</h4>
        {isAdmin && (
          <Button onClick={onAdd} size="sm" variant="ghost" leftIcon={<PlusIcon className="h-4 w-4"/>}>
            Novo Anúncio
          </Button>
        )}
      </div>
      {announcements.length > 0 ? (
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
          {announcements.map(ann => (
            <div key={ann.id} className="bg-gray-700 p-4 rounded-lg relative group">
              {isAdmin && (
                 <button
                    onClick={() => onDelete(ann.id)}
                    className="absolute top-2 right-2 z-10 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-red-500 transition-all opacity-0 group-hover:opacity-100"
                    title="Excluir anúncio"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
              )}
              <h5 className="font-bold text-academy-text">{ann.title}</h5>
              <p className="text-xs text-academy-text-secondary mb-2">
                Postado em {formatDate(ann.date)} por {ann.author}
              </p>
              <p className="text-sm text-academy-text-secondary whitespace-pre-wrap">{ann.content}</p>
            </div>
          ))}
        </div>
      ) : (
         <p className="text-academy-text-secondary">Nenhum anúncio postado no momento.</p>
      )}
    </div>
  );
};


const DashboardPage: React.FC = () => {
  const { students, addNotification, announcements, addAnnouncement, deleteAnnouncement } = useAppData();
  const { authUser } = useAuth();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [isConfirmDeleteAnnouncementOpen, setIsConfirmDeleteAnnouncementOpen] = useState(false);
  const [announcementToDeleteId, setAnnouncementToDeleteId] = useState<string | null>(null);


  if (!authUser) return null; // Should be handled by router, but good practice

  const isAdmin = authUser.role === 'admin';

  const handleDownloadStudents = () => {
    const headers = ['ID', 'Nome', 'Data de Nascimento', 'Categoria', 'Faixa', 'Graus', 'Data de Inscrição', 'Email', 'Telefone'];
    const data = students.map(s => [
        s.id,
        s.name,
        s.dateOfBirth,
        s.category,
        s.currentBelt.color,
        s.currentBelt.stripes,
        s.joinDate,
        s.contactEmail || '',
        s.contactPhone || ''
    ]);

    exportToCsv('relatorio_alunos.csv', [headers, ...data]);
    addNotification({ type: 'success', message: 'Relatório de alunos baixado.' });
    setIsReportModalOpen(false);
  };

  const handleDownloadAttendance = () => {
      const headers = ['ID Aluno', 'Nome Aluno', 'Data', 'Presente', 'Turma'];
      const allAttendance = students.flatMap(s => 
          s.attendanceRecords.map(r => ({
              studentId: s.id,
              studentName: s.name,
              ...r
          }))
      );
      const data = allAttendance.map(r => [
          r.studentId,
          r.studentName,
          r.date,
          r.attended ? 'Sim' : 'Não',
          r.className || 'N/A'
      ]);

      exportToCsv('relatorio_presenca.csv', [headers, ...data]);
      addNotification({ type: 'success', message: 'Relatório de presença baixado.' });
      setIsReportModalOpen(false);
  };

  const handleDownloadFinance = () => {
      const headers = ['ID Aluno', 'Nome Aluno', 'Mês', 'Ano', 'Valor', 'Status', 'Data Pagamento'];
      const allPayments = students.flatMap(s => 
          s.paymentHistory.map(p => ({
              studentName: s.name,
              ...p
          }))
      );
      const data = allPayments.map(p => [
          p.studentId,
          p.studentName,
          getMonthName(p.month),
          p.year,
          p.amount.toFixed(2).replace('.', ','),
          p.status,
          p.paymentDate ? formatDate(p.paymentDate) : 'N/A'
      ]);

      exportToCsv('relatorio_financeiro.csv', [headers, ...data]);
      addNotification({ type: 'success', message: 'Relatório financeiro baixado.' });
      setIsReportModalOpen(false);
  };
  
  const handleOpenAnnouncementModal = () => {
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
    setIsAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = () => {
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      addNotification({ type: 'error', message: 'Título e conteúdo são obrigatórios.' });
      return;
    }
    addAnnouncement({ title: newAnnouncementTitle, content: newAnnouncementContent });
    setIsAnnouncementModalOpen(false);
  };
  
  const handleDeleteAnnouncementRequest = (id: string) => {
    setAnnouncementToDeleteId(id);
    setIsConfirmDeleteAnnouncementOpen(true);
  };

  const confirmDeleteAnnouncement = () => {
    if (announcementToDeleteId) {
      deleteAnnouncement(announcementToDeleteId);
    }
    setIsConfirmDeleteAnnouncementOpen(false);
    setAnnouncementToDeleteId(null);
  };


  // Admin specific data
  const totalStudents = students.length;
  const totalRevenue = students.flatMap(s => s.paymentHistory).filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.amount, 0);
  const activeAttendanceLastMonth = students.reduce((count, student) => {
    const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1);
    return student.attendanceRecords.some(r => r.attended && new Date(r.date) > lastMonth) ? count + 1 : count;
  }, 0);

  // Student specific data
  const loggedInStudent = authUser.role === 'student' ? students.find(s => s.id === authUser.id) : null;
  
  return (
    <div className="space-y-8">
      {authUser.role === 'admin' && (
        <>
          <div className="p-4 bg-academy-secondary rounded-lg shadow flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-semibold text-academy-text">Painel do Administrador</h2>
            <Button 
              onClick={() => setIsReportModalOpen(true)}
              leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
              variant="secondary"
            >
              Baixar Relatórios
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total de Alunos" value={totalStudents} icon={<UserGroupIcon className="h-6 w-6" />} trend={`+2 esta semana`} linkTo="/students"/>
            <StatCard title="Receita Mensal" value={`R$${totalRevenue.toFixed(2).replace('.', ',')}`} icon={<CurrencyDollarIcon className="h-6 w-6" />} colorClass="bg-green-600" trend="+10% vs mês passado" linkTo="/finance"/>
            <StatCard title="Presença Ativa" value={activeAttendanceLastMonth} icon={<CalendarDaysIcon className="h-6 w-6" />} trend="Últimos 30 dias" linkTo="/attendance"/>
            <StatCard title="Ações Pendentes" value={3} icon={<BellAlertIcon className="h-6 w-6" />} colorClass="bg-yellow-500" />
          </div>
        </>
      )}

      {authUser.role === 'student' && loggedInStudent && (
        <div className="space-y-6">
            {/* Student Profile Header */}
            <div className="bg-academy-secondary p-6 rounded-lg shadow-xl flex flex-col md:flex-row items-center gap-6">
                <img 
                    src={loggedInStudent.profileImageUrl || DEFAULT_PROFILE_IMAGE} 
                    alt={loggedInStudent.name} 
                    className="w-28 h-28 rounded-full object-cover border-4 border-academy-accent shadow-md"
                    onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_IMAGE)}
                />
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-academy-text">{loggedInStudent.name}</h2>
                    <p className="text-academy-text-secondary">{loggedInStudent.category} - {calculateAge(loggedInStudent.dateOfBirth)} anos</p>
                    <div className="mt-2 flex items-center justify-center md:justify-start gap-4">
                        <Badge belt={loggedInStudent.currentBelt} size="md" />
                        <span className="text-xs text-academy-text-secondary">Membro desde: {formatDate(loggedInStudent.joinDate)}</span>
                    </div>
                </div>
                <Link to={`/students/${loggedInStudent.id}`}>
                    <Button variant="secondary" leftIcon={<PencilSquareIcon className="h-5 w-5"/>}>Ver Perfil Completo</Button>
                </Link>
            </div>

            {/* Belt Progression */}
            <BeltProgressionIndicator student={loggedInStudent} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Instructor Notes */}
                <div className="bg-academy-secondary p-5 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-3 text-academy-text flex items-center">
                        <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-academy-accent"/>
                        Observações do Professor
                    </h3>
                    {loggedInStudent.notes ? (
                        <p className="text-academy-text-secondary whitespace-pre-wrap bg-gray-700 p-3 rounded-md text-sm">{loggedInStudent.notes}</p>
                    ) : (
                        <p className="text-academy-text-secondary italic">Nenhuma observação do professor no momento.</p>
                    )}
                </div>

                {/* Recent Attendance */}
                <div className="bg-academy-secondary p-5 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-semibold text-academy-text flex items-center">
                            <CalendarDaysIcon className="h-6 w-6 mr-2 text-academy-accent"/>
                            Histórico de Presença Recente
                        </h3>
                        <Link to="/attendance" className="text-sm text-academy-accent hover:underline">Ver tudo</Link>
                    </div>
                    {loggedInStudent.attendanceRecords.length > 0 ? (
                        <ul className="max-h-60 overflow-y-auto space-y-2 pr-2">
                            {[...loggedInStudent.attendanceRecords].reverse().slice(0, 5).map(record => (
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
                    ) : (
                        <p className="text-academy-text-secondary italic">Nenhum registro de presença ainda.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingPromotionsWidget students={students} authUser={authUser} />
        <UpcomingBirthdaysWidget students={students} authUser={authUser} />
      </div>
      
      <AnnouncementsWidget
        announcements={announcements}
        isAdmin={isAdmin}
        onAdd={handleOpenAnnouncementModal}
        onDelete={handleDeleteAnnouncementRequest}
      />

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Baixar Relatórios">
        <div className="space-y-4">
          <p className="text-academy-text-secondary">Selecione o relatório que deseja baixar em formato CSV.</p>
          <Button
            onClick={handleDownloadStudents}
            leftIcon={<UserGroupIcon className="h-5 w-5" />}
            className="w-full justify-start text-left p-3"
            variant="secondary"
          >
            Relatório de Alunos
          </Button>
          <Button
            onClick={handleDownloadAttendance}
            leftIcon={<CalendarDaysIcon className="h-5 w-5" />}
            className="w-full justify-start text-left p-3"
            variant="secondary"
          >
            Relatório de Presença
          </Button>
          <Button
            onClick={handleDownloadFinance}
            leftIcon={<CurrencyDollarIcon className="h-5 w-5" />}
            className="w-full justify-start text-left p-3"
            variant="secondary"
          >
            Relatório Financeiro
          </Button>
        </div>
      </Modal>

      {isAdmin && (
        <>
          <Modal isOpen={isAnnouncementModalOpen} onClose={() => setIsAnnouncementModalOpen(false)} title="Adicionar Novo Anúncio">
              <div className="space-y-4">
                  <Input
                      label="Título do Anúncio"
                      value={newAnnouncementTitle}
                      onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                      placeholder="Ex: Feriado na Próxima Semana"
                      required
                  />
                  <div>
                      <label htmlFor="announcementContent" className="block text-sm font-medium text-academy-text-secondary mb-1">
                          Conteúdo
                      </label>
                      <textarea
                          id="announcementContent"
                          rows={5}
                          value={newAnnouncementContent}
                          onChange={(e) => setNewAnnouncementContent(e.target.value)}
                          className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-academy-accent focus:border-academy-accent sm:text-sm text-academy-text"
                          placeholder="Detalhes do anúncio..."
                          required
                      />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                      <Button variant="secondary" onClick={() => setIsAnnouncementModalOpen(false)}>Cancelar</Button>
                      <Button variant="primary" onClick={handleSaveAnnouncement}>Publicar Anúncio</Button>
                  </div>
              </div>
          </Modal>

          <Modal isOpen={isConfirmDeleteAnnouncementOpen} onClose={() => setIsConfirmDeleteAnnouncementOpen(false)} title="Confirmar Exclusão" size="sm">
            <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-academy-text-secondary mb-4">Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.</p>
                <div className="flex justify-center space-x-4">
                    <Button variant="secondary" onClick={() => setIsConfirmDeleteAnnouncementOpen(false)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmDeleteAnnouncement}>Excluir Anúncio</Button>
                </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DashboardPage;