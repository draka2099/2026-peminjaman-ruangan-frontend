import axios from 'axios';
import type { 
  User, 
  Room, 
  Booking, 
  CreateUserDto, 
  UpdateUserDto,
  CreateRoomDto, 
  UpdateRoomDto, 
  CreateBookingDto,
  LoginDto,
  BookingStatus
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5096/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginDto) => api.post<User>('/Users/login', data),
};

// User API
export const userApi = {
  getAll: () => api.get<User[]>('/Users'),
  getById: (id: number) => api.get<User>(`/Users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/Users', data),
  update: (id: number, data: UpdateUserDto) => api.put(`/Users/${id}`, data),
  delete: (id: number) => api.delete(`/Users/${id}`),
};

// Room API
export const roomApi = {
  getAll: () => api.get<Room[]>('/Rooms'),
  getById: (id: number) => api.get<Room>(`/Rooms/${id}`),
  create: (data: CreateRoomDto) => api.post<Room>('/Rooms', data),
  update: (id: number, data: UpdateRoomDto) => api.put(`/Rooms/${id}`, data),
  delete: (id: number) => api.delete(`/Rooms/${id}`),
};

// Booking API
export const bookingApi = {
  getAll: () => api.get<Booking[]>('/Bookings'),
  getById: (id: number) => api.get<Booking>(`/Bookings/${id}`),
  create: (data: CreateBookingDto) => api.post<Booking>('/Bookings', data),
  update: (id: number, data: Partial<CreateBookingDto>) => api.put(`/Bookings/${id}`, data),
  delete: (id: number) => api.delete(`/Bookings/${id}`),
  getByUserId: (userId: number) => api.get<Booking[]>(`/Bookings/user/${userId}`),
  updateStatus: (id: number, status: BookingStatus) => 
    api.patch(`/Bookings/${id}/status`, { status }),
};

export default api;
