export type Role = 'ADMIN' | 'USER';
export type Domain = 'FRONTEND' | 'BACKEND' | 'APP' | 'UIUX' | 'CLOUD' | 'ML' | 'COMMON';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  domain: Domain | null;
  avatarData?: string | null;
  isVerified?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  deadline: string;
}

export interface Submission {
  id: string;
  githubLink: string;
  demoLink: string;
  remarks: string | null;
  status: SubmissionStatus;
  userId: string;
  taskId: string;
  user?: User;
  task?: Task;
  createdAt: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  status: AttendanceStatus;
  user?: User;
}

export interface AttendanceRecord {
  userId: string;
  status: AttendanceStatus;
}
