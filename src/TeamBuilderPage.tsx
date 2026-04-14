import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useAuth } from './AuthContext';

interface Player {
  id: string;
  name: string;
  cost: number;
  image: string;
  position: 'GK' | 'DF' | 'MF' | 'ST';
}

const theme = {
  colors: {
    background: '#101010',
    surface: '#1a1a1a',
    primary: '#39ff14',
    text: '#ffffff',
    error: '#ff4b2b',
    pitch: '#142014',
  }
};

const TeamBuilder = () => {
  // 1-2-2-1 Formation (6 spelare totalt)
  const [myTeam, setMyTeam] = useState<Record<string, string | null>>({
    ST1: null,
    MF1: null, MF2: null,
    DF1: null, DF2: null,
    GK1: null
  });
  const [oldTeam, setOldTeam] = useState<Record<string, string | null>>({
    ST1: null,
    MF1: null, MF2: null,
    DF1: null, DF2: null,
    GK1: null
  });
  const [isLocked, setIsLocked] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<string | null>(null);
  const { players } = useAuth()

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if(!auth.currentUser?.uid) return;
    const pSnap = await getDocs(collection(db, 'player'));
    const tSnap = await getDoc(doc(db, 'teams', auth.currentUser.uid));

    const dataPlayers = pSnap.docs
      .map(d => ({ id: d.id, ...d.data() } as Player))
      .sort((a, b) => b.cost - a.cost)

    const data = tSnap.exists() ? tSnap.data().players : {
      ST1: null,
      MF1: null, MF2: null,
      DF1: null, DF2: null,
      GK1: null
    };

    setMyTeam(data);
    setOldTeam(data)
    // Här kan du lägga till match-lock logiken igen om du vill
  };

  const uploadTeam = async () => {
    if(!auth.currentUser?.uid) return

    const teamData = {
      players: myTeam,
      owner: auth.currentUser?.displayName || 'Unknown',
      timestamp: new Date()
    }

    await setDoc(doc(db, 'teams', auth.currentUser.uid), teamData, {merge:true});
    setOldTeam(myTeam)
  }

  const totalCost = Object.values(myTeam)
    .map(id => players.find(p => p.id === id)?.cost || 0)
    .reduce((a, b) => a + b, 0);

  const selectPlayer = (playerId: string) => {
    if (!selectingSlot) return;
    setMyTeam(prev => ({ ...prev, [selectingSlot]: playerId }));
    setSelectingSlot(null);
    setTimeout(() => console.log({myTeam, oldTeam}), 100); // För att se uppdateringen i konsolen
  };

  const PlayerSlot = ({ slotId, label }: { slotId: string, label: string }) => {
    const player = players.find(p => p.id === myTeam[slotId]);
    return (
      <button
        onClick={() => !isLocked && setSelectingSlot(slotId)}
        style={{
          backgroundColor: "hsla(0, 0%, 10%, 0.8)",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 8,
        }}
      >
        <div style={{
          fontWeight: 'bold',
          color: theme.colors.text,
          backgroundColor: 'hsla(0, 0%, 100%, 0.1)',
          padding: '4px 8px',
          borderRadius: 8,
          fontSize: 12,
        }}>
          {label}
        </div>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 12,

        }}>
          {player ? (
            <img src={player.image} alt={player.name} style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 20,
            }} />
          ) : (
            <span className="text-gray-600 text-xl">+</span>
          )}
        </div>

        {player &&
          <>
            <div style={{
              marginTop: 8,
              fontWeight: 'bold',
              color: theme.colors.primary,
              backgroundColor: 'transparent',
              padding: player ? 0 : '4px 8px',
              borderRadius: 8,
              fontSize: 12,
            }}>
              {player.name.split(' ')[0]}
            </div>
            <span>${player.cost}</span>
          </>
        }
      </button>
    );
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center" style={
      {
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>

      {/* Header med Budget */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className="text-xl font-black italic tracking-tight text-[#39ff14]">UNATLETICO MADRID</h1>
        <div className="text-right">
          <p className={`text-2xl font-mono font-bold ${totalCost > 100 ? 'text-red-500' : 'text-white'}`}
            style={{
              color: totalCost > 100 ? theme.colors.error : theme.colors.text,
              fontWeight: 'bold',
              fontSize: 24,
            }}
          >
            ${totalCost}<span className="text-xs text-gray-500">/100</span>
          </p>
        </div>
      </div>

      {/* PLANEN */}
      <div
        style={{
          background: `linear-gradient(to bottom, #1a2e1a, #101010)`,
          gap: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 16,
        }}>
        {/* Rad 1: Striker */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: 400,
          zIndex: 10,
        }}>
          <PlayerSlot slotId="ST1" label="Striker" />
        </div>

        {/* Rad 2: Mittfält */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: 400,
          zIndex: 10
        }}>
          <PlayerSlot slotId="MF1" label="Mittfält" />
          <PlayerSlot slotId="MF2" label="Mittfält" />
        </div>

        {/* Rad 3: Försvar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: 400,
          zIndex: 10
        }}>
          <PlayerSlot slotId="DF1" label="Back" />
          <PlayerSlot slotId="DF2" label="Back" />
        </div>

        {/* Rad 4: Målvakt */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: 400,
          zIndex: 10
        }}>
          <PlayerSlot slotId="GK1" label="Målvakt" />
        </div>
      </div>

      {/* Spara-knapp */}
      <button
        disabled={isLocked || totalCost > 100 || Object.values(myTeam).includes(null)}
        className={`w-full max-w-md mt-8 py-4 rounded-2xl font-black text-lg transition-all
          ${totalCost > 100
            ? 'bg-red-600/20 text-red-500 border border-red-600/50 cursor-not-allowed'
            : 'bg-[#39ff14] text-black shadow-[0_10px_20px_rgba(57,255,20,0.3)] active:scale-95'
          }`}
        style={{
          padding: 16,
          fontWeight: 'bold',
          fontSize: 18,
          backgroundColor: totalCost > 100 ? theme.colors.error + '20' : 
          Object.keys(myTeam).every(key => myTeam[key] === oldTeam[key]) ?
            'rgba(57, 255, 20, 0.5)' :
            theme.colors.primary,
          color: totalCost > 100 ? theme.colors.error : 'black',
          border: totalCost > 100 ? `1px solid ${theme.colors.error}50` : 'none',
          cursor: isLocked || totalCost > 100 || Object.values(myTeam).includes(null) || Object.keys(myTeam).every(key => myTeam[key] === oldTeam[key]) ? 'not-allowed' : 'pointer',
        }}
        onClick={uploadTeam}
      >
        {
          totalCost > 100 ? 'SPARA (ÖVER BUDGET)' :
          Object.keys(myTeam).every(key => myTeam[key] === oldTeam[key]) ? 'Gör ändringar för att spara' :
          "SPARA LAGUPPSTÄLLNING"
        }
      </button>

      {/* Modal / Popup */}
      {selectingSlot && (
        <div style={styles.overlay} onClick={() => setSelectingSlot(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectingSlot(null)}>✕</button>
            <h2 style={styles.modalTitle}>Välj spelare</h2>
            <div style={styles.modalContent}>
              {players.map(p => {
                const isSelected = Object.values(myTeam).includes(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={isSelected}
                    onClick={() => selectPlayer(p.id)}
                    style={{
                      borderRadius: "20%",
                      backgroundColor: isSelected ? "hsla(0, 0%, 0%, 80%)" : "#333"
                    }}
                  >
                    <div className="flex items-center gap-4"
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        width: 100,
                        flexDirection: "column"
                      }}
                    >
                      <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        overflow: 'hidden',
                        flexShrink: 0,                        
                      }}>
                        <img src={p.image} style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }} />
                      </div>
                      <div className="text-left" style={{
                        height: "2.2em",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex"
                      }}>
                        <p className="font-bold text-white">{p.name}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#39ff14]">${p.cost}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // Modal Styles
  overlay: {
    position: 'fixed',
    inset: 0,
    background: "rgba(0, 0, 0, 0.8)",
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modal: {
    background: theme.colors.background,
    width: '100%',
    maxWidth: '500px',
    borderRadius: '20px',
    padding: '32px',
    position: 'relative',
    border: `1px solid black`,
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalContent: {
    gap: 16,
    display: 'flex',
    overflowX: "clip",
    flexWrap: "wrap",
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: theme.colors.text,
    fontSize: '1.2rem',
    cursor: 'pointer',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '20px',
    color: theme.colors.text
  }
};

export default TeamBuilder;