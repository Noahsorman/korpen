import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from './AuthContext';
import LoadingModal from './LoadingModal';
import { waitFor } from './waitFor';
import type { Team } from "./AuthContext"


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
  // const [myTeam, setMyTeam] = useState<Record<string, string | null>>({
  //   ST1: null,
  //   MF1: null, MF2: null,
  //   DF1: null, DF2: null,
  //   GK1: null
  // });
  // const [oldTeam, setOldTeam] = useState<Record<string, string | null>>({
  //   ST1: null,
  //   MF1: null, MF2: null,
  //   DF1: null, DF2: null,
  //   GK1: null
  // });
  const isLocked = false;
  const [selectingSlot, setSelectingSlot] = useState<keyof Team["players"] | null>(null);
  const { players, teams, user } = useAuth()
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined)

  const [myTeam, setMyTeam] = useState<Team>({
    budget: 100,
    id: user?.uid ?? "unkown",
    owner: user?.displayName ?? user?.email ?? "unkown",
    points: 0,
    players: {
      ST1: null,
      MF1: null, MF2: null,
      DF1: null, DF2: null,
      GK1: null
    }
  })
  const [oldTeam, setOldTeam] = useState<Team>({
    budget: 100,
    id: user?.uid ?? "unkown",
    owner: user?.displayName ?? user?.email ?? "unkown",
    points: 0,
    players: {
      ST1: null,
      MF1: null, MF2: null,
      DF1: null, DF2: null,
      GK1: null
    }
  })

  useEffect(() => {
    const mt = teams.find(t => t.id === user?.uid)
    console.log({ teams, mt })
    if (!mt) return;

    setMyTeam(mt)
    setOldTeam(mt)
  }, [teams]);

  const uploadTeam = async () => {
    console.log("foo")
    if (!auth.currentUser?.uid) return alert("Du är inte autentiserad")
    setLoadingText("Laddar upp lag")

    await waitFor(.5)

    let teamData = JSON.parse(JSON.stringify(myTeam)) as Omit<Team, "id"> & {id?: string}
    delete teamData.id

    await setDoc(doc(db, 'teams', auth.currentUser.uid), myTeam, { merge: true });
    setOldTeam(myTeam)
    setLoadingText(undefined)
  }

  const totalCost = Object.values(myTeam.players)
    .map(id => players.find(p => p.id === id)?.cost || 0)
    .reduce((a, b) => a + b, 0);

  const teamHasChanged = !Object.keys(myTeam.players).every((key) =>
    myTeam.players[key as keyof typeof myTeam.players] === oldTeam.players[key as keyof typeof oldTeam.players]
  )

  const selectPlayer = (playerId: string) => {
    console.log({ selectingSlot, playerId })
    if (!selectingSlot) return;
    setMyTeam(prev => ({
      ...prev,
      players: {
        ...prev.players,
        [selectingSlot]: playerId
      }
    }));
    setSelectingSlot(null);
    setTimeout(() => console.log({ myTeam, oldTeam }), 100); // För att se uppdateringen i konsolen
  };

  const PlayerSlot = ({ slotId, label }: { slotId: keyof Team["players"], label: string }) => {
    const player = players.find(p => p.id === myTeam.players[slotId]);
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
          width: 55,
          height: 55,
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
            <span className=" text-xl" style={{ color: "white" }}>+</span>
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
            <span style={{ color: "white" }}>${player.cost}</span>
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
        position: "relative"
      }}>

      {/* Header med Budget */}
      <div style={{
        position: "absolute",
        left: "1rem",
        top: "1rem",
      }}>
        <p className={`text-2xl font-mono font-bold ${totalCost > myTeam.budget ? 'text-red-500' : 'text-white'}`}
          style={{
            color: totalCost > myTeam.budget ? theme.colors.error : theme.colors.text,
            fontWeight: 'bold',
            fontSize: 24,
          }}
        >
          ${totalCost}<span className="text-xs">/{myTeam.budget}</span>
        </p>
      </div>

      <button
        disabled={isLocked || totalCost > myTeam.budget || Object.values(myTeam.players).includes(null) || !teamHasChanged}
        className={`w-full max-w-md mt-8 py-4 rounded-2xl font-black text-lg transition-all
          ${totalCost > myTeam.budget
            ? 'bg-red-600/20 text-red-500 border border-red-600/50 cursor-not-allowed'
            : 'bg-[#39ff14] text-black shadow-[0_10px_20px_rgba(57,255,20,0.3)] active:scale-95'
          }`}
        style={{
          padding: 16,
          fontWeight: 'bold',
          fontSize: 18,
          backgroundColor: totalCost > myTeam.budget ? theme.colors.error + '20' :
            !teamHasChanged ?
              'rgba(57, 255, 20, 0.5)' :
              theme.colors.primary,
          color: totalCost > myTeam.budget ? theme.colors.error : 'black',
          border: totalCost > myTeam.budget ? `1px solid ${theme.colors.error}50` : 'none',
          cursor: isLocked || (totalCost > myTeam.budget) || Object.values(myTeam.players).includes(null) || !teamHasChanged ? 'not-allowed' : 'pointer',
          position: "absolute",
          right: 0,
          width: "30%",
          margin: "1rem",
          borderRadius: 25,
          boxShadow: "2px 2px 10px black",
          zIndex: 5
        }}
        onClick={uploadTeam}
      >
        {
          totalCost > myTeam.budget ? 'ÖVER BUDGET' :
            !teamHasChanged ? 'Gör ändringar för att spara'
              : 'SPARA LAG'
        }
      </button>

      {/* PLANEN */}
      <div
        style={{
          background: `linear-gradient(to bottom, #1a2e1a, #101010)`,
          gap: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 16,
          overflowY: selectingSlot ? "hidden" : "auto"
        }}>
        {/* Rad 1: Striker */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: 400,
          zIndex: 3,
        }}>
          <PlayerSlot slotId="ST1" label="Striker" />
        </div>

        {/* Rad 2: Mittfält */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: 400,
          zIndex: 3
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
          zIndex: 3
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
          zIndex: 3,
          marginBottom: "5rem"
        }}>
          <PlayerSlot slotId="GK1" label="Målvakt" />
        </div>
      </div>

      {/* Modal / Popup */}
      {selectingSlot && (
        <div style={styles.overlay} onClick={() => setSelectingSlot(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setSelectingSlot(null)}>✕</button>
            <h2 style={styles.modalTitle}>Välj spelare</h2>
            <div style={styles.modalContent}>
              {players.map(p => {
                const isSelected = Object.values(myTeam.players).includes(p.id);
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
                        <p className="font-bold text-white" style={{ color: "white" }}>{p.name}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#39ff14]" style={{ color: "white" }}>${p.cost}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
      <LoadingModal
        text={loadingText}
      />
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