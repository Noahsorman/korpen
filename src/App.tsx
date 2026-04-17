import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, type Match, type Player, type Team } from './AuthContext';
import LoginPage from './LoginPage';
import TeamBuilder from './TeamBuilderPage';
import LeaguePage from './LeaguePage';
import Navbar from './navbar';
import RulesPage from './RulesPage';
import { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import PlayersPage from './PlayersPage';
import MatchSchedule from './MatchSchedulePage';
import LoadingModal from './LoadingModal';


const Root = () => {
  const { user, loading, setPlayers, setTeams, setMatches } = useAuth();
  const [fetchingData, setFetchingData] = useState(false);

  const fetchData = async () => {
    if (!auth?.currentUser) return;

    setFetchingData(true);
    console.log({ auth: auth.currentUser, user })

    let error = "";
    try {
      const p1 = getDocs(collection(db, 'player'));
      const p2 = getDocs(collection(db, 'teams'));
      const p3 = getDocs(collection(db, 'matchSchedule'));

      await Promise.all([p1, p2, p3]).then(([pSnap, tSnap, mSnap]) => {
        const dataPlayers = pSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as Player))
          .sort((a, b) => b.cost - a.cost);
        setPlayers(dataPlayers);

        const dataTeams = tSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Team[];
        setTeams(dataTeams);

        const dataMatches = mSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Match[];
        setMatches(dataMatches);
      }).catch(e => {
        const err = e as any
        error = err.message
      }).finally(() => setFetchingData(false))
    } catch (e) {
      const err = e as any
      error = err.message
    }

    if (error !== "") alert(error)
  }

  useEffect(() => { fetchData() }, [user]);

  if (loading || fetchingData) {
    return (
      <LoadingModal
        image='/logo.svg'
        text=' '
      />
    );
  }

  if (!user) {
    return <div className="flex flex-col min-h-screen bg-[#101010]">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#101010]">
      <main className={`${user ? 'pb-24' : ''}`}>
        <Routes>
          <Route path="/" element={<TeamBuilder />} />
          <Route path="/league" element={<LeaguePage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/schedule" element={<MatchSchedule />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Navbar />
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Root />
  </AuthProvider>
);

export default App;