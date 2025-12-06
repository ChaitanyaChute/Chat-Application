import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, // Added Mail icon
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Github,
  Chrome
} from 'lucide-react';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#EF3A55] selection:text-white font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#EF3A55]/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />

      {/* Main Card */}
      <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-gray-400 text-sm mt-2">Join the community and start chatting today.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#EF3A55] transition-colors" />
              </div>
              <input
                type="text"
                name="username"
                placeholder="johndoe"
                className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#EF3A55]/50 focus:border-[#EF3A55] transition-all"
                required
              />
            </div>
          </div>

          {/* Email Input (NEW) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#EF3A55] transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#EF3A55]/50 focus:border-[#EF3A55] transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#EF3A55] transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 bg-[#18181b] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#EF3A55]/50 focus:border-[#EF3A55] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#EF3A55] to-[#d02840] hover:from-[#d72d48] hover:to-[#b02237] text-white font-semibold py-3 px-4 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-[#EF3A55]/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#121214] px-2 text-gray-500"></span>
          </div>
        </div>


        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            to="/auth"
            className="text-[#EF3A55] font-semibold hover:text-[#ff5c75] transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;