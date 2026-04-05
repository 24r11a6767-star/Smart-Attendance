import { Section, Student, Teacher, TimetableEntry } from './types';

export const SECTIONS: Section[] = ['Data Science A', 'Data Science B', 'Data Science C'];

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Alice Johnson', rollNumber: 'DS-001', section: 'Data Science A', deviceId: 'BT-ADDR-001' },
  { id: '2', name: 'Bob Smith', rollNumber: 'DS-002', section: 'Data Science A', deviceId: 'BT-ADDR-002' },
  { id: '3', name: 'Charlie Brown', rollNumber: 'DS-003', section: 'Data Science A', deviceId: 'BT-ADDR-003' },
  { id: '4', name: 'David Wilson', rollNumber: 'DS-004', section: 'Data Science B', deviceId: 'BT-ADDR-004' },
  { id: '5', name: 'Eve Davis', rollNumber: 'DS-005', section: 'Data Science B', deviceId: 'BT-ADDR-005' },
  { id: '6', name: 'Frank Miller', rollNumber: 'DS-006', section: 'Data Science C', deviceId: 'BT-ADDR-006' },
  { id: '7', name: 'Grace Lee', rollNumber: 'DS-007', section: 'Data Science C', deviceId: 'BT-ADDR-007' },
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Dr. Sarah Connor', email: 'sarah@university.edu', sections: ['Data Science A', 'Data Science B'] },
  { id: 't2', name: 'Prof. John Smith', email: 'john@university.edu', sections: ['Data Science C'] },
];

export const MOCK_TIMETABLE: TimetableEntry[] = [
  { id: 'tt1', day: 'Monday', startTime: '09:00', endTime: '10:00', section: 'Data Science A', subject: 'Machine Learning' },
  { id: 'tt2', day: 'Monday', startTime: '10:00', endTime: '11:00', section: 'Data Science B', subject: 'Data Structures' },
  { id: 'tt3', day: 'Tuesday', startTime: '11:00', endTime: '12:00', section: 'Data Science A', subject: 'Statistics' },
  { id: 'tt4', day: 'Wednesday', startTime: '09:00', endTime: '10:00', section: 'Data Science C', subject: 'Python Programming' },
  { id: 'tt5', day: 'Thursday', startTime: '14:00', endTime: '15:00', section: 'Data Science A', subject: 'Neural Networks' },
];
