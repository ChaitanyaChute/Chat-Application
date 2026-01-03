import React, { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onRoomCreated: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  userId,
  onRoomCreated
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post<{success: boolean; room: any; message: string}>(
        `${import.meta.env.VITE_BACKEND_URL}/rooms/create`,
        {
          name: name.trim(),
          description: description.trim(),
          category,
          creator: userId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success("Room created successfully!");
        setName("");
        setDescription("");
        setCategory("General");
        onClose();
        onRoomCreated();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create room";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#121214] border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Room</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Room Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., tech-talk, gaming, random"
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#EF3A55]/50 transition-all"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this room is about"
              rows={3}
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#EF3A55]/50 transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#EF3A55]/50 transition-all"
            >
              <option>General</option>
              <option>Tech</option>
              <option>Gaming</option>
              <option>Music</option>
              <option>Art</option>
              <option>Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#EF3A55] hover:bg-[#d12e48] text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
