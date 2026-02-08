import { useState, useEffect } from 'react';
import {
  DoorOpen,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  CalendarCheck,
  Check, // Import Icon Check
  X,     // Import Icon X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingApi, roomApi, userApi } from '../services/api';
import { UserRole, BookingStatus, BookingStatusLabels } from '../types';
import type { Booking, Room, User } from '../types';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

function StatsCard({ title, value, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

const statusColors: Record<number, string> = {
  [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-700',
  [BookingStatus.Approved]: 'bg-green-100 text-green-700',
  [BookingStatus.Rejected]: 'bg-red-100 text-red-700',
  [BookingStatus.Cancelled]: 'bg-gray-100 text-gray-700',
  [BookingStatus.Completed]: 'bg-blue-100 text-blue-700',
};

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.Admin;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (isAdmin) {
        // Admin: get all data
        const [bookingsRes, roomsRes, usersRes] = await Promise.all([
          bookingApi.getAll(),
          roomApi.getAll(),
          userApi.getAll(),
        ]);
        setBookings(bookingsRes.data);
        setRooms(roomsRes.data);
        setUsers(usersRes.data);
      } else if (user) {
        // User: get only their bookings and all rooms
        const [bookingsRes, roomsRes] = await Promise.all([
          bookingApi.getByUserId(user.id),
          roomApi.getAll(),
        ]);
        setBookings(bookingsRes.data);
        setRooms(roomsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC BARU: Handle Update Status di Dashboard ---
  const handleUpdateStatus = async (bookingId: number, newStatus: BookingStatus) => {
    if (!confirm(newStatus === BookingStatus.Approved ? 'Setujui peminjaman ini?' : 'Tolak peminjaman ini?')) return;
    
    try {
      await bookingApi.updateStatus(bookingId, newStatus);
      // Refresh data setelah update agar tampilan berubah real-time
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Gagal mengubah status');
    }
  };
  // ----------------------------------------------------

  // Calculate stats based on role
  const adminStats = [
    {
      title: 'Total Ruangan',
      value: rooms.length,
      icon: DoorOpen,
      color: 'bg-blue-600',
    },
    {
      title: 'Total Pengguna',
      value: users.length,
      icon: Users,
      color: 'bg-green-600',
    },
    {
      title: 'Menunggu Persetujuan',
      value: bookings.filter((b) => b.status === BookingStatus.Pending).length,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Peminjaman',
      value: bookings.filter((b) => b.status === BookingStatus.Approved).length,
      icon: CalendarCheck,
      color: 'bg-purple-600',
    },
  ];

  const userStats = [
    {
      title: 'Permintaan Saya',
      value: bookings.length,
      icon: CalendarCheck,
      color: 'bg-blue-600',
    },
    {
      title: 'Disetujui',
      value: bookings.filter((b) => b.status === BookingStatus.Approved).length,
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      title: 'Ditolak',
      value: bookings.filter((b) => b.status === BookingStatus.Rejected).length,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  const stats = isAdmin ? adminStats : userStats;

  // Get recent bookings (last 5)
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Selamat datang, {user?.namaLengkap}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-6 ${isAdmin ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isAdmin ? 'Permintaan Terbaru (Butuh Tindakan)' : 'Peminjaman Saya Terbaru'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peminjam
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruangan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keperluan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-gray-500">
                    Belum ada peminjaman
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => {
                  const roomName = booking.room?.namaRuangan || '-';
                  const userName = booking.user?.namaLengkap || '-';
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">
                            {userName}
                          </p>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {roomName}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.tanggalPeminjaman).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.waktuMulai.slice(0, 5)} - {booking.waktuSelesai.slice(0, 5)}
                      </td>
                      
                      {/* --- DATA BARU: KEPERLUAN --- */}
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {booking.keperluan}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[booking.status]
                          }`}
                        >
                          {BookingStatusLabels[booking.status]}
                        </span>
                      </td>

                      {/* KOLOM AKSI (ADMIN ONLY) */}
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.status === BookingStatus.Pending ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(booking.id, BookingStatus.Approved)}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Setujui"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, BookingStatus.Rejected)}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Tolak"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}