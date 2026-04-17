import { useAuth, type Team } from './AuthContext';

const LeaguePage = () => {
  const { teams, players } = useAuth();

  const positionOrder = ['GK1', 'DF1', 'DF2', 'MF1', 'MF2', 'ST1']; // Omvänd ordning för snyggare stapling från vänster till höger

  const getTeamCost = (t: Team) => {
    return Object.values(t.players).reduce((prev, cur) => {
      return prev + (players.find(p => p.id === cur)?.cost ?? 0);
    }, 0);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>LEAGUE <span style={{ color: '#39ff14' }}>STANDINGS</span></h1>
        </header>

        <div style={styles.list}>
          {teams.map((team, index) => {
            const isFirst = index === 0;
            const teamCost = getTeamCost(team);

            return (
              <div key={index} style={isFirst ? styles.cardFirst : styles.card}>
                
                {/* VÄNSTER: RANK */}
                <div style={styles.rankSection}>
                  <div style={isFirst ? styles.rankNumFirst : styles.rankNum}>
                    {index + 1}
                  </div>
                </div>

                {/* MITTEN: INFO & LINEUP */}
                <div style={styles.infoSection}>
                  <div style={styles.ownerRow}>
                    <span style={styles.ownerName}>{team.owner.split("@")[0]}</span>
                    <span style={styles.budgetBadge}>
                      {teamCost} / {team.budget} $
                    </span>
                  </div>

                  <div style={styles.playerStrip}>
                    {Object.entries(team.players)
                      .sort(([posA], [posB]) => positionOrder.indexOf(posB) - positionOrder.indexOf(posA))
                      .map(([position, playerId], i) => {
                        const player = players.find(p => p.id === playerId);
                        const posLabel = position.includes("GK") ? "GK" : position.substring(0, 2);

                        return (
                          <div key={i} style={styles.playerAvatarWrapper}>
                            <img
                              src={player?.image}
                              alt={posLabel}
                              style={styles.playerAvatar}
                            />
                            <div style={styles.posTag}>{posLabel}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* HÖGER: POÄNG */}
                <div style={styles.pointsSection}>
                  <div style={styles.pointsValue}>{team.points ?? 0}</div>
                  <div style={styles.pointsLabel}>PTS</div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#101010',
    color: '#fff',
    fontFamily: '"Inter", sans-serif',
    padding: '20px',
    paddingBottom: '100px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 900,
    fontStyle: 'italic',
    letterSpacing: '-2px',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#444',
    letterSpacing: '4px',
    marginTop: '5px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: "5rem"
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '15px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  cardFirst: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '20px',
    border: '2px solid #39ff14',
    boxShadow: '0 0 20px rgba(57, 255, 20, 0.15)',
    transform: 'scale(1.02)',
  },
  rankSection: {
    marginRight: '10px',
    textAlign: 'center',
    minWidth: '15px',
  },
  rankNum: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#333',
    fontStyle: 'italic',
  },
  rankNumFirst: {
    fontSize: '32px',
    fontWeight: 900,
    color: '#39ff14',
    fontStyle: 'italic',
  },
  infoSection: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  ownerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  ownerName: {
    fontSize: '14px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '150px',
  },
  budgetBadge: {
    fontSize: '10px',
    fontWeight: 700,
    backgroundColor: '#222',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#888',
  },
  playerStrip: {
    display: 'flex',
    gap: '4px',
  },
  playerAvatarWrapper: {
    position: 'relative',
    width: '32px',
    height: '32px',
  },
  playerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid #333',
    backgroundColor: '#000',
  },
  posTag: {
    position: 'absolute',
    top: -15,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '7px',
    fontWeight: 900,
    //backgroundColor: '#000',
    color: '#fff',
    textShadow: "1px 1px 5px black",
    // padding: '1px 3px',
    borderRadius: '2px',
    //border: '1px solid #333',
  },
  pointsSection: {
    marginLeft: '10px',
    textAlign: 'right',
    minWidth: '30px',
  },
  pointsValue: {
    fontSize: '28px',
    fontWeight: 900,
    fontStyle: 'italic',
    color: '#39ff14',
    lineHeight: 1,
  },
  pointsLabel: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#444',
  },
};

export default LeaguePage;