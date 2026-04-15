import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, type Match } from './AuthContext';
import LoginPage from './LoginPage';
import TeamBuilder from './TeamBuilderPage';
import LeaguePage from './LeaguePage';
import Navbar from './navbar';
import RulesPage from './RulesPage';
import { useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import PlayersPage from './PlayersPage';
import MatchSchedule from './MatchSchedulePage';

interface Player {
  id: string;
  name: string;
  cost: number;
  image: string;
}

interface Team {
  id: string;
  owner: string;
  points: number;
  budget: number;
  players: {
    ST1: string;
    MF1: string;
    MF2: string;
    DF1: string;
    DF2: string;
    GK1: string;
  };
}

const Root = () => {
  const { user, loading, setPlayers, setTeams, setMatches } = useAuth();

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

    getDocs(collection(db, 'teams')).then(pSnap => {
      const teams = pSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Team[]
      setTeams(teams);
    });

    getDocs(collection(db, 'matchSchedule')).then(pSnap => {
      const matches = pSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Match[]
      setMatches(matches);
    });

  }, [auth])

  return (
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
              <Route path="/schedule" element={<MatchSchedule />} />
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
  );
};

const App = () => (
  <AuthProvider>
    <Root />
  </AuthProvider>
);

export default App;