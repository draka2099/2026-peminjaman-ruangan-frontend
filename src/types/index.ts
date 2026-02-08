// UserRole sesuai dengan backend enum
export const UserRole = {
  Admin: 0,
  Mahasiswa: 1,
  Dosen: 2,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// BookingStatus sesuai dengan backend enum
export const BookingStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Cancelled: 3,
  Completed: 4,
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export interface User {
  id: number;
  namaLengkap: string;
  email: string;
  password?: string;
  role: UserRole;
  nimNip: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: number;
  namaRuangan: string;
  kapasitas: number;
  lokasi: string | null;
  isAvailable: boolean;
  deskripsi: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  tanggalPeminjaman: string; // Format: "YYYY-MM-DD"
  waktuMulai: string; // Format: "HH:mm:ss"
  waktuSelesai: string; // Format: "HH:mm:ss"
  keperluan: string;
  status: BookingStatus;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  // Nested objects from Include
  user?: User;
  room?: Room;
}

// DTOs for creating
export interface CreateUserDto {
  namaLengkap: string;
  email: string;
  password: string;
  role: UserRole;
  nimNip?: string;
}

export interface UpdateUserDto {
  namaLengkap?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  nimNip?: string;
}

export interface CreateRoomDto {
  namaRuangan: string;
  kapasitas: number;
  lokasi?: string;
  deskripsi?: string;
  isAvailable: boolean;
}

export interface UpdateRoomDto {
  namaRuangan?: string;
  kapasitas?: number;
  lokasi?: string;
  deskripsi?: string;
  isAvailable?: boolean;
}

export interface CreateBookingDto {
  userId: number;
  roomId: number;
  tanggalPeminjaman: string; // Format: "YYYY-MM-DD"
  waktuMulai: string; // Format: "HH:mm:ss"
  waktuSelesai: string; // Format: "HH:mm:ss"
  keperluan: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const BookingStatusLabels: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: 'Menunggu',
  [BookingStatus.Approved]: 'Disetujui',
  [BookingStatus.Rejected]: 'Ditolak',
  [BookingStatus.Cancelled]: 'Dibatalkan',
  [BookingStatus.Completed]: 'Selesai',
};

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.Admin]: 'Admin',
  [UserRole.Mahasiswa]: 'Mahasiswa',
  [UserRole.Dosen]: 'Dosen',
};
