import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { auth } from './firebaseConfig';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

const accentColor = "#39ff14";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState(localStorage.getItem("emailForSignIn") ?? "");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');

      // Om användaren öppnar länken på en annan enhet kan mejlet saknas i localStorage
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Vänligen fyll i din e-post igen för att bekräfta inloggningen');
      }

      if (emailForSignIn) {
        setLoading(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            // AuthContext kommer nu känna av att 'user' finns och skicka vidare användaren
          })
          .catch((error) => {
            console.error(error);
            setMessage({ text: "Länken är ogiltig eller har gått ut.", isError: true });
            setLoading(false);
          });
      }
    }
  }, []);

  // 2. Skicka inloggningslänk
  const handleEmailLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const actionCodeSettings = {
      // URL:en användaren skickas tillbaka till. 
      // VIKTIGT: Måste matcha din domän (localhost eller GitHub Pages)
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage({ text: `En länk har skickats till ${email}! Kolla skräpposten om du inte ser den.`, isError: false });
    } catch (error: any) {
      console.error(error);
      setMessage({ text: "Kunde inte skicka mejlet. Kontrollera adressen.", isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
      <div className="hidden md:flex flex-col justify-center items-start w-1/2 p-20 bg-[#121212] border-r border-[#1a1a1a]">
        <h1 style={{ color: accentColor }} className="text-sm font-bold uppercase tracking-widest mb-4">
          Unatletico Madrid Fantasy
        </h1>
        <div>Bygg ditt drömlag. Dominera serien</div>
      </div>{/* Meddelanden (Success/Error) */}
      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.isError ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/20'}`}>
          {message.text}
        </div>
      )}
      <h2 className="text-2xl font-black mb-8 italic uppercase tracking-tight">Logga in med</h2>
      <button
        onClick={login}
        disabled={loading}
        style={{ border: "none", backgroundColor: "white", width: "8rem", borderRadius: 20, color: "black", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
        <span>Google</span>
      </button>

      <form onSubmit={handleEmailLinkLogin} style={{ marginTop: 10 }}>
        <h2>Email</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ fontSize: 18 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ border: "none", backgroundColor: "white", width: "8rem", borderRadius: 20, color: "black", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
          >
            {loading ? 'Laddar...' : 'Skicka inloggningslänk'}
          </button>
        </div>
      </form>
    </div>
  )


};

export default LoginPage;