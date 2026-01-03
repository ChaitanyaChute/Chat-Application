import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onRoomJoined: () => void;
}

interface AvailableRoom {
  _id: string;
  name: string;
  description: string;
  category: string;
  online: number;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  userId,
  onRoomJoined
}) => {
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAvailableRooms();
      fetchJoinedRooms();
    }
  }, [isOpen]);

  const fetchJoinedRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{success: boolean; rooms: AvailableRoom[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const joinedIds = new Set(response.data.rooms.map(r => r._id));
        setJoinedRoomIds(joinedIds);
      }
    } catch (error) {
      console.error("Error fetching joined rooms:", error);
    }
  };

  const fetchAvailableRooms = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{success: boolean; rooms: AvailableRoom[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/rooms/browse`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setRooms(response.data.rooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load available rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    setJoiningRoomId(roomId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post<{success: boolean; room: {name: string}; message: string}>(
        `${import.meta.env.VITE_BACKEND_URL}/rooms/${roomId}/join`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Joined ${response.data.room.name} successfully!`);
        // Update joined rooms list
        await fetchJoinedRooms();
        onRoomJoined();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to join room";
      toast.error(message);
    } finally {
      setJoiningRoomId(null);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Available Rooms</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#EF3A55]/50 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-[#EF3A55] animate-spin" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              {rooms.length === 0 ? "No rooms available yet" : "No matching rooms found"}
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room._id}
                className="bg-[#18181b] border border-white/10 rounded-lg p-4 hover:border-[#EF3A55]/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">#{room.name}</h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      {room.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                      <span>{room.category}</span>
                      <span>{room.online} online</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room._id)}
                    disabled={joiningRoomId === room._id || joinedRoomIds.has(room._id)}
                    className={`ml-4 font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                      joinedRoomIds.has(room._id)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[#EF3A55] hover:bg-[#d12e48] text-white"
                    }`}
                  >
                    {joiningRoomId === room._id ? "Joining..." : joinedRoomIds.has(room._id) ? "Joined" : "Join"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
