import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWS } from "../libs/WebSockets"; 
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import Indicator from "../components/Indicator"; 
import { ArrowLeft, Hash, Users, UserPlus, UserMinus, ShieldAlert, Trash2, MoreVertical,} from "lucide-react";

const Room: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const { ws, isAuthed } = useWS();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!ws || !isAuthed || !roomName) return;

    ws.send(
      JSON.stringify({
        type: "join",
        room: roomName,
      })
    );
  }, [ws, isAuthed, roomName]);

  if (!roomName) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#09090b] text-gray-400">
        <div className="text-center">
            <Hash className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No room selected</p>
            <button onClick={() => navigate('/')} className="mt-4 text-[#EF3A55] hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white overflow-hidden relative selection:bg-[#EF3A55] selection:text-white">

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-96 h-96 bg-[#EF3A55]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <header className="z-20 flex justify-between items-center px-4 py-3 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 shadow-sm">

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/")}
            className="p-2 -ml-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col">
            <h2 className="text-lg font-bold flex items-center gap-1.5 tracking-tight">
              <Hash className="w-5 h-5 text-gray-500" />
              {roomName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
               <span className="flex items-center gap-1">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                 Live
               </span>
               <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
               <span className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition-colors">
                 <Users className="w-3 h-3" /> 12 Members
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
       
          <div className="hidden md:flex items-center gap-1 pr-2 border-r border-white/10 mr-2">
            <ActionButton icon={<UserPlus className="w-4 h-4" />} label="Add User" />
            <ActionButton icon={<UserMinus className="w-4 h-4" />} label="Remove User" />
            <ActionButton icon={<ShieldAlert className="w-4 h-4" />} label="Make Admin" />
          </div>

          <button 
            className="p-2 rounded-lg text-gray-400 hover:text-[#EF3A55] hover:bg-[#EF3A55]/10 transition-all"
            title="Delete Room"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button 
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
             <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 z-10 flex flex-col min-h-0 relative">
     
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent px-4 pt-4">
    
             <div className="max-w-4xl mx-auto h-full flex flex-col justify-end min-h-[calc(100vh-180px)]">
                 <div className="flex-1"></div> 
                 <MessageList room={roomName} />
             </div>
        </div>

        <div className="p-4 pb-6 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent z-20">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="pl-2 h-6">
                <Indicator room={roomName} />
            </div>
            
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#EF3A55] to-purple-600 rounded-xl opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#121214] rounded-xl">
                    <MessageInput room={roomName} />
                </div>
            </div>
            
            <p className="text-[10px] text-gray-500 text-center pt-2">
                Press <kbd className="font-mono bg-white/10 px-1 rounded text-gray-300">Enter</kbd> to send, <kbd className="font-mono bg-white/10 px-1 rounded text-gray-300">Shift + Enter</kbd> for new line
            </p>
          </div>
        </div>
      </main>

    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <button 
    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group relative"
    aria-label={label}
  >
    {icon}
    <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/5 shadow-xl z-50">
      {label}
    </span>
  </button>
);

export default Room;