export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface AttendanceResponse {
    id: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    employeeName: string;
    checkInLatitude: string;
    checkInLongitude: string;
    checkOutLatitude: string;
    checkOutLongitude: string;
    status: string;
    location: string;
    totalHours: number;
}
