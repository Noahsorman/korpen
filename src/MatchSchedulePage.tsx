import React, { useState } from 'react';
import { doc, Timestamp, writeBatch } from 'firebase/firestore';
import { useAuth, type Match, type Player } from './AuthContext';
import { pointsTemplate, pricerTemplate } from './RulesPage';
import { db } from './firebaseConfig';

const MatchSchedule = () => {
  // Exempeldata direkt i komponenten
  const { matches, players, setPlayers, teams, setTeams, user } = useAuth()
  const [reportMatch, setReportMatch] = useState<Match | null>(null)

  // Sortering: Senaste/Närmaste först
  const sortedMatches = [...matches].sort((a, b) => a.date.seconds - b.date.seconds);

  const formatDate = (ts: Timestamp) => {
    const d = ts.toDate();
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase().replace('.', ''),
      time: d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const updatePointsAndCost = async () => {
    if (!reportMatch) return;
    if (reportMatch.opponentGoals < 0 || reportMatch.teamGoals < 0)
      return alert("Matchresultat saknas!")

    const newPlayers = JSON.parse(JSON.stringify(players)) as Player[]

    newPlayers.forEach(p => {
      const p2 = reportMatch.players.find(pm => pm.id === p.id)
      if (!p2) return;

      p.oldCost = p.cost
      p.cost += reportMatch.teamGoals! > reportMatch.opponentGoals! ? pricerTemplate.win.diff : 0
      p.cost += reportMatch.teamGoals! < reportMatch.opponentGoals! ? pricerTemplate.loss.diff : 0
      p.cost += reportMatch.opponentGoals === 0 ? pricerTemplate.cleanSheet.diff : 0
      p.cost += p2.goals * pricerTemplate.goal.diff
      p.cost += p2.assists * pricerTemplate.assist.diff
      p.cost += (!p2.played ? 1 : 0) * pricerTemplate.absent.diff
      p.cost += (p2.yellowCard ? 1 : 0) * pricerTemplate.yellowCard.diff
      p.cost += (p2.redCard ? 1 : 0) * pricerTemplate.redCard.diff

      if (p.cost < 10) p.cost = 10
    })

    const newTeams = teams.map(t => {
      let points = Object.entries(t.players).reduce((prev, [pos, id]) => {
        const p = reportMatch.players.find(pm => pm.id === id)
        const p2 = newPlayers.find(pl => pl.id === id)
        if (!p || !p2) return prev

        t.budget += p2.cost - p2.oldCost
        const position = pos.substring(0, 2).toLowerCase() as "st" | "mf" | "df" | "gk"

        const playerPoints = p.goals * pointsTemplate.goals[position]
          + p.assists * pointsTemplate.assists[position]
          + (p.yellowCard ? pointsTemplate.yellowCard[position] : 0)
          + (p.redCard ? pointsTemplate.redCard[position] : 0)
          + (p.played ? pointsTemplate.played[position] : 0)

        return prev + playerPoints
      }, 0)
      
      t.points = (t.points || 0) + points
      return t
    })

    newPlayers.sort((a, b) => b.cost - a.cost)
    newTeams.sort((a, b) => (b.points || 0) - (a.points || 0))

    setPlayers(newPlayers);
    setTeams(newTeams)

    if (user?.uid === "7dUzXLycFUfL21pgMrxElNGZbTh1" && confirm("Uppdatera databasen? Detta går inte att ångra.")) {
      const batch = writeBatch(db)
      newPlayers.forEach(p => {
        batch.set(doc(db, "player", p.id), { cost: p.cost, oldCost: p.oldCost }, { merge: true })
      })
      newTeams.forEach(t => {
        batch.set(doc(db, "teams", t.id), { points: t.points, budget: t.budget }, { merge: true })
      })
      await batch.commit();
    } else {
      alert("Värdena har endast uppdaterats temporärt (Admin-behörighet saknas).")
    }

    setReportMatch(null)
  }

  // STYLES
  const containerStyle: React.CSSProperties = {
    maxWidth: '500px',
    margin: '20px auto',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: 'sans-serif',
    padding: '10px'
  };

  const cardStyle = (isPlayed: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: isPlayed ? '#111' : '#1a1a1a',
    borderLeft: isPlayed ? '4px solid #333' : '4px solid #39ff14',
    marginBottom: '10px',
    padding: '15px',
    borderRadius: '4px',
    opacity: isPlayed ? 0.7 : 1,
  });

  const dateBoxStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '50px',
    borderRight: '1px solid #333',
    marginRight: '15px'
  };

  const scoreStyle = (t: number, o: number): React.CSSProperties => ({
    fontSize: '24px',
    fontWeight: '900',
    color: t > o ? '#39ff14' : t < o ? '#ff4444' : '#fff'
  });

  return (
    <div style={containerStyle}>
      <div style={{display: "flex"}}>
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', letterSpacing: '-1px', flex:1 }}>
          MATCHER <span style={{ color: '#39ff14' }}>&</span> RESULTAT          
        </h2>
        <button 
            style={styles.reportBtn}
            onClick={() => setReportMatch({
              teamGoals: 0, opponentGoals: 0, id: "",
              players: players.map(p => ({ id: p.id, played: true, goals: 0, assists: 0, yellowCard: false, redCard: false })),
              played: false, date: Timestamp.now(), opponentsName: "", opponentsColor: "red"
            })}
          >
            RAPPORTERA MATCH
          </button>
      </div>

      {sortedMatches.map((match, i) => {
        const { day, month, time } = formatDate(match.date);
        
        return (
          <div key={i} style={cardStyle(match.played)}>
            {/* Datum */}
            <div style={dateBoxStyle}>
              <span style={{ fontSize: '10px', color: '#888' }}>{month}</span>
              <span style={{ fontSize: '20px', fontWeight: '900' }}>{day}</span>
            </div>

            {/* Motståndare */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: match.opponentsColor }} />
                <span style={{ fontWeight: '700', textTransform: 'uppercase' }}>{match.opponentsName}</span>
              </div>
              {!match.played && <div style={{ fontSize: '12px', color: '#39ff14', marginTop: '4px' }}>KL {time}</div>}
            </div>

            {/* Resultat eller Status */}
            <div>
              {match.played ? (
                <div style={scoreStyle(match.teamGoals || 0, match.opponentGoals || 0)}>
                  {match.teamGoals}-{match.opponentGoals}
                </div>
              ) : (
                <div style={{ fontSize: '10px', fontWeight: '900', color: '#39ff14', border: '1px solid #39ff14', padding: '2px 5px' }}>
                  UPCOMING
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* MODAL */}
      {reportMatch && (
        <div style={styles.overlay} onClick={() => setReportMatch(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setReportMatch(null)}>✕</button>
            <h2 style={styles.modalTitle}>MATCHRAPPORT</h2>
            
            <div style={styles.modalContent}>
              {/* RESULTAT-INPUTS */}
              <div style={styles.scoreSection}>
                <div style={styles.scoreColumn}>
                  <label style={styles.inputLabel}>UNATLETICO</label>
                  <input 
                    type="number"
                    style={styles.scoreInput}
                    value={reportMatch.teamGoals >= 0 ? reportMatch.teamGoals : ""}
                    onChange={(e) => setReportMatch({ ...reportMatch, teamGoals: parseInt(e.target.value) ?? -1 })}
                    min={0}
                  />
                </div>
                <div style={styles.scoreDivider}>—</div>
                <div style={styles.scoreColumn}>
                  <label style={styles.inputLabel}>MOTSTÅNDARE</label>
                  <input 
                    type="number"
                    style={styles.scoreInput}
                    value={reportMatch.opponentGoals >= 0 ? reportMatch.opponentGoals : ""}
                    onChange={(e) => setReportMatch({ ...reportMatch, opponentGoals: parseInt(e.target.value) ?? -1 })}
                    min={0}
                  />
                </div>
              </div>

              {/* SPELARTABELL */}
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.thRotate}>SPELAT</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>NAMN</th>
                      <th style={styles.thNormal}>MÅL</th>
                      <th style={styles.thNormal}>ASS</th>
                      <th style={{ ...styles.thRotate, color: 'yellow' }}>GULT</th>
                      <th style={{ ...styles.thRotate, color: 'red' }}>RÖTT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportMatch.players.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #222', opacity: p.played ? 1 : 0.4 }}>
                        <td style={styles.tdCenter}>
                          <input 
                            type="checkbox" 
                            checked={p.played}
                            onChange={e => {
                              const newPlayers = [...reportMatch.players];
                              newPlayers[idx] = { ...p, played: e.target.checked };
                              setReportMatch({ ...reportMatch, players: newPlayers });
                            }}
                          />
                        </td>
                        <td style={styles.tdName}>{players.find(pl => pl.id === p.id)?.name}</td>
                        <td style={styles.tdCenter}>
                          <input 
                            type="number" 
                            style={styles.tableInput} 
                            disabled={!p.played}
                            value={p.goals <= 0 ? "" : p.goals}
                            onChange={e => {
                               const newP = [...reportMatch.players];
                               newP[idx].goals = parseInt(e.target.value) || -1;
                               setReportMatch({...reportMatch, players: newP});
                            }}
                            min={0}
                          />
                        </td>
                        <td style={styles.tdCenter}>
                          <input 
                            type="number" 
                            style={styles.tableInput} 
                            disabled={!p.played}
                            value={p.assists <= 0 ? "" : p.assists}
                            onChange={e => {
                               const newP = [...reportMatch.players];
                               newP[idx].assists = parseInt(e.target.value) || 0;
                               setReportMatch({...reportMatch, players: newP});
                            }}
                            min={0}
                          />
                        </td>
                        <td style={styles.tdCenter}>
                           <input type="checkbox" 
                            checked={p.yellowCard} 
                            disabled={!p.played || p.redCard} 
                            onChange={e => {
                             const newP = [...reportMatch.players];
                             newP[idx].yellowCard = e.target.checked;
                             setReportMatch({...reportMatch, players: newP});
                           }} />
                        </td>
                        <td style={styles.tdCenter}>
                           <input type="checkbox" checked={p.redCard} disabled={!p.played} onChange={e => {
                             const newP = [...reportMatch.players];
                             newP[idx].redCard = e.target.checked;
                             if(e.target.checked) newP[idx].yellowCard = false;
                             setReportMatch({...reportMatch, players: newP});
                           }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button style={styles.confirmBtn} onClick={updatePointsAndCost}>
                BEKRÄFTA RESULTAT
              </button>
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
    background: "rgba(0, 0, 0, 0.9)",
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    zIndex: 2000,
    paddingTop: '20px'
  },
  modal: {
    background: '#101010',
    width: '95%',
    maxWidth: '500px',
    borderRadius: '20px',
    padding: '24px',
    position: 'relative',
    border: '1px solid #222',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalContent: {
    marginBottom: "5rem"
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 900,
    fontStyle: 'italic',
    marginBottom: '30px',
    textAlign: 'center'
  },
  scoreSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px'
  },
  scoreColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  inputLabel: {
    fontSize: '9px',
    fontWeight: 900,
    color: '#555',
    marginBottom: '8px'
  },
  scoreInput: {
    width: '60px',
    height: '60px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#39ff14',
    fontSize: '24px',
    textAlign: 'center',
    fontWeight: 900
  },
  scoreDivider: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#333',
    marginTop: '20px'
  },
  tableContainer: {
    width: '100%',
    marginBottom: '30px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  thRotate: {
    fontSize: '8px',
    fontWeight: 900,
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    padding: '10px 5px',
    color: '#555'
  },
  thNormal: {
    fontSize: '8px',
    fontWeight: 900,
    color: '#555',
    verticalAlign: 'bottom',
    paddingBottom: '10px'
  },
  tdCenter: {
    textAlign: 'center',
    padding: '8px 0'
  },
  tdName: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  tableInput: {
    width: '35px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#fff',
    textAlign: 'center',
    borderRadius: '4px',
    fontSize: '12px',
    padding: '4px 0'
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: '#39ff14',
    color: '#000',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontWeight: 900,
    fontSize: '16px',
    fontStyle: 'italic',
    cursor: 'pointer',
    marginTop: '20px'
  },
  reportBtn: {
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 900,
    fontSize: '10px',
    letterSpacing: '1px',
    cursor: 'pointer',
  }
}

export default MatchSchedule;