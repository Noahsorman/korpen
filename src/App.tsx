import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import TeamBuilder from './TeamBuilderPage';
import LeaguePage from './LeaguePage';
import Navbar from './navbar';
import RulesPage from './RulesPage';
import { useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import PlayersPage from './PlayersPage';

interface Player {
  id: string;
  name: string;
  cost: number;
  image: string;
  position: 'GK' | 'DF' | 'MF' | 'ST';
}

const Root = () => {
  const { user, loading, setPlayers } = useAuth();

  // Det är bra att vänta på att Firebase kollar om användaren är inloggad
  if (loading) {
    return (
      <div className="min-h-screen bg-[#101010] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#39ff14]"></div>
      </div>
    );
  }

  useEffect(() => {
    if (!auth) return;

    getDocs(collection(db, 'player')).then(pSnap => {
      const dataPlayers = pSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Player))
        .sort((a, b) => b.cost - a.cost)

      setPlayers(dataPlayers);
    });

  }, [])

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#101010]">
        {/* Navbaren visas bara om användaren är inloggad */}
        {user && <Navbar />}

        <main className={`${user ? 'pb-24' : ''}`}> {/* Ger plats för navbaren */}
          <Routes>
            {user ? (
              <>
                <Route path="/" element={<TeamBuilder />} />
                <Route path="/league" element={<LeaguePage />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/players" element={<PlayersPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <Root />
  </AuthProvider>
);

export default App;