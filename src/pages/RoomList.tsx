import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  X,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roomApi, bookingApi } from '../services/api';
import { UserRole } from '../types';
import type { Room, CreateRoomDto, CreateBookingDto } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RoomList() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.Admin;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAvailable, setFilterAvailable] = useState<'all' | 'available' | 'unavailable'>('all');
  const [filterCapacity, setFilterCapacity] = useState<number | ''>('');

  // Modal states
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [roomForm, setRoomForm] = useState<CreateRoomDto>({
    namaRuangan: '',
    kapasitas: 0,
    lokasi: undefined,
    isAvailable: true,
    deskripsi: undefined,
  });

  const [bookingForm, setBookingForm] = useState({
    tanggalPeminjaman: '',
    waktuMulai: '',
    waktuSelesai: '',
    keperluan: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, searchQuery, filterAvailable, filterCapacity]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await roomApi.getAll();
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rooms];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.namaRuangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (room.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    // Availability filter
    if (filterAvailable === 'available') {
      filtered = filtered.filter((room) => room.isAvailable);
    } else if (filterAvailable === 'unavailable') {
      filtered = filtered.filter((room) => !room.isAvailable);
    }

    // Capacity filter
    if (filterCapacity) {
      filtered = filtered.filter((room) => room.kapasitas >= filterCapacity);
    }

    setFilteredRooms(filtered);
  };

  const handleOpenRoomModal = (room?: Room) => {
    if (room) {
      setSelectedRoom(room);
      setRoomForm({
        namaRuangan: room.namaRuangan,
        kapasitas: room.kapasitas,
        lokasi: room.lokasi ?? undefined,
        isAvailable: room.isAvailable,
        deskripsi: room.deskripsi ?? undefined,
      });
    } else {
      setSelectedRoom(null);
      setRoomForm({
        namaRuangan: '',
        kapasitas: 0,
        lokasi: undefined,
        isAvailable: true,
        deskripsi: undefined,
      });
    }
    setIsRoomModalOpen(true);
  };

  const handleOpenBookingModal = (room: Room) => {
    setSelectedRoom(room);
    setBookingForm({
      tanggalPeminjaman: '',
      waktuMulai: '',
      waktuSelesai: '',
      keperluan: '',
    });
    setIsBookingModalOpen(true);
  };

  const handleOpenDeleteModal = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (selectedRoom) {
        await roomApi.update(selectedRoom.id, roomForm);
      } else {
        await roomApi.create(roomForm);
      }
      setIsRoomModalOpen(false);
      fetchRooms();
    } catch (error) {
      console.error('Failed to save room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    setIsSubmitting(true);

    try {
      await roomApi.delete(selectedRoom.id);
      setIsDeleteModalOpen(false);
      fetchRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !user) return;
    setIsSubmitting(true);

    try {
      const bookingData: CreateBookingDto = {
        userId: user.id,
        roomId: selectedRoom.id,
        tanggalPeminjaman: bookingForm.tanggalPeminjaman,
        waktuMulai: bookingForm.waktuMulai + ':00',
        waktuSelesai: bookingForm.waktuSelesai + ':00',
        keperluan: bookingForm.keperluan,
      };
      await bookingApi.create(bookingData);
      setIsBookingModalOpen(false);
      alert('Permintaan peminjaman berhasil diajukan!');
    } catch (error) {
      console.error('Failed to submit booking:', error);
      alert('Gagal mengajukan peminjaman');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Daftar Ruangan</h1>
          <p className="text-gray-500">Kelola dan lihat ruangan yang tersedia</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => handleOpenRoomModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Tambah Ruangan
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari ruangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value as typeof filterAvailable)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="available">Tersedia</option>
            <option value="unavailable">Tidak Tersedia</option>
          </select>
          <input
            type="number"
            placeholder="Min. Kapasitas"
            value={filterCapacity}
            onChange={(e) => setFilterCapacity(e.target.value ? parseInt(e.target.value) : '')}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Tidak ada ruangan ditemukan
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold opacity-20">
                  {room.namaRuangan.charAt(0)}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{room.namaRuangan}</h3>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {room.isAvailable ? 'Tersedia' : 'Dipakai'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    Kapasitas: {room.kapasitas} orang
                  </div>
                  {room.lokasi && (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2" />
                      {room.lokasi}
                    </div>
                  )}
                </div>
                {room.deskripsi && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{room.deskripsi}</p>
                )}
                <div className="flex gap-2">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleOpenRoomModal(room)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(room)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenBookingModal(room)}
                      disabled={!room.isAvailable}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CalendarPlus size={16} className="mr-1" />
                      Ajukan Peminjaman
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Room Modal (Create/Edit) */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title={selectedRoom ? 'Edit Ruangan' : 'Tambah Ruangan'}
      >
        <form onSubmit={handleSaveRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Ruangan
            </label>
            <input
              type="text"
              value={roomForm.namaRuangan}
              onChange={(e) => setRoomForm({ ...roomForm, namaRuangan: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kapasitas
            </label>
            <input
              type="number"
              value={roomForm.kapasitas}
              onChange={(e) => setRoomForm({ ...roomForm, kapasitas: parseInt(e.target.value) || 0 })}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={roomForm.lokasi ?? ''}
              onChange={(e) => setRoomForm({ ...roomForm, lokasi: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              value={roomForm.deskripsi ?? ''}
              onChange={(e) => setRoomForm({ ...roomForm, deskripsi: e.target.value || undefined })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={roomForm.isAvailable}
              onChange={(e) => setRoomForm({ ...roomForm, isAvailable: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
              Tersedia
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Ajukan Peminjaman"
      >
        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Ruangan:</span> {selectedRoom?.namaRuangan}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Peminjaman
            </label>
            <input
              type="date"
              value={bookingForm.tanggalPeminjaman}
              onChange={(e) => setBookingForm({ ...bookingForm, tanggalPeminjaman: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu Mulai
              </label>
              <input
                type="time"
                value={bookingForm.waktuMulai}
                onChange={(e) => setBookingForm({ ...bookingForm, waktuMulai: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu Selesai
              </label>
              <input
                type="time"
                value={bookingForm.waktuSelesai}
                onChange={(e) => setBookingForm({ ...bookingForm, waktuSelesai: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keperluan
            </label>
            <textarea
              value={bookingForm.keperluan}
              onChange={(e) => setBookingForm({ ...bookingForm, keperluan: e.target.value })}
              required
              rows={3}
              placeholder="Jelaskan keperluan peminjaman ruangan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Mengajukan...' : 'Ajukan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Ruangan"
      >
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus ruangan{' '}
          <span className="font-semibold">{selectedRoom?.namaRuangan}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDeleteRoom}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
