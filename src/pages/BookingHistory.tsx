import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react'; // Hapus Check dan X karena tidak dipakai lagi
import { useAuth } from '../context/AuthContext';
import { bookingApi, roomApi, userApi } from '../services/api';
import { UserRole, BookingStatus, BookingStatusLabels } from '../types';
import type { Booking, Room, User } from '../types';

const statusColors: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: 'bg-yellow-100 text-yellow-700',
  [BookingStatus.Approved]: 'bg-green-100 text-green-700',
  [BookingStatus.Rejected]: 'bg-red-100 text-red-700',
  [BookingStatus.Completed]: 'bg-blue-100 text-blue-700',
  [BookingStatus.Cancelled]: 'bg-gray-100 text-gray-700',
};

export default function BookingHistory() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.Admin;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        bookingApi.getAll(),
        roomApi.getAll(),
      ]);

      let bookingData = bookingsRes.data;

      // If not admin, filter bookings to only show user's bookings
      if (!isAdmin && user) {
        bookingData = bookingData.filter((b: Booking) => b.userId === user.id);
      }

      // Sort by date (newest first)
      bookingData.sort(
        (a: Booking, b: Booking) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setBookings(bookingData);
      setRooms(roomsRes.data);

      if (isAdmin) {
        const usersRes = await userApi.getAll();
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Peminjaman</h1>
          <p className="text-gray-500">
            {isAdmin
              ? 'Arsip semua data peminjaman'
              : 'Lihat riwayat peminjaman Anda'}
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value === 'all' ? 'all' : (parseInt(e.target.value) as BookingStatus)
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value={BookingStatus.Pending}>Menunggu</option>
          <option value={BookingStatus.Approved}>Disetujui</option>
          <option value={BookingStatus.Rejected}>Ditolak</option>
          <option value={BookingStatus.Completed}>Selesai</option>
          <option value={BookingStatus.Cancelled}>Dibatalkan</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
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
                {/* Kolom Aksi DIHAPUS agar history bersih */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>Tidak ada data peminjaman</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  // Use nested objects from backend Include(), fallback to lookup
                  const room = booking.room || rooms.find((r) => r.id === booking.roomId);
                  const bookingUser = booking.user || users.find((u) => u.id === booking.userId);

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{booking.id}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">
                            {bookingUser?.namaLengkap || '-'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {bookingUser?.email || '-'}
                          </p>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {room?.namaRuangan || '-'}
                        </p>
                        <p className="text-xs text-gray-500">{room?.lokasi || '-'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(booking.tanggalPeminjaman).toLocaleDateString('id-ID', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.waktuMulai.slice(0, 5)} - {booking.waktuSelesai.slice(0, 5)}
                      </td>
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