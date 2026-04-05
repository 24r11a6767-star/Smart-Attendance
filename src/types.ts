export type Section = 'Data Science A' | 'Data Science B' | 'Data Science C';

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  section: Section;
  deviceId: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  sections: Section[];
}

export interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  section: Section;
  subject: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  timeSlotId: string;
  section: Section;
  presentStudentIds: string[];
  totalStudents: number;
}

export type UserRole = 'teacher' | 'student';

export interface AuthState {
  user: any | null;
  role: UserRole | null;
}
