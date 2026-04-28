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

  const cardContainerStyle = (isPlayed: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    background: isPlayed
      ? 'linear-gradient(90deg, #111 0%, #1a1a1a 100%)'
      : 'linear-gradient(90deg, #1a1a1a 0%, #222 100%)',
    padding: '12px 20px',
    borderRadius: '12px',
    marginBottom: '12px',
    border: isPlayed ? '1px solid #333' : '1px solid #39ff1433', // Svagt grönt sken för kommande
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    position: 'relative',
    overflow: 'hidden',
    opacity: isPlayed ? 0.85 : 1,
  });

  const dateBadgeStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: '20px',
    borderRight: '1px solid #333',
    minWidth: '60px',
  };

  const matchupAreaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    padding: '0 25px',
    gap: '15px',
    flexGrow: 1,
    justifyContent: "space-around"
  };

  const teamSideStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',    
    flexDirection: "column",
  };

  const logoStyle: React.CSSProperties = {
    width: '45px',
    height: '45px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
    borderRadius: "100%",
  };

  const infoCenterStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
  };

  const vsStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '900',
    color: '#39ff14',
    letterSpacing: '1px',
    background: '#111',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #39ff14',
  };

  const scoreWrapperStyle = (t: number, o: number): React.CSSProperties => ({
    fontSize: '26px',
    fontWeight: '900',
    fontFamily: 'monospace', // Ger en sportigare digital känsla
    color: t > o ? '#39ff14' : t < o ? '#ff4444' : '#fff',
    display: 'flex',
    alignItems: 'center',
  });

  const statusAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };

  const timeStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '700',
    color: '#39ff14',
  };

  const playedBadgeStyle: React.CSSProperties = {
    fontSize: '9px',
    fontWeight: '700',
    color: '#666',
    background: '#222',
    padding: '2px 6px',
    borderRadius: '3px',
    marginTop: '4px'
  };

  const teamName: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#888',
    textWrap: "nowrap",
    position: "absolute",
    top: "4.3rem"
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex" }}>
        <h2 style={{ fontStyle: 'italic', fontWeight: '900', letterSpacing: '-1px', flex: 1 }}>
          MATCHER <span style={{ color: '#39ff14' }}>&</span> RESULTAT
        </h2>
        <button
          style={styles.reportBtn}
          onClick={() => setReportMatch({
            teamGoals: 0, opponentGoals: 0, id: "",
            players: players.map(p => ({ id: p.id, played: true, goals: 0, assists: 0, yellowCard: false, redCard: false })),
            played: false, date: Timestamp.now(), opponentsName: "", opponentsColor: "red", teamId: 0
          })}
        >
          RAPPORTERA MATCH
        </button>
      </div>

      {sortedMatches.map((match, i) => {
        const { day, month, time } = formatDate(match.date);

        return (
          <div key={i} style={cardContainerStyle(match.played)}>
            {/* Vänster: Datum-badge */}
            <div style={dateBadgeStyle}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>{month}</span>
              <span style={{ fontSize: '22px', fontWeight: '900', lineHeight: '1' }}>{day}</span>{/* Höger: Detaljer & Status */}
              <div style={statusAreaStyle}>
                <div style={{ textAlign: 'right' }}>
                  {!match.played ? (
                    <div style={timeStyle}>KL {time}</div>
                  ) : (
                    <div style={playedBadgeStyle}>AVSLUTAD</div>
                  )}
                </div>
              </div>
            </div>

            {/* Mitten: Matchup */}
            <div style={matchupAreaStyle}>
              {/* Vårt lag */}
              <div style={teamSideStyle}>
                <img src={"https://korpenkorpforeningenjonkoping.zoezi.se/api/public/image/get?size=200x200&type=team&id=536"} alt="Vår logga" style={logoStyle} />
                <div style={teamName}>Unatletico Madrid</div>
              </div>

              {/* VS / Resultat-sektion */}
              <div style={infoCenterStyle}>
                {match.played ? (
                  <div style={scoreWrapperStyle(match.teamGoals || 0, match.opponentGoals || 0)}>
                    <span>{match.teamGoals}</span>
                    <span style={{ color: '#444', margin: '0 4px' }}>-</span>
                    <span>{match.opponentGoals}</span>
                  </div>
                ) : (
                  <div style={vsStyle}>VS</div>
                )}
              </div>

              {/* Motståndare */}
              <div style={teamSideStyle}>
                <img src={`https://korpenkorpforeningenjonkoping.zoezi.se/api/public/image/get?size=200x200&type=team&id=${match.teamId}`} alt={match.opponentsName} style={logoStyle} />
                <div style={teamName}>{match.opponentsName}</div>
              </div>
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
                              setReportMatch({ ...reportMatch, players: newP });
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
                              setReportMatch({ ...reportMatch, players: newP });
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
                              setReportMatch({ ...reportMatch, players: newP });
                            }} />
                        </td>
                        <td style={styles.tdCenter}>
                          <input type="checkbox" checked={p.redCard} disabled={!p.played} onChange={e => {
                            const newP = [...reportMatch.players];
                            newP[idx].redCard = e.target.checked;
                            if (e.target.checked) newP[idx].yellowCard = false;
                            setReportMatch({ ...reportMatch, players: newP });
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