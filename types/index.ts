export type Role = 'ADMIN' | 'USER';
export type Domain = 'FRONTEND' | 'BACKEND' | 'APP' | 'UIUX' | 'CLOUD' | 'ML' | 'COMMON';
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';
export type TaskType = 'INDIVIDUAL' | 'TEAM';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  domain: Domain | null;
  avatarData?: string | null;
  isVerified?: boolean;
}

export interface UserSearchResult {
  id: string;
  name: string | null;
  email: string;
  domain: Domain | null;
  avatarData?: string | null;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user: UserSearchResult;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  domain: Domain;
  deadline: string;
  type: TaskType;
  teamName?: string | null;
  attachments?: string[];
  assignedUsers?: TaskAssignment[];
  teamSubmission?: TeamSubmission | null;
}

export interface TeamSubmissionLink {
  name: string;
  url: string;
}

export interface TeamSubmission {
  id: string;
  taskId: string;
  links: TeamSubmissionLink[];
  attachments: string[];
  remarks: string | null;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  githubLink: string;
  demoLink: string;
  remarks: string | null;
  status: SubmissionStatus;
  userId: string;
  taskId: string;
  user?: User & { members?: User[] }; // Modified for team
  task?: Task;
  createdAt: string;
  updatedAt?: string;
  
  // Team Submission specific fields that might be merged
  isTeam?: boolean;
  links?: TeamSubmissionLink[];
  attachments?: string[];
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
