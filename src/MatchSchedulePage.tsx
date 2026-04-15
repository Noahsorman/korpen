import React from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const MatchSchedule = () => {
  // Exempeldata direkt i komponenten
  const { matches } = useAuth()

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
      <h2 style={{ fontStyle: 'italic', fontWeight: '900', letterSpacing: '-1px' }}>
        MATCHER <span style={{ color: '#39ff14' }}>&</span> RESULTAT
      </h2>

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
    </div>
  );
};

export default MatchSchedule;