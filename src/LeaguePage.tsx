import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

interface Player {
  id: string;
  image: string;
}

interface Team {
  id: string;
  owner: string;
  points: number;
  players: {
    ST1: string;
    MF1: string;
    MF2: string;
    DF1: string;
    DF2: string;
    GK1: string;
  };
}

const LeaguePage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<Record<string, string>>({}); // ID -> ImageURL
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Hämta alla spelare för att få tillgång till deras bilder
      const pSnap = await getDocs(collection(db, 'player'));
      const playerMap: Record<string, string> = {};
      pSnap.docs.forEach(doc => {
        playerMap[doc.id] = doc.data().image;
      });
      setAllPlayers(playerMap);

      // 2. Hämta alla lag i ligan
      const tSnap = await getDocs(collection(db, 'teams'));
      const tList = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

      // Sortera efter poäng (högst först)
      setTeams(tList.sort((a, b) => b.points - a.points));
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-[#39ff14] font-mono">Laddar ligan...</div>;

  return (
    <div className="min-h-screen bg-[#101010] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#39ff14] mb-2">LEAGUE STANDINGS</h1>
        </header>

        <div className="grid gap-4">
          {teams.map((team, index) => (
            <div
              key={team.id}
              style={{
                padding: 16,
                margin: "0rem 3rem 2rem 3rem",
                backgroundColor: index === 0 ? "rgba(57, 255, 20, 0.1)" : "rgba(26, 26, 26, 0.8)",
                borderRadius: 12,
                border: index === 0 ? "2px solid #39ff14" : "1px solid #1a1a1a",
              }}
            >

              <div style={{
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 12,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                  <strong style={{
                    fontSize: 32
                  }}>#{index + 1}</strong>
                  <div className="text-lg " style={{opacity: 0.7}}>{team.owner}</div>
                </div>

                {/* Spelarbilder */}
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 8,

                }}>
                  {Object.keys(team.players).map((position: string, i) => {
                    const img = allPlayers[team.players[position as keyof typeof team.players]];

                    return<div style={{position: "relative", marginBottom: 16}} key={i}>
                      <img
                        src={img}
                        alt="player"
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: "100%",
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: -15,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 12,
                        color: "white",
                        fontWeight: 'bold',
                        padding: '0px 5px',
                        textShadow: '1px 1px 20px black',
                      }}>{position}</div>
                    </div>
                  })}
                </div>

                {/* Poäng */}
                <div className="col-span-2 text-left md:text-right">
                  <span className="text-2xl font-mono font-bold text-[#39ff14]">{team.points}</span>
                  <span className="text-[10px] text-gray-600 ml-1 uppercase">pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaguePage;