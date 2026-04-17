import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, setDoc } from "firebase/firestore";
import { useAuth, type Team } from './AuthContext';
import LoadingModal from './LoadingModal';
import { waitFor } from './waitFor';

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
  const isLocked = false;
  const [selectingSlot, setSelectingSlot] = useState<keyof Team["players"] | null>(null);
  const { players, teams, user, setTeams } = useAuth()
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined)

  const [myTeam, setMyTeam] = useState<Team>({
    budget: 100,
    id: user?.uid ?? "unknown",
    owner: user?.displayName ?? user?.email ?? "unknown",
    points: 0,
    players: { ST1: null, MF1: null, MF2: null, DF1: null, DF2: null, GK1: null }
  })
  
  const [oldTeam, setOldTeam] = useState<Team>(myTeam)

  useEffect(() => {
    const mt = teams.find(t => t.id === user?.uid)
    if (mt) {
      setMyTeam(mt)
      setOldTeam(mt)
    }
  }, [teams, user]);

  const uploadTeam = async () => {
    if (!auth.currentUser?.uid) return alert("Du är inte autentiserad")
    setLoadingText("Sparar din lineup...")
    await waitFor(.8)
    await setDoc(doc(db, 'teams', auth.currentUser.uid), myTeam, { merge: true });
    setOldTeam(myTeam)
    setTeams(ts => ts.map(t => t.id === myTeam.id ? myTeam : t));
    setLoadingText(undefined)
  }

  const totalCost = Object.values(myTeam.players)
    .map(id => players.find(p => p.id === id)?.cost || 0)
    .reduce((a, b) => a + b, 0);

  const teamHasChanged = JSON.stringify(myTeam.players) !== JSON.stringify(oldTeam.players);
  const isOverBudget = totalCost > myTeam.budget;
  const isIncomplete = Object.values(myTeam.players).includes(null);

  const selectPlayer = (playerId: string) => {
    if (!selectingSlot) return;
    setMyTeam(prev => ({
      ...prev,
      players: { ...prev.players, [selectingSlot]: playerId }
    }));
    setSelectingSlot(null);
  };

  const PlayerSlot = ({ slotId, label }: { slotId: keyof Team["players"], label: string }) => {
    const player = players.find(p => p.id === myTeam.players[slotId]);
    return (
      <div style={styles.slotWrapper}>
        <div style={styles.slotLabel}>{label}</div>
        <button
          onClick={() => !isLocked && setSelectingSlot(slotId)}
          style={player ? styles.playerBtnActive : styles.playerBtnEmpty}
        >
          {player ? (
            <>
              <img src={player.image} alt={player.name} style={styles.slotImg} />
              <div style={styles.slotPriceBadge}>{player.cost}$</div>
            </>
          ) : (
            <span style={{ fontSize: '24px', color: theme.colors.primary }}>+</span>
          )}
        </button>
        <div style={styles.slotName}>
          {player ? player.name.split(' ')[0].toUpperCase() : 'VÄLJ'}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      
      {/* HEADER: Budget & Save */}
      <div style={styles.topBar}>
        <div style={styles.budgetBox}>
          <span style={styles.budgetLabel}>BUDGET</span>
          <div style={isOverBudget ? styles.budgetValueError : styles.budgetValue}>
            {totalCost}<span style={{fontSize: 14, opacity: 0.5}}> / {myTeam.budget}$</span>
          </div>
        </div>

        <button
          disabled={isLocked || isOverBudget || isIncomplete || !teamHasChanged}
          style={{
            ...styles.saveBtn,
            opacity: (isLocked || isOverBudget || isIncomplete || !teamHasChanged) ? 0.5 : 1,
            backgroundColor: isOverBudget ? theme.colors.error : theme.colors.primary,
            color: teamHasChanged ? undefined : "white"
          }}
          onClick={uploadTeam}
        >
          {isOverBudget ? 'ÖVER BUDGET' : teamHasChanged ? 'SPARA LAG' : 'SPARAT'}
        </button>
      </div>

      {/* PLANEN */}
      <div style={styles.pitch}>
        <div style={styles.pitchLines}>
          {/* Striker */}
          <div style={styles.formationRow}><PlayerSlot slotId="ST1" label="ST" /></div>
          {/* Mittfält */}
          <div style={styles.formationRow}>
            <PlayerSlot slotId="MF1" label="MF" />
            <PlayerSlot slotId="MF2" label="MF" />
          </div>
          {/* Backar */}
          <div style={styles.formationRow}>
            <PlayerSlot slotId="DF1" label="DF" />
            <PlayerSlot slotId="DF2" label="DF" />
          </div>
          {/* Målvakt */}
          <div style={styles.formationRow}><PlayerSlot slotId="GK1" label="GK" /></div>
        </div>
      </div>

      {/* MODAL: Player Selection */}
      {selectingSlot && (
        <div style={styles.overlay} onClick={() => setSelectingSlot(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>VÄLJ {selectingSlot.substring(0, 2)}</h2>
              <button style={styles.closeBtn} onClick={() => setSelectingSlot(null)}>✕</button>
            </div>
            
            <div style={styles.modalGrid}>
              {players.map(p => {
                const isSelected = Object.values(myTeam.players).includes(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={isSelected}
                    onClick={() => selectPlayer(p.id)}
                    style={isSelected ? styles.marketCardDisabled : styles.marketCard}
                  >
                    <img src={p.image} style={styles.marketImg} alt={p.name} />
                    <div style={styles.marketInfo}>
                      <div style={styles.marketName}>{p.name.split(' ')[0]}</div>
                      <div style={styles.marketPrice}>{p.cost}$</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <LoadingModal text={loadingText} />
    </div>
  );
};

// --- STYLES ---
const styles: Record<string, React.CSSProperties> = {
  page: {
    backgroundColor: theme.colors.background,
    minHeight: '100vh',
    color: '#fff',
    fontFamily: '"Inter", sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    background: 'linear-gradient(to bottom, #101010 80%, transparent)',
  },
  budgetBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  budgetLabel: {
    fontSize: '10px',
    fontWeight: 900,
    color: '#555',
    letterSpacing: '1px',
  },
  budgetValue: {
    fontSize: '24px',
    fontWeight: 900,
    fontStyle: 'italic',
  },
  budgetValueError: {
    fontSize: '24px',
    fontWeight: 900,
    fontStyle: 'italic',
    color: theme.colors.error,
  },
  saveBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 900,
    fontSize: '14px',
    fontStyle: 'italic',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  },
  pitch: {
    flexGrow: 1,
    margin: '0 10px 100px 10px',
    background: 'linear-gradient(to bottom, #1a2e1a 0%, #101010 100%)',
    borderRadius: '20px',
    border: '1px solid #222',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: "5rem"
  },
  pitchLines: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '20px 0',
    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  formationRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    width: '100%',
  },
  slotWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  slotLabel: {
    fontSize: '9px',
    fontWeight: 900,
    color: 'rgba(57, 255, 20, 0.4)',
  },
  playerBtnEmpty: {
    width: '65px',
    height: '65px',
    borderRadius: '18px',
    backgroundColor: 'rgba(0,0,0,0.4)',
    border: '2px dashed #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  playerBtnActive: {
    width: '65px',
    height: '65px',
    borderRadius: '18px',
    backgroundColor: '#000',
    border: '2px solid #39ff14',
    position: 'relative',
    padding: 0,
    overflow: 'visible',
    cursor: 'pointer',
  },
  slotImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '16px',
  },
  slotPriceBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#39ff14',
    color: '#000',
    fontSize: '9px',
    fontWeight: 900,
    padding: '2px 5px',
    borderRadius: '4px',
  },
  slotName: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  },

  // Modal Styles
  overlay: {
    position: 'fixed',
    inset: 0,
    background: "rgba(0, 0, 0, 0.9)",
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modal: {
    background: '#151515',
    width: '100%',
    maxWidth: '450px',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid #222',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 900,
    fontStyle: 'italic',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: '24px',
    cursor: 'pointer',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    overflowY: 'auto',
    padding: '5px',
  },
  marketCard: {
    background: '#222',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  marketCardDisabled: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '12px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  marketImg: {
    width: '100%',
    aspectRatio: '1/1',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  marketInfo: {
    textAlign: 'center',
  },
  marketName: {
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#fff',
  },
  marketPrice: {
    fontSize: '12px',
    fontWeight: 900,
    color: '#39ff14',
    fontStyle: 'italic',
  }
};

export default TeamBuilder;