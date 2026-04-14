// src/LoginPage.tsx
import React from 'react';
import { useAuth } from './AuthContext';

// Samma accentfärg som tidigare, men samlad för enkelhetens skull
const accentColor = "#39ff14";

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[#101010] text-white flex flex-col md:flex-row font-sans">
      
      {/* Vänstra Sektionen (Bild/Välkomst) - Döljs på små skärmar och visas på medium+ */}
      <div className="hidden md:flex flex-col justify-center items-start w-1/2 p-20 bg-[#121212] border-r border-[#1a1a1a]">
        <h1 style={{ color: accentColor }} className="text-sm font-bold uppercase tracking-widest mb-4">
          Unatletico Madrid Fantasy
        </h1>
        <p className="text-6xl font-extrabold leading-tight mb-8">
          Bygg ditt drömlag. <br />
          Dominera serien.
        </p>        
      </div>

      {/* Högra Sektionen (Inloggning) */}
      <div className="flex flex-col justify-center items-center flex-1 p-6 md:p-12 lg:p-20 bg-[#101010]">
        

        {/* Inloggningskortet */}
        <div className="w-full mt-16 max-w-md p-10 bg-[#121212] rounded-3xl border border-[#1a1a1a] shadow-2xl shadow-[#39ff14]/5"
          style={{marginTop: 16}}
        >
          <div className="text-center md:text-left">
          </div>

          <div className="space-y-6">
            <button 
              onClick={login}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#202020] rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="22" alt="Google G Logo" />
              <span className="font-semibold text-lg text-white">Fortsätt med Google</span>
            </button>          
          </div>
        </div>
        

      </div>
    </div>
  );
};

export default LoginPage;