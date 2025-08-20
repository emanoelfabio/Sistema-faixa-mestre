import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Student, Belt, AttendanceRecord, PaymentRecord, GalleryItem, AppNotification, AppContextType, StudentCategory, BeltColor, Announcement, AcademySettings } from '../types';
import { DEFAULT_PROFILE_IMAGE, GALLERY_PLACEHOLDER_IMAGE } from '../constants';
import { calculateAge, generateId, generateStudentId } from '../utils/helpers';
import { getNextBelt } from '../services/beltService';


const AppContext = createContext<AppContextType | undefined>(undefined);

const initialStudents: Student[] = [
  {
    id: 's1', name: 'Alice Wonderland', dateOfBirth: '2016-05-10', category: StudentCategory.KIDS,
    currentBelt: { color: BeltColor.WHITE, stripes: 2 }, joinDate: '2023-01-15',
    profileImageUrl: `${DEFAULT_PROFILE_IMAGE}?random=1`, attendanceRecords: [], paymentHistory: [], lastPromotionDate: '2023-01-15',
  },
  {
    id: 's2', name: 'Bob The Builder', dateOfBirth: '1990-08-20', category: StudentCategory.ADULT,
    currentBelt: { color: BeltColor.BLUE, stripes: 0 }, joinDate: '2021-06-01',
    profileImageUrl: `${DEFAULT_PROFILE_IMAGE}?random=2`, attendanceRecords: [], paymentHistory: [], lastPromotionDate: '2022-06-01',
  },
  {
    id: 's3', name: 'Charlie Brown', dateOfBirth: '2007-11-05', category: StudentCategory.JUVENILE,
    currentBelt: { color: BeltColor.YELLOW, stripes: 3 }, joinDate: '2022-09-01', // Yellow is a kids belt, juvenile might be blue
    profileImageUrl: `${DEFAULT_PROFILE_IMAGE}?random=3`, attendanceRecords: [], paymentHistory: [], lastPromotionDate: '2023-03-01',
  },
   {
    id: 's4', name: 'Diana Prince', dateOfBirth: '1985-03-22', category: StudentCategory.ADULT,
    currentBelt: { color: BeltColor.PURPLE, stripes: 1 }, joinDate: '2019-01-10',
    profileImageUrl: `${DEFAULT_PROFILE_IMAGE}?random=4`, attendanceRecords: [], paymentHistory: [], lastPromotionDate: '2023-07-15',
  },
];

const initialGalleryItems: GalleryItem[] = [
    { id: 'g1', type: 'photo', url: `${GALLERY_PLACEHOLDER_IMAGE.replace('{id}', 'g1')}`, caption: 'Diversão no Acampamento de Verão!', dateAdded: '2023-07-20' },
    { id: 'g2', type: 'photo', url: `${GALLERY_PLACEHOLDER_IMAGE.replace('{id}', 'g2')}`, caption: 'Cerimônia de Graduação', dateAdded: '2023-06-15' },
    { id: 'g3', type: 'video', url: 'https://picsum.photos/300/200', caption: 'Destaques do Treino (Placeholder)', dateAdded: '2023-05-10' },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Torneio Interacademias!',
    content: 'Não se esqueça do torneio interacademias no próximo sábado! Inscrições na recepção. Contamos com a sua presença para torcer pelos nossos atletas!',
    date: '2024-05-20',
    author: 'Administrador'
  },
  {
    id: 'a2',
    title: 'Feriado - Academia Fechada',
    content: 'Informamos que a academia estará fechada na próxima segunda-feira devido ao feriado. Retornaremos às atividades normais na terça-feira.',
    date: '2024-05-18',
    author: 'Administrador'
  }
];


export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialGalleryItems);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [academySettings, setAcademySettings] = useState<AcademySettings>(() => {
    const savedSettings = localStorage.getItem('academySettings');
    return savedSettings ? JSON.parse(savedSettings) : { logoUrl: '', backgroundUrl: '' };
  });

  useEffect(() => {
    // Auto-dismiss notifications after some time
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1)); // Remove the oldest notification
      }, 5000); // Dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const updateAcademySettings = useCallback((settings: Partial<AcademySettings>) => {
    setAcademySettings(prev => {
      const newSettings = { ...prev, ...settings };
      localStorage.setItem('academySettings', JSON.stringify(newSettings));
      return newSettings;
    });
    addNotification({type: 'success', message: 'Configurações visuais atualizadas.'})
  }, []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: generateId(),
      timestamp: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const addStudent = useCallback((studentData: Omit<Student, 'id' | 'attendanceRecords' | 'paymentHistory'>) => {
    setStudents(prevStudents => {
        const newStudent: Student = {
            ...studentData,
            id: generateStudentId(studentData.name, prevStudents),
            profileImageUrl: studentData.profileImageUrl || `${DEFAULT_PROFILE_IMAGE}?random=${Math.random()}`,
            attendanceRecords: [],
            paymentHistory: [],
        };
        addNotification({ type: 'success', message: `Aluno(a) ${newStudent.name} adicionado(a). ID de Acesso: ${newStudent.id}` });
        return [...prevStudents, newStudent];
    });
  }, [addNotification]);

  const updateStudent = useCallback((updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    addNotification({ type: 'info', message: `Aluno(a) ${updatedStudent.name} atualizado(a).` });
  }, [addNotification]);
  
  const deleteStudent = useCallback((studentId: string) => {
    setStudents(prev => {
        const studentToDelete = prev.find(s => s.id === studentId);
        if(studentToDelete) {
             addNotification({ type: 'warning', message: `Aluno(a) ${studentToDelete.name} foi removido(a).` });
        }
        return prev.filter(s => s.id !== studentId);
    });
  }, [addNotification]);

  const getStudentById = useCallback((id: string) => {
    return students.find(s => s.id === id);
  }, [students]);

  const logAttendance = useCallback((studentId: string, record: Omit<AttendanceRecord, 'id'>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, attendanceRecords: [...s.attendanceRecords, { ...record, id: generateId() }] };
      }
      return s;
    }));
    addNotification({ type: 'success', message: `Presença registrada para o(a) aluno(a).` });
  }, [addNotification]);

  const logPayment = useCallback((payment: Omit<PaymentRecord, 'id'>) => {
     setStudents(prevStudents => {
        return prevStudents.map(student => {
            if (student.id === payment.studentId) {
                const updatedPaymentHistory = [...student.paymentHistory, { ...payment, id: generateId() }];
                return { ...student, paymentHistory: updatedPaymentHistory };
            }
            return student;
        });
    });
    addNotification({ type: 'success', message: `Pagamento de R$${payment.amount.toFixed(2).replace('.', ',')} registrado.` });
  }, [addNotification]);
  
  const promoteStudent = useCallback((studentId: string, newBelt: Belt, promotionDate: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        // Here you might want to store PromotionRecord as well
        addNotification({type: 'success', message: `${s.name} promovido(a) para a faixa ${newBelt.color}${newBelt.stripes > 0 ? ' com ' + newBelt.stripes + ' grau(s)' : ''}!`});
        return { ...s, currentBelt: newBelt, lastPromotionDate: promotionDate };
      }
      return s;
    }));
  }, [addNotification]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addGalleryItem = useCallback((item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: generateId(),
      url: item.url || `${GALLERY_PLACEHOLDER_IMAGE.replace('{id}', generateId())}`
    };
    setGalleryItems(prev => [newItem, ...prev]);
    addNotification({ type: 'success', message: `Item de mídia "${item.caption || 'Novo Item'}" adicionado à galeria.` });
  }, [addNotification]);

  const deleteGalleryItem = useCallback((id: string) => {
    setGalleryItems(prev => prev.filter(item => item.id !== id));
    addNotification({ type: 'warning', message: 'Item removido da galeria.' });
  }, [addNotification]);

  const addAnnouncement = useCallback((announcementData: Omit<Announcement, 'id' | 'date' | 'author'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      author: 'Administrador',
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    addNotification({ type: 'success', message: `Anúncio "${newAnnouncement.title}" publicado.` });
  }, [addNotification]);

  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
    addNotification({ type: 'warning', message: 'Anúncio removido.' });
  }, [addNotification]);


  return (
    <AppContext.Provider value={{ students, addStudent, updateStudent, deleteStudent, getStudentById, logAttendance, logPayment, promoteStudent, notifications, addNotification, dismissNotification, galleryItems, addGalleryItem, deleteGalleryItem, announcements, addAnnouncement, deleteAnnouncement, academySettings, updateAcademySettings }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};