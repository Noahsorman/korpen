import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from './firebaseConfig';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  players: Player[]
  setPlayers: (p: Player[]) => void;
  teams: Team[]
  setTeams: (p: Team[]) => void;
  matches: Match[]
  setMatches: (p: Match[]) => void;
}

export interface Player {
  id: string;
  name: string;
  cost: number;
  image: string;
}

export interface Team {
  id: string;
  owner: string;
  points: number;
  budget: number;
  players: {
    ST1: string | null;
    MF1: string | null;
    MF2: string | null;
    DF1: string | null;
    DF2: string | null;
    GK1: string | null;
  };
}

export interface Match {
  id: string,
  date: Timestamp,
  played: boolean,
  opponentsName: string,
  opponentsColor: string,
  teamGoals: number | undefined,
  opponentGoals: number | undefined,
  players: {
    id: "string",
    played: boolean,
    goals: number,
    assists: number,
    yellowCard: boolean,
    redCard: boolean,
  }[],
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Inloggningsfel:", error);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, players, setPlayers, teams
    , setTeams, matches, setMatches }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};