import { useAuth } from './AuthContext';

const LeaguePage = () => {
  const { teams, players } = useAuth()

  const positionOrder = ['ST1', 'MF2', 'MF1', 'DF2', 'DF1', 'GK1'];

  return (
    <div className="min-h-screen bg-[#101010] text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#39ff14] mb-2">LEAGUE STANDINGS</h1>
        </header>

        <div className="grid gap-4">
          {teams.map((team, index) => (
            <div
              key={index}
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

                }}>
                  {Object.entries(team.players)
                    .sort(([posA], [posB]) => positionOrder.indexOf(posA) - positionOrder.indexOf(posB))
                    .map(([position, playerId], i) => {

                    const player = players.find(p => p.id === playerId)

                    return<div style={{position: "relative", marginBottom: 16, marginRight: -10}} key={i}>
                      <img
                        src={player?.image}
                        alt="player"
                        style={{
                          width: 40,
                          height: 40,
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
                      }}>{
                        position.indexOf("DF") >= 0 ? "DF":
                        position.indexOf("MF") >= 0 ? "MF":
                        position.indexOf("ST") >= 0 ? "ST":
                        "GK"
                      }</div>
                    </div>
                  })}
                </div>

                {/* Poäng */}
                <div className="col-span-2 text-left md:text-right">
                  <span className="text-2xl font-mono font-bold text-[#39ff14]">{team.points ?? 0}</span>
                  <span className="text-[10px] text-gray-600 ml-1 uppercase"> poäng</span>
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