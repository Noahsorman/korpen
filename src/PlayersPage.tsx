import { useState } from "react"
import { useAuth } from "./AuthContext"
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, writeBatch } from "firebase/firestore";

interface MatchPlayer {
  id: "string",
  played: boolean,
  goals: number,
  assists: number
}

interface Match {
  teamGoals: number,
  opponentGoals: number,
  players: MatchPlayer[]
}

interface Player {
  id: string;
  name: string;
  cost: number;
  image: string;
  oldCost: number;
}

const PlayersPage = () => {

  const { players, setPlayers } = useAuth()
  const [reportMatch, setReportMatch] = useState<Match | null>(null)

  return <div>
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 10,
      justifyContent: "center",
      padding: "2rem",
      marginBottom: "5rem",
      scrollbarWidth: "none",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "right"
      }}>
        <span style={{
          backgroundColor: "#ddd",
          padding: 8,
          borderRadius: 10,
          fontWeight: 800,
          color: "black"
        }}
          onClick={() => setReportMatch({
            teamGoals: 0, opponentGoals: 0, players: players.reduce<MatchPlayer[]>((prev, cur) => {
              const p = { id: cur.id, played: true, goals: 0, assists: 0 } as MatchPlayer
              prev.push(p)
              return prev
            }, [])
          })}
        >
          RAPPORTERA MATCH
        </span>
      </div>
      {players.map(p => (
        <div key={p.id} style={{
          backgroundColor: "hsla(0, 0%, 0%, 80%)",
          display: "flex",
          height: "4rem",
          borderRadius: "25px",
          alignItems: "center",
          gap: 8
        }}>
          <img src={p.image} alt={p.name} style={{
            width: "4rem",
            height: "4rem",
            borderTopLeftRadius: "25px",
            borderBottomLeftRadius: "25px"
          }} />
          <div style={{
            textTransform: "uppercase",
            fontWeight: 700,
            letterSpacing: 1,
            flexGrow: 1
          }}>{p.name}</div>
          <div style={{
            width: "5rem",
            textAlign: "left"

          }}>
            <div>Cost: ${p.cost}</div>
            <div>Points: 0</div>
          </div>
        </div>
      ))}
    </div>
    {/* Modal / Popup */}
    {reportMatch && (
      <div style={styles.overlay} onClick={() => setReportMatch(null)}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={() => setReportMatch(null)}>✕</button>
          <h2 style={styles.modalTitle}>Rapportera match</h2>
          <div style={styles.modalContent}>
            <div>
              <h3>Slutresultat</h3>
              <div style={{ display: "flex", padding: "0 2rem", gap: 5, justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: "4rem", fontSize: 16 }}>Vi</div>
                <div style={{
                  width: "2rem",
                  height: 4
                }} />
                <div style={{ width: "4rem", fontSize: 16 }}>Dem</div>
              </div>
              <div style={{ display: "flex", padding: "0 2rem", gap: 5, justifyContent: "center", alignItems: "center" }}>
                <input style={{ width: "4rem", fontSize: 24, textAlign: "center" }}
                  value={reportMatch.teamGoals}
                  onChange={(e) => setReportMatch(rm => {
                    if (!rm) return null
                    return { ...rm, teamGoals: parseInt(e.currentTarget.value) }
                  })}
                />
                <div style={{
                  backgroundColor: "gray",
                  width: "2rem",
                  height: 4
                }} />
                <input style={{ width: "4rem", fontSize: 24, textAlign: "center" }}
                  value={reportMatch.opponentGoals}
                  onChange={(e) => setReportMatch(rm => {
                    if (!rm) return null
                    return { ...rm, opponentGoals: parseInt(e.currentTarget.value) }
                  })}
                />
              </div>
            </div>
            <div>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                columnGap: 10,
                rowGap: 5,
              }}>
                <thead>
                  <tr>
                    <th>Medverkat</th>
                    <th>Spelare</th>
                    <th>Mål</th>
                    <th>Assist</th>
                  </tr>
                </thead>
                <tbody>
                  {reportMatch.players.map(p => (
                    <tr key={p.id} style={{
                      width: "100%"
                    }}>
                      <td>
                        <input type="checkbox" style={{ width: "1.2rem", height: "1.2rem" }}
                          checked={p.played}
                          onChange={e => setReportMatch(rm => {
                            if (!rm) return rm
                            const copy = JSON.parse(JSON.stringify(rm)) as Match
                            let p2 = copy.players.find(p2 => p2.id === p.id)
                            if (!p2) return copy
                            p2.played = e.target.checked
                            p2.goals = 0
                            p2.assists = 0
                            return copy
                          })}
                        />
                      </td>
                      <td style={{ textAlign: "left", paddingRight: 8 }}>{players.find(p2 => p2.id === p.id)?.name}</td>
                      <td>
                        <input type="number" step={1} min={0} placeholder="0" style={{
                          width: "1.5rem",
                          display: p.played ? undefined : "none"
                        }}
                          value={p.goals}
                          onChange={e => setReportMatch(rm => {
                            if (!rm) return rm
                            const copy = JSON.parse(JSON.stringify(rm)) as Match
                            let i = copy.players.findIndex(p2 => p2.id === p.id)
                            if (i >= 0) copy.players[i].goals = parseInt(e?.target?.value) ?? 0

                            return copy
                          })}
                          disabled={!p.played}
                        />
                      </td>
                      <td>
                        <input type="number" step={1} min={0} placeholder="0" style={{
                          width: "1.5rem",
                          display: p.played ? undefined : "none"
                        }}
                          value={p.assists}
                          onChange={e => setReportMatch(rm => {
                            if (!rm) return rm
                            const copy = JSON.parse(JSON.stringify(rm)) as Match
                            let i = copy.players.findIndex(p2 => p2.id === p.id)
                            if (i >= 0) copy.players[i].assists = parseInt(e?.target?.value) ?? 0

                            return copy
                          })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                marginTop: 30,
                padding: 10,
                backgroundColor: "lime",
                borderRadius: 20,
                color: "black",
                fontSize: 24,
                fontWeight: 800
              }}
                onClick={async () => {
                  const newPlayers = JSON.parse(JSON.stringify(players)) as Player[]

                  newPlayers.map(p => {
                    const p2 = reportMatch.players.find(p2 => p2.id === p.id)
                    if (!p2) return;

                    let attendancePoints = !p2.played ? -2 :
                      reportMatch.teamGoals > reportMatch.opponentGoals ? 2 + reportMatch.teamGoals - reportMatch.opponentGoals :
                      reportMatch.teamGoals === reportMatch.opponentGoals ? 2 :
                        1

                    if (attendancePoints > 4) attendancePoints = 4

                    p.oldCost = p.cost
                    p.cost += p2.goals * 2 + p2.assists + attendancePoints
                    
                    if(p.cost < 10) p.cost = 10
                  })
                  
                  newPlayers.sort((a, b) => b.cost - a.cost)

                  setPlayers(newPlayers);

                  if (auth.currentUser?.uid === "7dUzXLycFUfL21pgMrxElNGZbTh1" && confirm("Uppdatera databasen? Detta går inte att ångra.")) {
                    const batch = writeBatch(db)
                    newPlayers.map(p => {
                      const {cost, oldCost, id} = p
                      batch.set(doc(db, "player", id), {cost, oldCost}, {merge:true})
                    })
                    batch.commit();
                  } else alert("Värdet på spelarna har endast uppdaterats på din enhet temporärt. Då du inte har tillräckliga behörigheter")

                  setReportMatch(null)
                }}
              >CONFIRM</div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
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
    flexDirection: "column"
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

export default PlayersPage