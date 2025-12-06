import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Plus, 
  Search, 
  Hash, 
  Users, 
  MessageSquare, 
  Bell, 
  TrendingUp,
  Activity,
  Settings
} from "lucide-react";


interface Room {
  id: string;
  name: string;
  description: string;
  category: string;
  online: number;
}

const mockRooms: Room[] = [
  { id: "1", name: "general", description: "Casual chat with everyone", category: "Social", online: 128 },
  { id: "2", name: "dev-talk", description: "Discuss code, bugs & ideas", category: "Tech", online: 45 },
  { id: "3", name: "random", description: "Memes, off-topic, fun stuff", category: "Social", online: 67 },
  { id: "4", name: "react-help", description: "Component patterns & hooks", category: "Tech", online: 23 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Guest";
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRooms = mockRooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-[#EF3A55] selection:text-white">

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#EF3A55]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#09090b]/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EF3A55] to-[#b02237] flex items-center justify-center shadow-lg shadow-[#EF3A55]/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            ChatSphere
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group cursor-pointer hidden sm:block">
            <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#EF3A55] rounded-full border-2 border-[#09090b]"></span>
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-white">{username}</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold">{username.charAt(0).toUpperCase()}</span>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-[#EF3A55] transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full z-10 flex flex-col lg:flex-row gap-8 p-6 lg:p-10">

        <section className="w-full lg:w-3/4 flex flex-col gap-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121214]/50 border border-white/5 p-5 rounded-2xl flex flex-col gap-1 backdrop-blur-sm">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total Rooms</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">24</span>
                <Hash className="w-5 h-5 text-[#EF3A55] mb-1" />
              </div>
            </div>
            <div className="bg-[#121214]/50 border border-white/5 p-5 rounded-2xl flex flex-col gap-1 backdrop-blur-sm">
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Users</span>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">1,204</span>
                <Users className="w-5 h-5 text-emerald-500 mb-1" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#EF3A55] to-[#b02237] p-5 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-[#EF3A55]/20 cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => alert("Create Room")}>
              <div>
                <p className="font-bold text-lg">Create Room</p>
                <p className="text-xs text-white/80">Host your own community</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="w-1 h-6 bg-[#EF3A55] rounded-full block"></span>
              Explore Rooms
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search for topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#18181b] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-[#EF3A55]/50 focus:border-[#EF3A55] transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/room/${room.name}`)}
                className="group relative bg-[#121214] hover:bg-[#18181b] border border-white/5 hover:border-[#EF3A55]/30 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-[#EF3A55]/5 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1f1f22] group-hover:bg-[#EF3A55]/10 flex items-center justify-center transition-colors">
                       <Hash className="w-5 h-5 text-gray-400 group-hover:text-[#EF3A55]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-100 group-hover:text-white transition-colors">
                        {room.name}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                        {room.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {room.online} online
                  </div>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 pl-1">
                  {room.description}
                </p>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                    <span>Last active: 2m ago</span>
                    <span className="group-hover:text-[#EF3A55] transition-colors font-medium flex items-center gap-1">
                        Join Room →
                    </span>
                </div>
              </div>
            ))}
            
            {filteredRooms.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                    <p>No rooms found matching "{searchTerm}"</p>
                </div>
            )}
          </div>
        </section>

        <aside className="w-full lg:w-1/4 space-y-6">

          <div className="bg-[#121214]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#EF3A55]" />
                    Activity Feed
                </h3>
            </div>
            <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                     <div key={i} className="flex gap-3 items-start">
                         <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 border border-white/10" />
                         <div>
                             <p className="text-xs text-gray-300"><span className="font-bold text-white">Sarah</span> joined <span className="text-[#EF3A55]">#dev-talk</span></p>
                             <p className="text-[10px] text-gray-500">2 mins ago</p>
                         </div>
                     </div>
                 ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                View All Activity
            </button>
          </div>

          <div className="bg-[#121214]/80 backdrop-blur-md border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Trending
            </h3>
            <div className="flex flex-wrap gap-2">
                {['React', 'AI', 'Tailwind', 'Memes', 'Music'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-300 border border-white/5 cursor-pointer transition-colors">
                        #{tag}
                    </span>
                ))}
            </div>
          </div>
      
           <div className="text-xs text-gray-600 px-2 flex flex-col gap-2">
               <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span>System Operational</span>
               </div>
               <div className="flex gap-3 mt-2">
                   <button className="hover:text-gray-400 flex items-center gap-1"><Settings className="w-3 h-3"/> Settings</button>
                   <button className="hover:text-gray-400">Privacy</button>
               </div>
           </div>

        </aside>
      </main>
    </div>
  );
};

export default Dashboard;