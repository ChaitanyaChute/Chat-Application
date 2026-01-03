import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronRight,Video,Phone,Plus,Send,Sparkles} from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Spotlight = ({ className, fill = "white" }: { className?: string; fill?: string }) => {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        ></ellipse>
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8"></feGaussianBlur>
        </filter>
      </defs>
    </svg>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 inset-x-0 max-w-lg mx-auto z-50"
      >
        <div className="relative flex items-center justify-between px-6 py-3 rounded-full border border-white/[0.08] bg-black/50 backdrop-blur-xl shadow-[0px_0px_20px_rgba(0,0,0,0.5)]">
            
            <div 
              className="flex items-center gap-3 font-bold text-white cursor-pointer group" 
              onClick={() => navigate('/')}
            >
                {/* Ensure /logo.png exists in your public folder, or remove this div */}
                
                <span className="tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 group-hover:to-white transition-all duration-300">
                  ChatHub
                </span>
            </div>

            <div className="flex items-center gap-3">
              
              <button 
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 rounded-full bg-neutral-900/80 text-white text-xs font-bold border border-white/[0.1] hover:bg-neutral-800 hover:border-white/[0.2] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                  Login
              </button>
            </div>
        </div>
      </motion.div>

      <section className="h-[40rem] w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        
        <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-32 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-100">Real-time Messaging • Public & Private Rooms</span>
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
            Real-time Chat <br /> That Brings People Together
          </h1>
          <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
            ChatHub connects teams and communities with instant messaging, organized rooms, 
            and direct conversations. Simple, fast, and always in sync.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')}
              className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2.5 px-6 ring-1 ring-white/10 ">
                <span>Start chatting Free</span>
                <ChevronRight className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-0"></div>
      </section>


      <section className="py-20 bg-neutral-900/30 border-y border-white/[0.05]">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
              
              <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-4">Seamless Chat Experience</h3>
                  <p className="text-neutral-400 mb-6">
                      Beautiful, intuitive interface for messaging. Join rooms, chat with friends, 
                      and stay connected with real-time notifications.
                  </p>
                  
                  <div className="flex gap-2 mb-8">
                      <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"/>
                      <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"/>
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"/>
                  </div>
              </div>

              <div className="flex-1 w-full">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-white/[0.1] bg-black shadow-2xl overflow-hidden relative"
                  >
                      <div className="h-12 border-b border-white/[0.1] bg-neutral-900/50 backdrop-blur flex items-center justify-between px-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                              <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white">Michael</span>
                                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                      Active now
                                  </span>
                              </div>
                          </div>
                          <div className="flex gap-3 text-neutral-400">
                              <Phone className="w-4 h-4 hover:text-white cursor-pointer" />
                              <Video className="w-4 h-4 text-red-500 animate-pulse cursor-pointer" />
                          </div>
                      </div>

                      <div className="h-64 bg-neutral-900/20 p-4 relative flex flex-col justify-end gap-3">
                          
                          <motion.div 
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="absolute top-4 right-4 w-24 h-32 bg-neutral-800 rounded-lg border border-white/10 shadow-xl overflow-hidden"
                          >
                              <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-800" />
                              <div className="absolute bottom-2 left-2 text-[8px] font-bold text-white bg-black/50 px-1 rounded">You</div>
                              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-black" />
                          </motion.div>

                          <div className="flex items-start gap-2 max-w-[80%]">
                              <div className="w-6 h-6 rounded-full bg-neutral-700 flex-shrink-0" />
                              <div className="bg-neutral-800 border border-white/5 p-2 rounded-2xl rounded-tl-none text-xs text-neutral-300">
                                  Hey! Are we jumping on the call? 
                              </div>
                          </div>

                          <div className="flex items-end gap-2 max-w-[80%] self-end flex-row-reverse">
                              <div className="bg-cyan-600/20 border border-cyan-500/20 p-2 rounded-2xl rounded-tr-none text-xs text-cyan-100">
                                  Joining right now! 🎥
                              </div>
                          </div>
                      </div>

                      <div className="h-12 border-t border-white/[0.1] bg-neutral-900/50 px-3 flex items-center gap-3">
                          <div className="p-1.5 rounded-full bg-white/5 text-neutral-400">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full w-1/3 bg-neutral-700 rounded-full" />
                          </div>
                          <div className="p-1.5 rounded-full bg-cyan-500/20 text-cyan-400">
                             <Send className="w-4 h-4" />
                          </div>
                      </div>

                  </motion.div>
              </div>
          </div>
      </section>

      <footer className="py-10 bg-black text-center text-neutral-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
             <span className="font-bold text-neutral-300">ChatHub</span>
        </div>
        <p>&copy; 2025 ChatHub. Built for real conversations.</p>
      </footer>
    </div>
  );
};

export default LandingPage;