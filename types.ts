export enum StudentCategory {
  KIDS = 'Infantil',
  JUVENILE = 'Juvenil',
  ADULT = 'Adulto',
  MASTER = 'Mestre',
}

export enum BeltColor {
  WHITE = 'Branca',
  GREY = 'Cinza', // Kids
  YELLOW = 'Amarela', // Kids
  ORANGE = 'Laranja', // Kids
  GREEN = 'Verde', // Kids
  BLUE = 'Azul',
  PURPLE = 'Roxa',
  BROWN = 'Marrom',
  BLACK = 'Preta',
}

export interface Student {
  id: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  category: StudentCategory;
  currentBelt: Belt;
  joinDate: string; // YYYY-MM-DD
  contactEmail?: string;
  contactPhone?: string;
  profileImageUrl?: string; 
  lastPromotionDate?: string; // YYYY-MM-DD
  attendanceRecords: AttendanceRecord[];
  paymentHistory: PaymentRecord[];
  notes?: string;
}

export interface Belt {
  color: BeltColor;
  stripes: number; // For kids belts and black belt degrees
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  attended: boolean;
  className?: string; // e.g., "Kids Class", "Adults Advanced"
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  month: number; // 1-12
  year: number;
  amount: number;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  paymentDate?: string; // YYYY-MM-DD
}

export interface PromotionRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  fromBelt: Belt;
  toBelt: Belt;
  notes?: string;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption?: string;
  dateAdded: string; // YYYY-MM-DD
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: number; // For sorting and auto-dismiss
  link?: string; // Optional link for navigation
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  author: string;
}

export interface AcademySettings {
  logoUrl: string;
  backgroundUrl: string;
}

export interface AppContextType {
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'attendanceRecords' | 'paymentHistory'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  logAttendance: (studentId: string, record: Omit<AttendanceRecord, 'id'>) => void;
  logPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  promoteStudent: (studentId: string, newBelt: Belt, promotionDate: string) => void;
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  galleryItems: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date' | 'author'>) => void;
  deleteAnnouncement: (id: string) => void;
  academySettings: AcademySettings;
  updateAcademySettings: (settings: Partial<AcademySettings>) => void;
}

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string; // For admin, can be 'admin'; for student, it's their student ID
  name: string;
  role: UserRole;
}