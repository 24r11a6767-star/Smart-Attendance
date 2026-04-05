import React, { useState, useEffect } from 'react';
import { 
  Bluetooth, 
  Users, 
  Calendar, 
  BarChart3, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Plus,
  Search,
  Clock,
  BookOpen,
  UserCheck,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { cn, generateDeviceId } from './lib/utils';
import { 
  Section, 
  Student, 
  Teacher, 
  TimetableEntry, 
  AttendanceRecord, 
  UserRole 
} from './types';
import { 
  SECTIONS, 
  MOCK_STUDENTS, 
  MOCK_TEACHERS, 
  MOCK_TIMETABLE 
} from './constants';

// --- Components ---

const Button = ({ className, variant = 'primary', ...props }: any) => {
  const variants: any = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
    outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  };
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

const Card = ({ children, className }: any) => (
  <div className={cn('bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);

const Input = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
      <input 
        className={cn(
          "w-full rounded-lg border border-gray-200 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          Icon ? "pl-10 pr-4" : "px-4"
        )}
        {...props}
      />
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing');
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedDevices, setDetectedDevices] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimetableEntry | null>(null);

  // Initialize data
  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    const storedAttendance = localStorage.getItem('attendanceRecords');
    
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      setStudents(MOCK_STUDENTS);
      localStorage.setItem('students', JSON.stringify(MOCK_STUDENTS));
    }

    if (storedAttendance) {
      setAttendanceRecords(JSON.parse(storedAttendance));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (role === 'teacher') {
      const teacher = MOCK_TEACHERS.find(t => t.email === email);
      if (teacher) {
        setUser(teacher);
        setView('dashboard');
      } else {
        alert('Invalid teacher credentials');
      }
    } else {
      const student = students.find(s => s.rollNumber === email);
      if (student) {
        setUser(student);
        setView('dashboard');
      } else {
        alert('Invalid student credentials');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const rollNumber = formData.get('rollNumber') as string;
    const section = formData.get('section') as Section;
    const deviceId = generateDeviceId();

    const newStudent: Student = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      rollNumber,
      section,
      deviceId
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    setUser(newStudent);
    setRole('student');
    setView('dashboard');
  };

  const startScanning = (slot: TimetableEntry) => {
    setSelectedSlot(slot);
    setScanning(true);
    setScanProgress(0);
    setDetectedDevices([]);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          finishScanning(slot);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const finishScanning = (slot: TimetableEntry) => {
    // Simulate finding some students from that section
    const sectionStudents = students.filter(s => s.section === slot.section);
    // Randomly pick some to be present (e.g., 80-100%)
    const present = sectionStudents.filter(() => Math.random() > 0.2);
    
    setDetectedDevices(present.map(s => s.deviceId));
    
    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substring(2, 9),
      date: format(new Date(), 'yyyy-MM-dd'),
      timeSlotId: slot.id,
      section: slot.section,
      presentStudentIds: present.map(s => s.id),
      totalStudents: sectionStudents.length
    };

    const updatedRecords = [newRecord, ...attendanceRecords];
    setAttendanceRecords(updatedRecords);
    localStorage.setItem('attendanceRecords', JSON.stringify(updatedRecords));
    
    setTimeout(() => {
      setScanning(false);
      setActiveTab('analysis');
    }, 1500);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Section', 'Subject', 'Total', 'Present', 'Percentage'];
    const rows = attendanceRecords.map(r => {
      const slot = MOCK_TIMETABLE.find(t => t.id === r.timeSlotId);
      return [
        r.date,
        r.section,
        slot?.subject || 'N/A',
        r.totalStudents,
        r.presentStudentIds.length,
        ((r.presentStudentIds.length / r.totalStudents) * 100).toFixed(1) + '%'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Views ---

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
              <Bluetooth className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
              Smart Attendance <span className="text-indigo-600">Pro</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The next generation of automated classroom attendance using Bluetooth detection. 
              Secure, accurate, and completely hands-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-8 hover:border-indigo-200 transition-colors cursor-pointer group" onClick={() => { setRole('teacher'); setView('login'); }}>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <ShieldCheck className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Teacher Portal</h3>
              <p className="text-gray-500">Manage timetables, initiate scans, and analyze attendance reports.</p>
              <div className="mt-6 flex items-center text-indigo-600 font-semibold gap-1">
                Login as Teacher <ChevronRight className="w-4 h-4" />
              </div>
            </Card>

            <Card className="p-8 hover:border-indigo-200 transition-colors cursor-pointer group" onClick={() => { setRole('student'); setView('login'); }}>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                <Smartphone className="w-6 h-6 text-emerald-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Portal</h3>
              <p className="text-gray-500">Register your device, view your attendance history, and stay updated.</p>
              <div className="mt-6 flex items-center text-emerald-600 font-semibold gap-1">
                Login as Student <ChevronRight className="w-4 h-4" />
              </div>
            </Card>
          </div>

          <div className="pt-8">
            <button 
              onClick={() => setView('register')}
              className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2 mx-auto font-medium"
            >
              New student? <span className="underline">Register your device here</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 space-y-8">
          <div className="text-center space-y-2">
            <button onClick={() => setView('landing')} className="text-indigo-600 text-sm font-medium hover:underline mb-4 block">← Back to Home</button>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500">Login to your {role} account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input 
              label={role === 'teacher' ? "Email Address" : "Roll Number"} 
              name="email" 
              type={role === 'teacher' ? "email" : "text"}
              placeholder={role === 'teacher' ? "sarah@university.edu" : "DS-001"} 
              required 
            />
            <Input 
              label="Password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
            />
            <Button type="submit" className="w-full py-3 text-lg">
              Sign In
            </Button>
          </form>

          {role === 'student' && (
            <p className="text-center text-sm text-gray-500">
              Don't have an account? <button onClick={() => setView('register')} className="text-indigo-600 font-semibold hover:underline">Register Now</button>
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 space-y-8">
          <div className="text-center space-y-2">
            <button onClick={() => setView('landing')} className="text-indigo-600 text-sm font-medium hover:underline mb-4 block">← Back to Home</button>
            <h2 className="text-3xl font-bold text-gray-900">Student Registration</h2>
            <p className="text-gray-500">Register your device for automated attendance</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <Input label="Full Name" name="name" placeholder="John Doe" required />
            <Input label="Roll Number" name="rollNumber" placeholder="DS-101" required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Section</label>
              <select 
                name="section" 
                className="w-full rounded-lg border border-gray-200 py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-semibold">Device ID Generation</p>
                <p className="opacity-80">A unique Bluetooth identifier will be generated for this device upon registration.</p>
              </div>
            </div>

            <Button type="submit" className="w-full py-3 text-lg">
              Complete Registration
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // --- Dashboard View ---

  const teacherTimetable = MOCK_TIMETABLE.filter(t => user?.sections?.includes(t.section));
  const studentAttendance = attendanceRecords.filter(r => r.section === user?.section);
  const studentPresentCount = attendanceRecords.filter(r => r.presentStudentIds.includes(user?.id)).length;
  const studentTotalClasses = attendanceRecords.filter(r => r.section === user?.section).length;
  const studentAttendancePercentage = studentTotalClasses > 0 ? (studentPresentCount / studentTotalClasses) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Bluetooth className="w-6 h-6" />
            <span>SmartAttend</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'overview' ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Users className="w-5 h-5" />
            Overview
          </button>
          {role === 'teacher' && (
            <button 
              onClick={() => setActiveTab('timetable')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activeTab === 'timetable' ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Calendar className="w-5 h-5" />
              Timetable
            </button>
          )}
          <button 
            onClick={() => setActiveTab('analysis')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'analysis' ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <BarChart3 className="w-5 h-5" />
            {role === 'teacher' ? 'Analysis' : 'My History'}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
            </div>
          </div>
          <button 
            onClick={() => setView('landing')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-bold text-gray-900 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              {format(new Date(), 'EEEE, MMM do')}
            </div>
            {role === 'teacher' && (
              <Button onClick={downloadCSV} variant="secondary" className="text-sm py-1.5">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {role === 'teacher' ? '+12%' : `${studentAttendancePercentage.toFixed(0)}%`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{role === 'teacher' ? 'Avg. Attendance' : 'My Attendance'}</p>
                    <h4 className="text-2xl font-bold text-gray-900">{role === 'teacher' ? '92.4%' : `${studentPresentCount}/${studentTotalClasses}`}</h4>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        {role === 'teacher' ? <Users className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{role === 'teacher' ? 'Total Students' : 'Device Status'}</p>
                    <h4 className="text-2xl font-bold text-gray-900">{role === 'teacher' ? students.length : 'Active'}</h4>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <Calendar className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Classes Today</p>
                    <h4 className="text-2xl font-bold text-gray-900">4</h4>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{role === 'teacher' ? 'Registered Devices' : 'Device ID'}</p>
                    <h4 className="text-2xl font-bold text-gray-900">{role === 'teacher' ? students.filter(s => s.deviceId).length : user?.deviceId}</h4>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Recent Activity */}
                  <Card className="lg:col-span-2">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">{role === 'teacher' ? 'Recent Attendance Sessions' : 'My Recent Classes'}</h3>
                      <button className="text-sm text-indigo-600 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {(role === 'teacher' ? attendanceRecords : studentAttendance).length > 0 ? (
                        (role === 'teacher' ? attendanceRecords : studentAttendance).slice(0, 5).map(record => {
                          const slot = MOCK_TIMETABLE.find(t => t.id === record.timeSlotId);
                          const isPresent = record.presentStudentIds.includes(user?.id);
                          const percentage = (record.presentStudentIds.length / record.totalStudents) * 100;
                          return (
                            <div key={record.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{slot?.subject}</p>
                                  <p className="text-xs text-gray-500">{record.section} • {record.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {role === 'teacher' ? (
                                  <>
                                    <p className="font-bold text-gray-900">{record.presentStudentIds.length}/{record.totalStudents}</p>
                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                      <div 
                                        className={cn(
                                          "h-full rounded-full transition-all duration-1000",
                                          percentage > 80 ? "bg-emerald-500" : percentage > 50 ? "bg-amber-500" : "bg-red-500"
                                        )} 
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <div className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                                    isPresent ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                  )}>
                                    {isPresent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {isPresent ? 'Present' : 'Absent'}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-12 text-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                            <Search className="w-8 h-8" />
                          </div>
                          <p className="text-gray-500">No attendance records found yet.</p>
                          {role === 'teacher' && <Button onClick={() => setActiveTab('timetable')}>Start First Session</Button>}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Quick Actions / Info */}
                  <div className="space-y-6">
                    <Card className="p-6 bg-indigo-600 text-white border-none shadow-indigo-200">
                      <h3 className="font-bold text-lg mb-2">Bluetooth Status</h3>
                      <p className="text-indigo-100 text-sm mb-6">
                        {role === 'teacher' 
                          ? "Your device is ready for scanning. Ensure Bluetooth is enabled on student devices."
                          : "Keep your Bluetooth enabled during class hours to be automatically marked present."
                        }
                      </p>
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">System Online</span>
                      </div>
                    </Card>

                    {role === 'teacher' ? (
                      <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Section Distribution</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={SECTIONS.map(s => ({ name: s, value: students.filter(st => st.section === s).length }))}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill="#4f46e5" />
                                <Cell fill="#10b981" />
                                <Cell fill="#f59e0b" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 mt-4">
                          {SECTIONS.map((s, i) => (
                            <div key={s} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", i === 0 ? "bg-indigo-600" : i === 1 ? "bg-emerald-500" : "bg-amber-500")} />
                                <span className="text-gray-600">{s}</span>
                              </div>
                              <span className="font-bold">{students.filter(st => st.section === s).length}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">My Profile</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Roll Number</span>
                            <span className="font-bold">{user?.rollNumber}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Section</span>
                            <span className="font-bold">{user?.section}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Device ID</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{user?.deviceId}</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'timetable' && (
              <motion.div 
                key="timetable"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Weekly Schedule</h3>
                    <p className="text-gray-500">Select a time slot to initiate Bluetooth attendance</p>
                  </div>
                  <div className="flex gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                      <button key={day} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50">{day}</button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  {teacherTimetable.map(slot => (
                    <Card key={slot.id} className="p-6 flex items-center justify-between group hover:border-indigo-300 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[80px]">
                          <p className="text-lg font-bold text-gray-900">{slot.startTime}</p>
                          <p className="text-xs text-gray-500">{slot.endTime}</p>
                        </div>
                        <div className="w-px h-12 bg-gray-100" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">{slot.section}</span>
                            <h4 className="font-bold text-gray-900">{slot.subject}</h4>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {students.filter(s => s.section === slot.section).length} Registered Students
                          </p>
                        </div>
                      </div>
                      
                      {role === 'teacher' && (
                        <Button 
                          onClick={() => startScanning(slot)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Bluetooth className="w-4 h-4" />
                          Start Attendance
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>

                {/* Scanning Overlay */}
                <AnimatePresence>
                  {scanning && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-indigo-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6"
                    >
                      <div className="max-w-md w-full text-center space-y-8">
                        <div className="relative flex justify-center">
                          <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center relative z-10">
                            <Bluetooth className="w-16 h-16 text-white animate-pulse" />
                          </div>
                          <div className="absolute inset-0 w-32 h-32 bg-indigo-400 rounded-full animate-ping opacity-20 mx-auto" />
                          <div className="absolute inset-0 w-32 h-32 bg-indigo-400 rounded-full animate-ping opacity-10 mx-auto delay-300" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-white">Scanning for Devices...</h3>
                          <p className="text-indigo-200">Detecting registered Bluetooth signals in {selectedSlot?.section}</p>
                        </div>

                        <div className="w-full h-2 bg-indigo-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${scanProgress}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
                              <p className="text-xs text-indigo-300 mb-1">Signal {i}</p>
                              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-400 w-2/3" />
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-indigo-300 text-sm animate-pulse">
                          {scanProgress < 100 ? "Filtering unknown devices..." : "Finalizing records..."}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-8"
              >
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Attendance Trends</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceRecords.slice().reverse()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="presentStudentIds.length" name="Present" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Section Performance</h3>
                    <div className="space-y-6">
                      {SECTIONS.map(section => {
                        const sectionRecords = attendanceRecords.filter(r => r.section === section);
                        const totalPresent = sectionRecords.reduce((acc, curr) => acc + curr.presentStudentIds.length, 0);
                        const totalPossible = sectionRecords.reduce((acc, curr) => acc + curr.totalStudents, 0);
                        const avg = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

                        return (
                          <div key={section} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700">{section}</span>
                              <span className="font-bold text-indigo-600">{avg.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${avg}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  avg > 85 ? "bg-emerald-500" : avg > 70 ? "bg-indigo-500" : "bg-amber-500"
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                <Card>
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Detailed Session Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-bold">Date</th>
                          <th className="px-6 py-4 font-bold">Section</th>
                          <th className="px-6 py-4 font-bold">Subject</th>
                          <th className="px-6 py-4 font-bold">Present</th>
                          <th className="px-6 py-4 font-bold">Absentees</th>
                          <th className="px-6 py-4 font-bold">Ratio</th>
                          <th className="px-6 py-4 font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendanceRecords.map(record => {
                          const slot = MOCK_TIMETABLE.find(t => t.id === record.timeSlotId);
                          const absentees = record.totalStudents - record.presentStudentIds.length;
                          return (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">{record.section}</span>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{slot?.subject}</td>
                              <td className="px-6 py-4 text-sm text-emerald-600 font-bold">{record.presentStudentIds.length}</td>
                              <td className="px-6 py-4 text-sm text-red-500 font-bold">{absentees}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {((record.presentStudentIds.length / record.totalStudents) * 100).toFixed(0)}%
                              </td>
                              <td className="px-6 py-4">
                                <button 
                                  onClick={() => alert('Manual edit mode activated for ' + slot?.subject + '. You can now adjust student presence.')}
                                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
