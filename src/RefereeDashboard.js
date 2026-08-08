// src/RefereeDashboard.js - Referee sees EXACTLY what reviewer sees (FIXED)
import React, { useState, useEffect, useCallback } from 'react';

const STYLES = {
  container: { padding: '20px', background: '#000', minHeight: '100vh', fontFamily: 'sans-serif', color: '#eee', boxSizing: 'border-box' },
  mainHeader: { color: '#fff', marginTop: 0, marginBottom: 20, fontSize: '1.5rem', borderBottom: '2px solid #222', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  panel: { background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, padding: 16, marginBottom: 16, color: '#eee' },
  header: { margin: 0, marginBottom: 12, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: 1, color: '#ffc107', display: 'flex', alignItems: 'center', gap: '8px' },
  button: { padding: '10px 16px', background: '#2c2c54', color: '#fff', border: '1px solid #444', borderRadius: 4, fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  buttonGold: { padding: '10px 16px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' },
  buttonDanger: { padding: '10px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' },
  input: { padding: '8px 12px', borderRadius: 4, border: '1px solid #555', background: '#222', color: '#fff', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  metaText: { fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }
};

const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '5-3-2', '4-2-3-1'];

const FORMATION_SLOTS = {
  '4-4-2': [
    { label: 'GK', top: 88, left: 50 }, { label: 'LB', top: 70, left: 15 }, { label: 'CB1', top: 70, left: 35 }, { label: 'CB2', top: 70, left: 65 }, { label: 'RB', top: 70, left: 85 },
    { label: 'LM', top: 50, left: 15 }, { label: 'CM1', top: 50, left: 35 }, { label: 'CM2', top: 50, left: 65 }, { label: 'RM', top: 50, left: 85 },
    { label: 'ST1', top: 25, left: 35 }, { label: 'ST2', top: 25, left: 65 }
  ],
  '4-3-3': [
    { label: 'GK', top: 88, left: 50 }, { label: 'LB', top: 70, left: 15 }, { label: 'CB1', top: 70, left: 35 }, { label: 'CB2', top: 70, left: 65 }, { label: 'RB', top: 70, left: 85 },
    { label: 'CM1', top: 50, left: 25 }, { label: 'CM2', top: 50, left: 50 }, { label: 'CM3', top: 50, left: 75 },
    { label: 'LW', top: 20, left: 20 }, { label: 'ST', top: 15, left: 50 }, { label: 'RW', top: 20, left: 80 }
  ],
  '3-5-2': [
    { label: 'GK', top: 88, left: 50 }, { label: 'CB1', top: 70, left: 25 }, { label: 'CB2', top: 70, left: 50 }, { label: 'CB3', top: 70, left: 75 },
    { label: 'LWB', top: 52, left: 10 }, { label: 'CM1', top: 50, left: 30 }, { label: 'CM2', top: 50, left: 50 }, { label: 'CM3', top: 50, left: 70 }, { label: 'RWB', top: 52, left: 90 },
    { label: 'ST1', top: 22, left: 35 }, { label: 'ST2', top: 22, left: 65 }
  ],
  '4-5-1': [
    { label: 'GK', top: 88, left: 50 }, { label: 'LB', top: 70, left: 15 }, { label: 'CB1', top: 70, left: 35 }, { label: 'CB2', top: 70, left: 65 }, { label: 'RB', top: 70, left: 85 },
    { label: 'LM', top: 50, left: 10 }, { label: 'CM1', top: 50, left: 30 }, { label: 'CM2', top: 50, left: 50 }, { label: 'CM3', top: 50, left: 70 }, { label: 'RM', top: 50, left: 90 },
    { label: 'ST', top: 18, left: 50 }
  ],
  '5-3-2': [
    { label: 'GK', top: 88, left: 50 }, { label: 'LWB', top: 68, left: 10 }, { label: 'CB1', top: 70, left: 28 }, { label: 'CB2', top: 70, left: 50 }, { label: 'CB3', top: 70, left: 72 }, { label: 'RWB', top: 68, left: 90 },
    { label: 'CM1', top: 48, left: 25 }, { label: 'CM2', top: 48, left: 50 }, { label: 'CM3', top: 48, left: 75 },
    { label: 'ST1', top: 22, left: 35 }, { label: 'ST2', top: 22, left: 65 }
  ],
  '4-2-3-1': [
    { label: 'GK', top: 88, left: 50 }, { label: 'LB', top: 72, left: 15 }, { label: 'CB1', top: 72, left: 35 }, { label: 'CB2', top: 72, left: 65 }, { label: 'RB', top: 72, left: 85 },
    { label: 'DM1', top: 57, left: 35 }, { label: 'DM2', top: 57, left: 65 },
    { label: 'LAM', top: 38, left: 20 }, { label: 'CAM', top: 35, left: 50 }, { label: 'RAM', top: 38, left: 80 },
    { label: 'ST', top: 18, left: 50 }
  ]
};

// ── LIVE PITCH VIEW (EXACTLY what reviewer sees, with correct orientation) ──
// Replace the existing LivePitchView function with this:

function LivePitchView({ formation, slots, title, color }) {
  const slotDefs = FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-4-2'];
  const isFlipped = title.includes('Team 2');
  
  return (
    <div style={{ flex: 1, minWidth: '200px', background: '#111', border: '1px solid #333', padding: 10, borderRadius: 8 }}>
      <div style={{ fontSize: 'clamp(11px, 1vw, 13px)', fontWeight: 'bold', color, marginBottom: 6, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '130%', 
        background: 'linear-gradient(180deg, #1b4d22 0%, #0f3014 100%)', 
        border: '1px solid #444', 
        borderRadius: 6, 
        overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
        
        {slotDefs.map((s, idx) => {
          const player = slots && slots[idx];
          const isEmpty = !player;
          const displayName = player ? player.name : s.label;
          // ── For Team 2, flip the position vertically ──
          const topPos = isFlipped ? (100 - s.top) : s.top;
          
          return (
            <div 
              key={idx} 
              style={{ 
                position: 'absolute', 
                top: `${topPos}%`, 
                left: `${s.left}%`, 
                transform: 'translate(-50%, -50%)', 
                textAlign: 'center',
              }}
            >
              <div style={{ 
                width: 'clamp(28px, 3vw, 36px)', 
                height: 'clamp(28px, 3vw, 36px)', 
                borderRadius: '50%', 
                background: player ? color : 'rgba(255,255,255,0.08)', 
                border: player ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 'clamp(5px, 0.6vw, 7px)', 
                fontWeight: 'bold', 
                color: '#fff', 
                padding: '2px', 
                boxSizing: 'border-box', 
                overflow: 'hidden', 
                wordBreak: 'break-word',
                transition: 'all 0.2s ease',
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  fontSize: player ? 'clamp(6px, 0.7vw, 8px)' : 'clamp(5px, 0.5vw, 6px)',
                  lineHeight: '1.1',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {displayName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── REFEREE PITCH VIEW (for placing players) ──
function RefereePitchView({ formation, slots, title, color, onSpotClick, selectedPlayer, isReferee }) {
  const slotDefs = FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-4-2'];
  
  return (
    <div style={{ flex: 1, minWidth: '240px', background: '#111', border: '1px solid #333', padding: 12, borderRadius: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 'bold', color, marginBottom: 8, textTransform: 'uppercase' }}>{title} ({formation})</div>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '130%', 
        background: 'linear-gradient(180deg, #1b4d22 0%, #0f3014 100%)', 
        border: '1px solid #444', 
        borderRadius: 6, 
        overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 50, height: 50, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)' }} />
        
        {slotDefs.map((s, idx) => {
          const card = slots && slots[idx];
          const isEmpty = !card;
          const isSelected = selectedPlayer !== null && isEmpty;
          const displayName = card ? card.name : s.label;
          
          return (
            <div 
              key={idx} 
              onClick={() => {
                if (isReferee && isSelected && onSpotClick) {
                  onSpotClick(idx);
                }
              }}
              style={{ 
                position: 'absolute', 
                top: `${s.top}%`, 
                left: `${s.left}%`, 
                transform: 'translate(-50%, -50%)', 
                textAlign: 'center',
                cursor: isReferee && isSelected ? 'pointer' : 'default',
              }}
            >
              <div style={{ 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                background: card ? color : 'rgba(255,255,255,0.08)', 
                border: isSelected ? '2px dashed #FFD700' : card ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 7, 
                fontWeight: 'bold', 
                color: '#fff', 
                padding: 2, 
                boxSizing: 'border-box', 
                overflow: 'hidden', 
                wordBreak: 'break-word',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 20px rgba(255,215,0,0.3)' : 'none',
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  fontSize: card ? '7px' : '6px',
                  lineHeight: '1.1',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {displayName}
                </span>
              </div>
              {isSelected && <div style={{ fontSize: 5, color: '#FFD700', marginTop: 2 }}>PLACE</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RefereeDashboard({ gs: propGs, gameState, socket, isReferee }) {
  const gs = gameState || propGs || {};
  const [fanSearch, setFanSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [livePitchState, setLivePitchState] = useState({});

  const viewersList = Array.isArray(gs.allViewers) ? gs.allViewers : [];
  const team1Players = gs.team1Picks || [];
  const team2Players = gs.team2Picks || [];
  const team1Slots = gs.deepTactics?.pitchState?.team1Slots || [];
  const team2Slots = gs.deepTactics?.pitchState?.team2Slots || [];

  // ── UPDATE LIVE PITCH STATE WHEN GS CHANGES ──
  useEffect(() => {
    if (gs?.deepTactics?.pitchState) {
      setLivePitchState(gs.deepTactics.pitchState);
    }
  }, [gs]);

  const handleFormationChange = (team, formation) => {
    socket.emit('refSetFormation', { team, formation });
  };

  const handleSpotClick = (half, slotIndex) => {
    if (!selectedPlayer) return;
    const halfSlots = half === 'team1' ? team1Slots : team2Slots;
    if (halfSlots[slotIndex]) return;
    socket.emit('refPlacePlayerOnPitch', { half, slotIndex, playerId: selectedPlayer });
    setSelectedPlayer(null);
  };

  const handleAssignReviewFan = (viewerId, role) => {
    socket.emit('refAssignReviewFanById', { userId: viewerId, role });
  };

  const handleRemoveReviewFan = (viewerId) => {
    socket.emit('refRemoveReviewFan', { userId: viewerId });
  };

  const handleClearAllReviewers = () => {
    if (window.confirm('Remove ALL assigned reviewers?')) {
      socket.emit('refClearAllReviewers');
    }
  };

  const handleStartDemonstration = (role) => {
    socket.emit('refStartDemonstration', { role });
  };

  if (!isReferee) return null;

  // ── Get live team names with formation ──
  const liveFormation1 = gs.team1Formation || '4-4-2';
  const liveFormation2 = gs.team2Formation || '4-4-2';

  return (
    <div style={STYLES.container}>
      <div style={STYLES.mainHeader}>
        <span>🧠 Deep Tactics Review — Control Tower</span>
        <span style={{ fontSize: '0.85rem', background: '#333', padding: '4px 10px', borderRadius: 12, color: '#00f2fe' }}>
          Phase: {gs.deepTactics?.phase || 'IDLE'}
        </span>
      </div>

      {/* ── PLAYER POOL & FORMATION CONTROLS ── */}
      <div style={STYLES.panel}>
        <h3 style={STYLES.header}>👥 Player Pool & Formation Controls</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', background: '#111', padding: 10, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#00f2fe', fontSize: '0.85rem', fontWeight: 'bold' }}>🔵 {gs.team1Name || 'Team 1'} ({team1Players.length})</span>
              <select
                value={gs.team1Formation || '4-4-2'}
                onChange={(e) => handleFormationChange('team1', e.target.value)}
                style={{ ...STYLES.input, width: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {team1Players.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: selectedPlayer === p.id ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)',
                    border: selectedPlayer === p.id ? '2px solid #FFD700' : '1px solid #333',
                    fontSize: '10px',
                    cursor: 'pointer',
                    color: '#fff',
                  }}
                >
                  {p.name} ({p.position})
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', background: '#111', padding: 10, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ff5252', fontSize: '0.85rem', fontWeight: 'bold' }}>🔴 {gs.team2Name || 'Team 2'} ({team2Players.length})</span>
              <select
                value={gs.team2Formation || '4-4-2'}
                onChange={(e) => handleFormationChange('team2', e.target.value)}
                style={{ ...STYLES.input, width: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {team2Players.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: selectedPlayer === p.id ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)',
                    border: selectedPlayer === p.id ? '2px solid #FFD700' : '1px solid #333',
                    fontSize: '10px',
                    cursor: 'pointer',
                    color: '#fff',
                  }}
                >
                  {p.name} ({p.position})
                </div>
              ))}
            </div>
          </div>
        </div>
        {selectedPlayer && (
          <div style={{ fontSize: 12, color: '#FFD700', marginTop: 8, padding: '4px 8px', background: 'rgba(255,215,0,0.1)', borderRadius: 4 }}>
            ✅ Selected: {[...team1Players, ...team2Players].find(p => p.id === selectedPlayer)?.name} — Tap an empty spot on the pitch to place
          </div>
        )}
      </div>

      {/* ── REFEREE PITCH VIEW ── */}
      <div style={STYLES.panel}>
        <h3 style={STYLES.header}>⚽ Setup Pitch — Place players on empty spots</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <RefereePitchView
            formation={gs.team1Formation || '4-4-2'}
            slots={team1Slots}
            title={gs.team1Name || "Team 1"}
            color="#1565c0"
            onSpotClick={(idx) => handleSpotClick('team1', idx)}
            selectedPlayer={selectedPlayer}
            isReferee={true}
          />
          <RefereePitchView
            formation={gs.team2Formation || '4-4-2'}
            slots={team2Slots}
            title={gs.team2Name || "Team 2"}
            color="#b71c1c"
            onSpotClick={(idx) => handleSpotClick('team2', idx)}
            selectedPlayer={selectedPlayer}
            isReferee={true}
          />
        </div>
      </div>

      {/* ── LIVE DEMONSTRATION VIEW (EXACTLY what reviewer sees) ── */}
      {gs.deepTactics?.phase === 'LIVE_DEMO' && (
        <div style={{ ...STYLES.panel, border: '2px solid #4caf50', background: '#0a1a0a' }}>
          <h3 style={{ ...STYLES.header, color: '#4caf50' }}>
            🔴 LIVE DEMONSTRATION — {gs.deepTactics?.activeDemonstrator?.name || 'Reviewer'}
          </h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <LivePitchView
              formation={liveFormation1}
              slots={livePitchState.team1Slots || []}
              title={`${gs.team1Name || 'Team 1'} (${liveFormation1})`}
              color="#1565c0"
            />
            <LivePitchView
              formation={liveFormation2}
              slots={livePitchState.team2Slots || []}
              title={`${gs.team2Name || 'Team 2'} (${liveFormation2})`}
              color="#b71c1c"
            />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>🔴 Active Demonstrator: {gs.deepTactics?.activeDemonstrator?.name || 'None'}</span>
            <span>Ball Position: ({Math.round(livePitchState.ballPosition?.x || 50)}%, {Math.round(livePitchState.ballPosition?.y || 50)}%)</span>
          </div>
        </div>
      )}

      {/* ── CONTROLS & ROSTER ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={STYLES.panel}>
            <h3 style={STYLES.header}>⚡ Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  if (window.confirm('Start Deep Tactics Review?')) {
                    socket.emit('refInitDeepTactics');
                  }
                }}
                style={STYLES.buttonGold}
              >
                🧠 Start Deep Tactics Review
              </button>
              <button
                onClick={() => socket.emit('refOpenDemonstration')}
                style={{
                  ...STYLES.button,
                  background: gs.deepTactics?.pitchState?.showDemo ? '#28a745' : '#2c2c54',
                  width: '100%',
                }}
              >
                {gs.deepTactics?.pitchState?.showDemo ? '🔓 Demo Open' : '🔒 Open Demonstration'}
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleStartDemonstration('first')}
                  style={{
                    ...STYLES.button,
                    flex: 1,
                    background: gs.deepTactics?.activeDemonstrator?.txId === gs.deepTactics?.firstReviewFan?.txId ? '#28a745' : '#2c2c54',
                  }}
                >
                  ▶️ First Review
                </button>
                <button
                  onClick={() => handleStartDemonstration('second')}
                  style={{
                    ...STYLES.button,
                    flex: 1,
                    background: gs.deepTactics?.activeDemonstrator?.txId === gs.deepTactics?.secondReviewFan?.txId ? '#28a745' : '#2c2c54',
                  }}
                >
                  ▶️ Second Review
                </button>
              </div>
              <button
                onClick={() => socket.emit('refStopDemonstration')}
                style={{ ...STYLES.buttonDanger, width: '100%' }}
              >
                ⏹️ Stop Demonstration
              </button>
              <button
                onClick={() => socket.emit('refNextReview')}
                style={{ ...STYLES.button, width: '100%' }}
              >
                ➡️ Next Review
              </button>
              <button
                onClick={handleClearAllReviewers}
                style={{ ...STYLES.buttonDanger, width: '100%' }}
              >
                🗑️ Clear All Reviewers
              </button>
            </div>
            <div style={{ marginTop: 12, borderTop: '1px solid #333', paddingTop: 12 }}>
              <div style={STYLES.metaText}>Status:</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Active: {gs.deepTactics?.activeDemonstrator?.name || 'None'}</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>First Fan: {gs.deepTactics?.firstReviewFan?.name || 'Not assigned'}</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Second Fan: {gs.deepTactics?.secondReviewFan?.name || 'Not assigned'}</div>
            </div>
          </div>
        </div>

        {/* ── SPECTATOR ROSTER ── */}
        <div style={STYLES.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ ...STYLES.header, marginBottom: 0 }}>👥 Connected Fans ({viewersList.length})</h3>
            <input
              type="text"
              placeholder="Search..."
              value={fanSearch}
              onChange={e => setFanSearch(e.target.value)}
              style={{ ...STYLES.input, width: '180px', padding: '4px 8px', fontSize: '0.8rem' }}
            />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {viewersList
              .filter(v => !fanSearch || v.name?.toLowerCase().includes(fanSearch.toLowerCase()))
              .map((v) => {
                const isFirst = gs.deepTactics?.firstReviewFan?.id === v.id;
                const isSecond = gs.deepTactics?.secondReviewFan?.id === v.id;
                const isActive = gs.deepTactics?.activeDemonstrator?.id === v.id;
                return (
                  <div
                    key={v.id}
                    style={{
                      background: isActive ? 'rgba(76,175,80,0.2)' : isFirst || isSecond ? 'rgba(255,215,0,0.1)' : '#111',
                      padding: '8px 12px',
                      borderRadius: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: isActive ? '1px solid #4caf50' : isFirst || isSecond ? '1px solid #FFD700' : '1px solid #222',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {v.name || 'Anonymous Fan'}
                        {isActive && ' 🟢'}
                        {isFirst && ' 🔵'}
                        {isSecond && ' 🔴'}
                      </span>
                      <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: v.isVIP ? '#ffc107' : '#888' }}>
                        {v.isVIP ? '⭐ VIP' : 'Fan'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {!isFirst && !isSecond ? (
                        <>
                          <button
                            onClick={() => handleAssignReviewFan(v.id, 'first')}
                            style={{
                              padding: '2px 6px',
                              fontSize: '0.6rem',
                              background: '#1565c0',
                              border: 'none',
                              color: '#fff',
                              borderRadius: 2,
                              cursor: 'pointer',
                            }}
                          >
                            Set First
                          </button>
                          <button
                            onClick={() => handleAssignReviewFan(v.id, 'second')}
                            style={{
                              padding: '2px 6px',
                              fontSize: '0.6rem',
                              background: '#b71c1c',
                              border: 'none',
                              color: '#fff',
                              borderRadius: 2,
                              cursor: 'pointer',
                            }}
                          >
                            Set Second
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRemoveReviewFan(v.id)}
                          style={{
                            padding: '2px 6px',
                            fontSize: '0.6rem',
                            background: '#dc3545',
                            border: 'none',
                            color: '#fff',
                            borderRadius: 2,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
