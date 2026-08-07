import { Domain, SubmissionStatus, AttendanceStatus } from '../types';

export const DOMAINS: Domain[] = ['FRONTEND', 'BACKEND', 'APP', 'UIUX', 'CLOUD', 'ML', 'COMMON'];
export const SUBMISSION_STATUSES: SubmissionStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
export const ATTENDANCE_STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LEAVE'];

export const getDomainColor = (domain: string | null) => {
  switch (domain) {
    case 'FRONTEND':
      return 'bg-fuchsia-600'; // pink/fuchsia
    case 'BACKEND':
      return 'bg-green-500';
    case 'UIUX':
      return 'bg-black';
    case 'APP':
      return 'bg-indigo-500';
    case 'CLOUD':
      return 'bg-sky-400';
    case 'ML':
      return 'bg-purple-500';
    default:
      return 'bg-blue-500'; // Default/COMMON
  }
};
