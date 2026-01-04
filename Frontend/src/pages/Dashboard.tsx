import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, Plus, Hash, MessageSquare, Activity, Users,
  Search, MoreVertical, Phone, Video, Smile, Mic, Send,
  X, Compass, Globe, UserMinus
} from "lucide-react";
import axios from "axios";
import CreateRoomModal from "../components/CreateRoomModal";
import JoinRoomModal from "../components/JoinRoomModal";
import toast from "react-hot-toast";

interface Room {
  _id: string;
  name: string;
  description: string;
  category?: string;
  online?: number;
}

interface ChatSession {
  id: string;
  name: string;
  type: "dm" | "room";
  description?: string;
  status?: "online" | "idle" | "offline";
  avatar?: string;
  bio?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  status: "online" | "idle" | "offline";
  avatar?: string;
  bio?: string;
}

interface Message {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
}

interface ActivityItem {
  id: string;
  type: "room_created" | "user_signup" | "user_joined";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Guest";
  const userId = localStorage.getItem("userId") || "";
  const token = localStorage.getItem("token");

  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<ChatSession | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [dmList, setDmList] = useState<ChatSession[]>([]);
  const [tab, setTab] = useState<"dm" | "room">("dm");

  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);
  const [messageInput, setMessageInput] = useState("");
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "auth", token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket message:", data);

      if (data.type === "auth") {
        if (data.success) {
          console.log("Authenticated as:", data.username);
          toast.success(`Connected as ${data.username}`);
        } else {
          console.error("Authentication failed:", data.reason);
          toast.error("Authentication failed. Please login again.");
          setTimeout(() => {
            handleLogout();
          }, 2000);
        }
        return;
      }

      if (data.type === "error") {
        console.error("Server error:", data.message);
        toast.error(data.message || "An error occurred");
        setActiveChat(null);
        return;
      }

      if (data.type === "message") {
        setRooms(prev => {
          const roomIndex = prev.findIndex(r => r.name === data.room);
          if (roomIndex > 0) {
            const updatedRooms = [...prev];
            const [movedRoom] = updatedRooms.splice(roomIndex, 1);
            return [movedRoom, ...updatedRooms];
          }
          return prev;
        });

        if (activeChatRef.current?.type === "room" && activeChatRef.current.name === data.room) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              from: data.from === username ? "me" : "them",
              text: data.message,
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);
        }
      }

      if (data.type === "dm") {
        console.log("DM received:", data);
        console.log("Active chat:", activeChatRef.current);
        
        const otherUserId = data.fromUserId === userId ? data.toUserId : data.fromUserId;
        const otherUsername = data.fromUserId === userId ? data.toUsername : data.fromUsername;
        
        const isForCurrentChat = activeChatRef.current?.type === "dm" && activeChatRef.current.id === otherUserId;
        
        if (isForCurrentChat) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              from: data.fromUserId === userId ? "me" : "them",
              text: data.message,
              time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          ]);
        }
        
        setDmList(prev => {
          const existing = prev.find(dm => dm.id === otherUserId);
          
          if (existing) {
            const filtered = prev.filter(dm => dm.id !== otherUserId);
            const updatedDm: ChatSession = {
              ...existing,
              description: data.message,
              name: otherUsername || existing.name
            };
            return [updatedDm, ...filtered];
          } else {
            const newDm: ChatSession = {
              id: otherUserId,
              name: otherUsername || "User",
              type: "dm" as const,
              description: data.message,
              status: "online" as const
            };
            return [newDm, ...prev];
          }
        });
      }

      if (data.type === "history") {
        setMessages(
          data.messages.map((m: any) => ({
            id: Date.now() + Math.random(),
            from: m.from === username ? "me" : "them",
            text: m.message,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }))
        );
      }

      if (data.type === "activity") {
        if (data.activity.userId && data.activity.userId === userId) {
          console.log("Skipping own activity notification");
          return;
        }
        
        const newActivity = formatActivity(data.activity);
        setActivities(prev => {
          const exists = prev.some(a => a.id === newActivity.id);
          if (exists) return prev;
          
          return [newActivity, ...prev].slice(0, 20);
        });
        
        if (data.activity.type === "room_created") {
          fetchRooms();
        }
      }

      if (data.type === "room_update") {
        console.log("Room update:", data);
        setRooms(prev => prev.map(room => 
          room.name === data.room 
            ? { ...room, online: data.online }
            : room
        ));
      }

      if (data.type === "new_message") {
        console.log("New message notification:", data.data);
      }
    };

    ws.onclose = () => console.log("WS closed");
    ws.onerror = (error) => console.error("WS error:", error);

    return () => ws.close();
  }, [token, username]);

  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    fetchRooms();
    fetchActivities();
    if (userId) {
      fetchDMs();
    }
  }, [userId]);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{success: boolean; rooms: Room[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/rooms`,
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
      toast.error("Failed to load rooms");
    }
  };

  const fetchDMs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{success: boolean; dms: ChatSession[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/dm/list/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setDmList(response.data.dms);
      }
    } catch (error) {
      console.error("Error fetching DMs:", error);
      toast.error("Failed to load direct messages");
    }
  };

  
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{success: boolean; activities: any[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/activity/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        const formattedActivities = response.data.activities.map(formatActivity);
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activities");
    }
  };

  const formatActivity = (activity: any): ActivityItem => {
    const getIcon = () => {
      switch (activity.type) {
        case "room_created":
          return <Plus className="w-4 h-4 text-emerald-500" />;
        case "user_signup":
          return <Users className="w-4 h-4 text-blue-500" />;
        case "user_joined":
          return <Users className="w-4 h-4 text-purple-500" />;
        case "message_sent":
          return <MessageSquare className="w-4 h-4 text-yellow-500" />;
        case "dm_sent":
          return <Send className="w-4 h-4 text-pink-500" />;
        default:
          return <Activity className="w-4 h-4 text-zinc-500" />;
      }
    };

    const getTimestamp = () => {
      const date = new Date(activity.timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return {
      id: activity._id || activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: getTimestamp(),
      icon: getIcon(),
    };
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{success: boolean; users: User[]}>(
        `${import.meta.env.VITE_BACKEND_URL}/users/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (tab === "dm") {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, tab]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);
  const openRoom = (room: Room) => {
    setActiveChat({
      id: room._id,
      name: room.name,
      type: "room",
      description: room.description
    });
    setMessages([]);
    setSearchQuery("");
    setSearchResults([]);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "join",
        room: room.name
      }));
    }
  };
  const openDM = async (dm: ChatSession) => {
    setActiveChat(dm);
    setMessages([]);
    setSearchQuery("");
    setSearchResults([]);
    
    if (userId && dm.id) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/dm/history/${userId}/${dm.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if ((response.data as any).success) {
          const historyMessages = ((response.data as any).messages || (response.data as any).history || []).map((msg: any) => {
            const fromId = msg.from?._id || msg.from;
            return {
              id: msg._id,
              from: fromId === userId ? "me" : "them",
              text: msg.message,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };
          });
          setMessages(historyMessages);
        }
      } catch (error) {
        console.error("Error loading DM history:", error);
      }
    }
  };
  const startDMWithUser = async (user: User) => {
    setActiveChat({
      id: user._id,
      name: user.username,
      type: "dm",
      description: user.bio || user.email,
      status: user.status,
      avatar: user.avatar
    });
    setMessages([]);
    setSearchQuery("");
    setSearchResults([]);
    setTab("dm");
    if (userId && user._id) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/dm/history/${userId}/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if ((response.data as any).success && ((response.data as any).messages || (response.data as any).history || []).length > 0) {
          const historyMessages = ((response.data as any).messages || (response.data as any).history || []).map((msg: any) => {
            const fromId = msg.from?._id || msg.from;
            return {
              id: msg._id,
              from: fromId === userId ? "me" : "them",
              text: msg.message,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };
          });
          setMessages(historyMessages);
        }
      } catch (error) {
        console.error("Error loading DM history:", error);
      }
    }
  };
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected");
      toast.error("Not connected. Please check your connection.");
      return;
    }

    if (activeChat.type === "room") {
      socketRef.current.send(
        JSON.stringify({ 
          type: "chat", 
          message: messageInput 
        })
      );
    }

    if (activeChat.type === "dm") {
      socketRef.current.send(
        JSON.stringify({
          type: "dm",
          toUserId: activeChat.id,
          message: messageInput
        })
      );
    }

    setMessageInput("");
  };

  const closeChat = () => setActiveChat(null);
  const handleLeaveRoom = async (roomId: string, roomName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to leave #${roomName}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      setRooms(prev => prev.filter(r => r._id !== roomId));
      
      if (activeChat?.type === "room" && activeChat.id === roomId) {
        setActiveChat(null);
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/rooms/${roomId}/leave`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if ((response.data as any).success) {
        toast.success(`Left #${roomName}`);
      } else {
        fetchRooms();
        toast.error((response.data as any).message || "Failed to leave room");
      }
    } catch (error: any) {
      console.error("Leave room error:", error);
      fetchRooms();
      const message = error.response?.data?.message || error.response?.data?.error || "Failed to leave room";
      toast.error(message);
    }
  };

  return (
    <div className="h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#EF3A55] selection:text-white overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#EF3A55]/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015]" />
      </div>

      <header className="h-16 flex-none z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#EF3A55] to-purple-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-200"></div>
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            ChatHub
          </span>
        </div>


        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center ring-2 ring-white/5">
              <span className="text-xs font-bold">{username[0]?.toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} className="text-zinc-500 hover:text-[#EF3A55] transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex z-10 overflow-hidden">
        <aside className="w-80 flex-none bg-[#0c0c0e]/50 backdrop-blur-md border-r border-white/5 flex flex-col">
          <div className="p-4 pb-2">
            <div className="bg-zinc-900/80 p-1 rounded-xl flex border border-white/5 relative">
              <div 
                className={`absolute inset-y-1 w-[48%] bg-[#EF3A55] rounded-lg shadow-lg shadow-[#EF3A55]/20 transition-all duration-300 ease-out ${tab === 'room' ? 'left-[50%]' : 'left-1'}`} 
              />
              <button onClick={() => setTab("dm")} className={`flex-1 relative z-10 py-1.5 text-xs font-semibold text-center rounded-lg transition-colors ${tab === "dm" ? "text-white" : "text-zinc-400 hover:text-zinc-200"}`}>
                Messages
              </button>
              <button onClick={() => setTab("room")} className={`flex-1 relative z-10 py-1.5 text-xs font-semibold text-center rounded-lg transition-colors ${tab === "room" ? "text-white" : "text-zinc-400 hover:text-zinc-200"}`}>
                Rooms
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
            {tab === "dm" ? (
                <>
                <div className="px-2 mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search to talk with people directly..."
                      className="w-full bg-zinc-900/80 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#EF3A55]/50 focus:border-[#EF3A55]/50"
                    />
                  </div>
                </div>
                {searchQuery && (
                  <>
                    <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Search Results</p>
                    {isSearching ? (
                      <div className="text-center py-4 text-zinc-500 text-sm">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(user => (
                        <div 
                          key={user._id} 
                          onClick={() => startDMWithUser(user)} 
                          className="group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium border border-white/5">
                              {user.username[0].toUpperCase()}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#09090b] ${user.status === 'online' ? 'bg-emerald-500' : user.status === 'idle' ? 'bg-amber-500' : 'bg-zinc-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate text-zinc-300">{user.username}</span>
                            <p className="text-xs text-zinc-500 truncate">{user.status === 'online' ? 'Online' : user.status === 'idle' ? 'Idle' : 'Offline'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-zinc-500 text-sm">No users found</div>
                    )}
                  </>
                )}

                {!searchQuery && (
                  <>
                    <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-2">Direct Messages</p>
                    {dmList.length > 0 ? (
                      dmList.map(chat => (
                        <div key={chat.id} onClick={() => openDM(chat)} className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${activeChat?.id === chat.id ? "bg-white/10" : "hover:bg-white/5"}`}>
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-medium border border-white/5">
                              {chat.name[0]}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#09090b] ${chat.status === 'online' ? 'bg-emerald-500' : chat.status === 'idle' ? 'bg-amber-500' : 'bg-zinc-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm font-medium truncate ${activeChat?.id === chat.id ? "text-white" : "text-zinc-300"}`}>{chat.name}</span>
                            <p className="text-xs text-zinc-500 truncate">{chat.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-zinc-500 text-sm">No conversations yet</div>
                    )}
                  </>
                )}
                </>
            ) : (
                <>
                <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-2">Channels</p>
                {rooms.length > 0 ? (
                  rooms.map(room => (
                    <div key={room._id} className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${activeChat?.id === room._id && activeChat.type === "room" ? "bg-white/10" : "hover:bg-white/5"}`}>
                        <div onClick={() => openRoom(room)} className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 border border-white/5">
                              <Hash className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between items-center">
                                  <span className={`text-sm font-medium ${activeChat?.id === room._id ? "text-white" : "text-zinc-300"}`}>{room.name}</span>
                                  <span className="text-[10px] text-zinc-600">{room.online || 0} online</span>
                              </div>
                              <p className="text-[11px] text-zinc-500 truncate">{room.category || "General"}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleLeaveRoom(room._id, room.name, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          title="Leave room"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-zinc-500 text-sm">No rooms joined yet</div>
                )}
                </>
            )}
          </div>
        </aside>

        
        <div className="flex-1 flex min-w-0 bg-[#09090b]/20 relative">
        
            {!activeChat ? (
                <div className="w-full h-full overflow-y-auto p-8 animate-in fade-in duration-500">
                    <div className="max-w-4xl mx-auto space-y-8">
                       <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
                            <p className="text-zinc-400">Welcome back, {username}. You have 3 unread notifications.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#121214]/50 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Rooms</p>
                                    <p className="text-3xl font-bold text-white mt-1">{rooms.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <Globe className="w-6 h-6 text-emerald-500" />
                                </div>
                            </div>
                            <div className="bg-[#121214]/50 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Active DMs</p>
                                    <p className="text-3xl font-bold text-white mt-1">{dmList.length} <span className="text-sm text-zinc-500 font-normal">conversations</span></p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#EF3A55]/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-[#EF3A55]" />
                                </div>
                            </div>
                        </div>

                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="group relative overflow-hidden bg-gradient-to-br from-[#121214] to-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-[#EF3A55]/50 transition-all cursor-pointer" onClick={() => setShowCreateRoomModal(true)}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Plus className="w-32 h-32 -mr-8 -mt-8" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                    <div className="w-10 h-10 bg-[#EF3A55]/20 rounded-xl flex items-center justify-center">
                                        <Plus className="w-5 h-5 text-[#EF3A55]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Create Room</h3>
                                        <p className="text-sm text-zinc-400 mt-1">Host your own community, invite friends, and customize channels.</p>
                                    </div>
                                    <button className="text-sm font-semibold text-[#EF3A55] flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Create New <Compass className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            
                            <div className="group relative overflow-hidden bg-gradient-to-br from-[#121214] to-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => setShowJoinRoomModal(true)}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Compass className="w-32 h-32 -mr-8 -mt-8" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <Search className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Join Room</h3>
                                        <p className="text-sm text-zinc-400 mt-1">Discover new communities, tech talks, and social hangouts.</p>
                                    </div>
                                    <button className="text-sm font-semibold text-purple-500 flex items-center gap-2 group-hover:gap-3 transition-all">
                                        Browse List <Compass className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        
                        <div className="bg-[#121214]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#EF3A55]" /> Recent Activity
                                </h3>
                            </div>
                            
                            <div className="space-y-2">
                                {activities.length > 0 ? (
                                    activities.slice(0, 2).map((activity) => (
                                        <div key={activity.id} className="flex gap-3 p-3 rounded-xl transition-colors hover:bg-white/5 border border-white/5 cursor-pointer group">
                                            <div className="mt-0.5 flex-shrink-0">
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white group-hover:text-[#EF3A55] transition-colors truncate">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                                    {activity.description}
                                                </p>
                                                <p className="text-[10px] text-zinc-600 mt-1.5">
                                                    {activity.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-zinc-500 text-sm">
                                        No recent activity
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    
                    <section className="flex-1 flex flex-col min-w-0">
                        
                        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                {activeChat.type === 'room' ? <Hash className="text-[#EF3A55]" /> : <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"/>}
                                <div>
                                    <h3 className="font-bold text-white leading-tight">
                                        {activeChat.type === 'room' ? `#${activeChat.name}` : activeChat.name}
                                    </h3>
                                    <p className="text-xs text-zinc-400">{activeChat.description || "Active now"}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5 mr-2">
                                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Start Audio Call"><Phone className="w-4 h-4"/></button>
                                    <div className="w-px h-4 bg-white/10 mx-1"></div>
                                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Start Video Call"><Video className="w-4 h-4"/></button>
                                </div>
                                <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><MoreVertical className="w-4 h-4"/></button>
                                <div className="w-px h-6 bg-white/10 mx-2"></div>
                                <button onClick={closeChat} className="p-2 text-zinc-500 hover:text-[#EF3A55] hover:bg-[#EF3A55]/10 rounded-lg transition-all" title="Close Chat"><X className="w-5 h-5"/></button>
                            </div>
                        </div>

                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
                             <div className="flex justify-center my-6">
                                <span className="bg-white/5 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Today</span>
                             </div>

                            {messages.map((m) => (
                                <div key={m.id} className={`flex gap-4 ${m.from === "me" ? "flex-row-reverse" : ""}`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border border-white/5 ${
                                        m.from === "me" ? "bg-[#EF3A55]" : "bg-zinc-800"
                                    }`}>
                                        {m.from === "me" ? "Me" : activeChat.name[0]}
                                    </div>
                                    <div className={`group flex flex-col max-w-[70%] ${m.from === "me" ? "items-end" : "items-start"}`}>
                                        <div className="flex items-baseline gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <span className="text-[10px] text-zinc-500 font-medium">{m.time}</span>
                                        </div>
                                        <div className={`px-5 py-3 text-sm leading-relaxed shadow-sm ${
                                            m.from === "me" 
                                            ? "bg-gradient-to-br from-[#EF3A55] to-[#D12E48] text-white rounded-2xl rounded-tr-none" 
                                            : "bg-[#18181b] border border-white/5 text-zinc-300 rounded-2xl rounded-tl-none"
                                        }`}>
                                            {m.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        
                        <div className="p-4 pb-6 bg-[#09090b]/80 backdrop-blur-md border-t border-white/5">
                            <form 
                                onSubmit={handleSendMessage}
                                className="bg-[#18181b] border border-white/10 rounded-xl flex flex-col focus-within:ring-1 focus-within:ring-[#EF3A55]/50 focus-within:border-[#EF3A55]/50 transition-all shadow-lg"
                            >
                                <input
                                    value={messageInput}
                                    onChange={e => setMessageInput(e.target.value)}
                                    placeholder={`Message ${activeChat.type === 'room' ? '#' + activeChat.name : activeChat.name}...`}
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 px-4 py-3 w-full"
                                />
                                <div className="flex items-center justify-between px-2 pb-2">
                                    <div className="flex items-center gap-1">
                                        <button type="button" className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><Plus className="w-4 h-4"/></button>
                                        <button type="button" className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><Smile className="w-4 h-4"/></button>
                                        <button type="button" className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"><Mic className="w-4 h-4"/></button>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={!messageInput.trim()}
                                        className="p-2 bg-[#EF3A55] text-white rounded-lg hover:bg-[#d12e48] transition-colors disabled:opacity-50 disabled:hover:bg-[#EF3A55]"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>

                    
                    <aside className="w-80 flex-none bg-[#0c0c0e]/50 backdrop-blur-md border-l border-white/5 p-4 hidden xl:flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#EF3A55]" /> Recent Activity
                            </h3>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <div key={activity.id} className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 transition-colors cursor-pointer group">
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-1 flex-shrink-0">
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white group-hover:text-[#EF3A55] transition-colors truncate">
                                                    {activity.title}
                                                </p>
                                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                                    {activity.description}
                                                </p>
                                                <p className="text-[10px] text-zinc-600 mt-2">
                                                    {activity.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </aside>
                </>
            )}
        </div>
      </main>

      
      <CreateRoomModal 
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        userId={userId}
        onRoomCreated={fetchRooms}
      />
      
      <JoinRoomModal 
        isOpen={showJoinRoomModal}
        onClose={() => setShowJoinRoomModal(false)}
        userId={userId}
        onRoomJoined={fetchRooms}
      />
    </div>
  );
};

export default Dashboard;