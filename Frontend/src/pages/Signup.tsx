import React, { useState } from 'react'
import { Link } from 'react-router';

function Signup() {
    const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F0F10] px-4">
      <div className="bg-[#1A1A1C] p-8 rounded-lg shadow-xl w-full max-w-sm border border-[#2a2a2b]">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2 text-sm">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            className="w-full px-4 py-2 bg-[#0F0F10] text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#EF3A55] transition"
          />
        </div>

        <div className="mb-2 relative">
          <label className="block text-gray-300 mb-2 text-sm">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 bg-[#0F0F10] text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#EF3A55] transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          className="w-full bg-[#EF3A55] hover:bg-[#d72d48] text-white py-2 px-4 rounded transition-colors mt-4"
        >
          Sign Up
        </button>

        <div className="mt-6 text-center text-sm text-gray-400">
        Already have an account? {""}
        <Link
        to="/auth"
        className="text-[#EF3A55] font-semibold hover:underline">
        Login
        </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup