import api from './api';

export interface LeaveRequest {
  id: string;
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'EMERGENCY' | 'OTHER';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalDays: number;
}

export interface CreateLeaveData {
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'EMERGENCY' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
}

/**
 * Get all leave requests for the logged-in user
 */
export const getMyLeaves = async (startDate?: string, endDate?: string, status?: string): Promise<LeaveRequest[]> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (status) params.status = status;

  const response = await api.get('/leaves/my-leaves', { params });
  return response.data.leaves;
};

/**
 * Get leave statistics for the logged-in user
 */
export const getMyLeaveStats = async (): Promise<LeaveStats> => {
  const response = await api.get('/leaves/my-stats');
  return response.data.statistics;
};

/**
 * Create a new leave request
 */
export const createLeaveRequest = async (data: CreateLeaveData): Promise<LeaveRequest> => {
  const response = await api.post('/leaves', data);
  return response.data.leave;
};

/**
 * Get a specific leave request by ID
 */
export const getLeaveById = async (leaveId: string): Promise<LeaveRequest> => {
  const response = await api.get(`/leaves/my-leaves/${leaveId}`);
  return response.data.leave;
};

/**
 * Delete a leave request (only if pending)
 */
export const deleteLeaveRequest = async (leaveId: string): Promise<void> => {
  await api.delete(`/leaves/my-leaves/${leaveId}`);
};

