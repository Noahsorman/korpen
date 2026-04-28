
import { useAuth } from "./AuthContext"



interface Player {
  id: string;
  name: string;
  cost: number;
  image: string;
  oldCost: number;
}

const PlayersPage = () => {
  const { players, teams } = useAuth()
  

  const getUsage = (p: Player) => {
    if (teams.length === 0) return 0;
    return Math.round((teams.reduce((prev, cur) => {
      return prev + (Object.values(cur.players).some(p2 => p2 === p.id) ? 1 : 0)
    }, 0) / teams.length) * 100)
  }  

  return (
    <div style={styles.pageContainer}>
      
      {/* HEADER SECTION */}
      <div style={styles.header}>
        <h1 style={styles.title}>TRUPPEN <span style={{color: '#39ff14'}}>&</span> MARKNAD</h1>        
      </div>

      {/* PLAYER LIST */}
      <div style={styles.playerList}>
        {players.map(p => (
          <div key={p.id} style={styles.playerCard}>
            <div style={styles.imageContainer}>
              <img src={p.image} alt={p.name} style={styles.playerImg} />
              <span style={{
              //fontSize: '1.5rem',
              position: "absolute",
              fontWeight: 900,
              fontStyle: 'italic',
              letterSpacing: '-1px',
              margin: 0
            }}>{p.number}</span>
            </div>            
            
            <div style={styles.playerInfo}>
              <div style={styles.playerName}>{p.name}</div>
              <div style={styles.playerStats}>
                ÄGD AV {getUsage(p)}%
              </div>
            </div>

            <div style={styles.priceTag}>
              <span style={styles.priceLabel}>PRIS</span>
              <span style={styles.priceValue}>{p.cost}$</span>
            </div>
          </div>
        ))}
      </div>      
    </div>
  )
}

// --- STYLES ---
const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    backgroundColor: '#101010',
    minHeight: '100vh',
    padding: '20px',
    paddingBottom: '100px',
    color: '#fff',
    fontFamily: '"Inter", sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    marginTop: '20px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 900,
    fontStyle: 'italic',
    letterSpacing: '-1px',
    margin: 0
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
    cursor: 'pointer'
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  playerCard: {
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  imageContainer: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    overflow: 'hidden',
    marginRight: '15px',
    backgroundColor: '#222'
  },
  playerImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  playerInfo: {
    flexGrow: 1
  },
  playerName: {
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: '14px',
    letterSpacing: '0.5px'
  },
  playerStats: {
    fontSize: '10px',
    color: '#666',
    fontWeight: 700,
    marginTop: '2px'
  },
  priceTag: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column'
  },
  priceLabel: {
    fontSize: '8px',
    fontWeight: 900,
    color: '#39ff14'
  },
  priceValue: {
    fontSize: '18px',
    fontWeight: 900,
    fontStyle: 'italic'
  },

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
  }
};

export default PlayersPage;