// src/RefereeDashboard.js - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';

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

// ── CORRECT FORMATION SLOTS ──
const SLOTS = {
  '4-4-2': [
    { label: 'ST1', top: 10, left: 35 }, { label: 'ST2', top: 10, left: 65 },
    { label: 'LM', top: 30, left: 15 }, { label: 'CM1', top: 30, left: 35 }, { label: 'CM2', top: 30, left: 65 }, { label: 'RM', top: 30, left: 85 },
    { label: 'LB', top: 55, left: 15 }, { label: 'CB1', top: 55, left: 35 }, { label: 'CB2', top: 55, left: 65 }, { label: 'RB', top: 55, left: 85 },
    { label: 'GK', top: 85, left: 50 },
  ],
  '4-3-3': [
    { label: 'LW', top: 8, left: 15 }, { label: 'ST', top: 8, left: 50 }, { label: 'RW', top: 8, left: 85 },
    { label: 'CM1', top: 30, left: 25 }, { label: 'CM2', top: 30, left: 50 }, { label: 'CM3', top: 30, left: 75 },
    { label: 'LB', top: 55, left: 15 }, { label: 'CB1', top: 55, left: 35 }, { label: 'CB2', top: 55, left: 65 }, { label: 'RB', top: 55, left: 85 },
    { label: 'GK', top: 85, left: 50 },
  ],
  '3-5-2': [
    { label: 'ST1', top: 10, left: 35 }, { label: 'ST2', top: 10, left: 65 },
    { label: 'LWB', top: 25, left: 10 }, { label: 'CM1', top: 30, left: 30 }, { label: 'CM2', top: 30, left: 50 }, { label: 'CM3', top: 30, left: 70 }, { label: 'RWB', top: 25, left: 90 },
    { label: 'CB1', top: 55, left: 25 }, { label: 'CB2', top: 55, left: 50 }, { label: 'CB3', top: 55, left: 75 },
    { label: 'GK', top: 85, left: 50 },
  ],
  '4-5-1': [
    { label: 'ST', top: 10, left: 50 },
    { label: 'LM', top: 25, left: 10 }, { label: 'CM1', top: 30, left: 30 }, { label: 'CM2', top: 30, left: 50 }, { label: 'CM3', top: 30, left: 70 }, { label: 'RM', top: 25, left: 90 },
    { label: 'LB', top: 55, left: 15 }, { label: 'CB1', top: 55, left: 35 }, { label: 'CB2', top: 55, left: 65 }, { label: 'RB', top: 55, left: 85 },
    { label: 'GK', top: 85, left: 50 },
  ],
  '5-3-2': [
    { label: 'ST1', top: 10, left: 35 }, { label: 'ST2', top: 10, left: 65 },
    { label: 'CM1', top: 30, left: 25 }, { label: 'CM2', top: 30, left: 50 }, { label: 'CM3', top: 30, left: 75 },
    { label: 'LWB', top: 55, left: 10 }, { label: 'CB1', top: 55, left: 28 }, { label: 'CB2', top: 55, left: 50 }, { label: 'CB3', top: 55, left: 72 }, { label: 'RWB', top: 55, left: 90 },
    { label: 'GK', top: 85, left: 50 },
  ],
  '4-2-3-1': [
    { label: 'ST', top: 10, left: 50 },
    { label: 'LAM', top: 22, left: 20 }, { label: 'CAM', top: 22, left: 50 }, { label: 'RAM', top: 22, left: 80 },
    { label: 'DM1', top: 35, left: 35 }, { label: 'DM2', top: 35, left: 65 },
    { label: 'LB', top: 55, left: 15 }, { label: 'CB1', top: 55, left: 35 }, { label: 'CB2', top: 55, left: 65 }, { label: 'RB', top: 55, left: 85 },
    { label: 'GK', top: 85, left: 50 },
  ],
};

// ── LIVE PITCH VIEW (For Referee's live demonstration view) ──
function LivePitchView({ formation, slots, title, color }) {
  const defs = SLOTS[formation] || SLOTS['4-4-2'];
  const isFlipped = title.includes('Team 2');
  
  return (
    <div style={{ flex: 1, minWidth: '200px', background: '#111', border: '1px solid #333', padding: 10, borderRadius: 6 }}>
      <div style={{ fontSize: 'clamp(11px, 1vw, 13px)', fontWeight: 'bold', color, marginBottom: 4, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '130%', 
        background: 'linear-gradient(180deg, #1b4d22 0%, #0f3014 100%)', 
        border: '1px solid #444', 
        borderRadius: 4, 
        overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
        
        {defs.map((s, i) => {
          const player = slots && slots[i] ? slots[i] : null;
          const hasPlayer = player && player.name && player.name.trim() !== '';
          const displayName = hasPlayer ? player.name : s.label;
          const topPos = isFlipped ? (100 - s.top) : s.top;
          
          return (
            <div 
              key={i} 
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
                background: hasPlayer ? color : 'rgba(255,255,255,0.06)', 
                border: hasPlayer ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 'clamp(5px, 0.5vw, 7px)', 
                fontWeight: 'bold', 
                color: '#fff', 
                padding: '1px', 
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
                  fontSize: hasPlayer ? 'clamp(6px, 0.6vw, 8px)' : 'clamp(5px, 0.5vw, 6px)',
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

// ── SETUP PITCH VIEW (For Referee to place players) ──
function SetupPitchView({ formation, slots, title, color, onSpotClick, selectedPlayer }) {
  const defs = SLOTS[formation] || SLOTS['4-4-2'];
  
  return (
    <div style={{ flex: 1, minWidth: '200px', background: '#111', border: '1px solid #333', padding: 10, borderRadius: 6 }}>
      <div style={{ fontSize: 'clamp(11px, 1vw, 13px)', fontWeight: 'bold', color, marginBottom: 4, textTransform: 'uppercase' }}>{title} ({formation})</div>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        paddingTop: '130%', 
        background: 'linear-gradient(180deg, #1b4d22 0%, #0f3014 100%)', 
        border: '1px solid #444', 
        borderRadius: 4, 
        overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
        
        {defs.map((s, i) => {
          const player = slots && slots[i] ? slots[i] : null;
          const hasPlayer = player && player.name && player.name.trim() !== '';
          const displayName = hasPlayer ? player.name : s.label;
          const isEmpty = !hasPlayer;
          const canPlace = selectedPlayer !== null && isEmpty;
          
          return (
            <div 
              key={i} 
              onClick={() => { if (canPlace && onSpotClick) onSpotClick(i); }}
              style={{ 
                position: 'absolute', 
                top: `${s.top}%`, 
                left: `${s.left}%`, 
                transform: 'translate(-50%, -50%)', 
                textAlign: 'center',
                cursor: canPlace ? 'pointer' : 'default',
              }}
            >
              <div style={{ 
                width: 'clamp(28px, 3vw, 36px)', 
                height: 'clamp(28px, 3vw, 36px)', 
                borderRadius: '50%', 
                background: hasPlayer ? color : 'rgba(255,255,255,0.06)', 
                border: canPlace ? '2px dashed #FFD700' : hasPlayer ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 'clamp(5px, 0.5vw, 7px)', 
                fontWeight: 'bold', 
                color: '#fff', 
                padding: '1px', 
                boxSizing: 'border-box', 
                overflow: 'hidden', 
                wordBreak: 'break-word',
                transition: 'all 0.2s ease',
                boxShadow: canPlace ? '0 0 15px rgba(255,215,0,0.2)' : 'none',
              }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  fontSize: hasPlayer ? 'clamp(6px, 0.6vw, 8px)' : 'clamp(5px, 0.5vw, 6px)',
                  lineHeight: '1.1',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {displayName}
                </span>
              </div>
              {canPlace && <div style={{ fontSize: 4, color: '#FFD700', marginTop: 1 }}>PLACE</div>}
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

  const viewers = Array.isArray(gs.allViewers) ? gs.allViewers : [];
  const t1Players = gs.team1Picks || [];
  const t2Players = gs.team2Picks || [];
  const t1Slots = gs.deepTactics?.pitchState?.team1Slots || [];
  const t2Slots = gs.deepTactics?.pitchState?.team2Slots || [];

  // ── Update live pitch state when game state changes ──
  useEffect(() => {
    if (gs?.deepTactics?.pitchState) {
      setLivePitchState(gs.deepTactics.pitchState);
    }
  }, [gs]);

  const handleFormation = (team, f) => socket.emit('refSetFormation', { team, formation: f });
  const handleSpot = (half, idx) => {
    if (!selectedPlayer) return;
    const slots = half === 'team1' ? t1Slots : t2Slots;
    if (slots[idx] && slots[idx].name) return;
    socket.emit('refPlacePlayerOnPitch', { half, slotIndex: idx, playerId: selectedPlayer });
    setSelectedPlayer(null);
  };
  const handleAssign = (id, role) => socket.emit('refAssignReviewFanById', { userId: id, role });
  const handleRemove = (id) => socket.emit('refRemoveReviewFan', { userId: id });
  const handleClearAll = () => { if (window.confirm('Remove ALL reviewers?')) socket.emit('refClearAllReviewers'); };
  const handleStartDemo = (role) => socket.emit('refStartDemonstration', { role });

  if (!isReferee) return null;

  const liveFormation1 = gs.team1Formation || '4-4-2';
  const liveFormation2 = gs.team2Formation || '4-4-2';
  const liveSlots1 = livePitchState.team1Slots || [];
  const liveSlots2 = livePitchState.team2Slots || [];
  const ballPos = livePitchState.ballPosition || { x: 50, y: 50 };

  return (
    <div style={STYLES.container}>
      <div style={STYLES.mainHeader}>
        <span>🧠 Deep Tactics Review — Control Tower</span>
        <span style={{ fontSize: '0.85rem', background: '#333', padding: '4px 10px', borderRadius: 12, color: '#00f2fe' }}>Phase: {gs.deepTactics?.phase || 'IDLE'}</span>
      </div>

      {/* ── PLAYER POOL & FORMATION CONTROLS ── */}
      <div style={STYLES.panel}>
        <h3 style={STYLES.header}>👥 Player Pool & Formation</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', background: '#111', padding: 8, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#00f2fe', fontSize: '0.8rem', fontWeight: 'bold' }}>🔵 {gs.team1Name || 'Team 1'} ({t1Players.length})</span>
              <select value={gs.team1Formation || '4-4-2'} onChange={(e) => handleFormation('team1', e.target.value)} style={{ ...STYLES.input, width: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}>
                {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 6, maxHeight: 100, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {t1Players.map(p => (
                <div key={p.id} onClick={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)} style={{ padding: '3px 6px', borderRadius: 3, background: selectedPlayer === p.id ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)', border: selectedPlayer === p.id ? '1px solid #FFD700' : '1px solid #333', fontSize: '9px', cursor: 'pointer', color: '#fff' }}>
                  {p.name} ({p.position})
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '180px', background: '#111', padding: 8, borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ff5252', fontSize: '0.8rem', fontWeight: 'bold' }}>🔴 {gs.team2Name || 'Team 2'} ({t2Players.length})</span>
              <select value={gs.team2Formation || '4-4-2'} onChange={(e) => handleFormation('team2', e.target.value)} style={{ ...STYLES.input, width: 'auto', padding: '2px 6px', fontSize: '0.7rem' }}>
                {FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 6, maxHeight: 100, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {t2Players.map(p => (
                <div key={p.id} onClick={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)} style={{ padding: '3px 6px', borderRadius: 3, background: selectedPlayer === p.id ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)', border: selectedPlayer === p.id ? '1px solid #FFD700' : '1px solid #333', fontSize: '9px', cursor: 'pointer', color: '#fff' }}>
                  {p.name} ({p.position})
                </div>
              ))}
            </div>
          </div>
        </div>
        {selectedPlayer && <div style={{ fontSize: 11, color: '#FFD700', marginTop: 6, padding: '4px 8px', background: 'rgba(255,215,0,0.1)', borderRadius: 4 }}>✅ Selected: {[...t1Players, ...t2Players].find(p => p.id === selectedPlayer)?.name} — Tap empty spot</div>}
      </div>

      {/* ── SETUP PITCH ── */}
      <div style={STYLES.panel}>
        <h3 style={STYLES.header}>⚽ Setup Pitch — Tap a player, then tap an empty spot</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <SetupPitchView formation={gs.team1Formation || '4-4-2'} slots={t1Slots} title={gs.team1Name || 'Team 1'} color="#1565c0" onSpotClick={(i) => handleSpot('team1', i)} selectedPlayer={selectedPlayer} />
          <SetupPitchView formation={gs.team2Formation || '4-4-2'} slots={t2Slots} title={gs.team2Name || 'Team 2'} color="#b71c1c" onSpotClick={(i) => handleSpot('team2', i)} selectedPlayer={selectedPlayer} />
        </div>
      </div>

      {/* ── LIVE DEMONSTRATION VIEW (EXACTLY what reviewer sees) ── */}
      {gs.deepTactics?.phase === 'LIVE_DEMO' && (
        <div style={{ ...STYLES.panel, border: '2px solid #4caf50', background: '#0a1a0a' }}>
          <h3 style={{ ...STYLES.header, color: '#4caf50' }}>
            🔴 LIVE DEMONSTRATION — {gs.deepTactics?.activeDemonstrator?.name || 'Reviewer'}
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <LivePitchView 
              formation={liveFormation1} 
              slots={liveSlots1} 
              title={`${gs.team1Name || 'Team 1'} (${liveFormation1})`} 
              color="#1565c0" 
            />
            <LivePitchView 
              formation={liveFormation2} 
              slots={liveSlots2} 
              title={`${gs.team2Name || 'Team 2'} (${liveFormation2})`} 
              color="#b71c1c" 
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>🔴 Active: {gs.deepTactics?.activeDemonstrator?.name || 'None'}</span>
            <span>⚽ Ball: ({Math.round(ballPos.x || 50)}%, {Math.round(ballPos.y || 50)}%)</span>
          </div>
        </div>
      )}

      {/* ── CONTROLS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={STYLES.panel}>
            <h3 style={STYLES.header}>⚡ Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => { if (window.confirm('Start Deep Tactics Review?')) socket.emit('refInitDeepTactics'); }} style={STYLES.buttonGold}>🧠 Start Deep Tactics Review</button>
              <button onClick={() => socket.emit('refOpenDemonstration')} style={{ ...STYLES.button, background: gs.deepTactics?.pitchState?.showDemo ? '#28a745' : '#2c2c54', width: '100%' }}>
                {gs.deepTactics?.pitchState?.showDemo ? '🔓 Demo Open' : '🔒 Open Demonstration'}
              </button>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleStartDemo('first')} style={{ ...STYLES.button, flex: 1, background: gs.deepTactics?.activeDemonstrator?.txId === gs.deepTactics?.firstReviewFan?.txId ? '#28a745' : '#2c2c54' }}>▶️ First</button>
                <button onClick={() => handleStartDemo('second')} style={{ ...STYLES.button, flex: 1, background: gs.deepTactics?.activeDemonstrator?.txId === gs.deepTactics?.secondReviewFan?.txId ? '#28a745' : '#2c2c54' }}>▶️ Second</button>
              </div>
              <button onClick={() => socket.emit('refStopDemonstration')} style={{ ...STYLES.buttonDanger, width: '100%' }}>⏹️ Stop</button>
              <button onClick={() => socket.emit('refNextReview')} style={{ ...STYLES.button, width: '100%' }}>➡️ Next Review</button>
              <button onClick={handleClearAll} style={{ ...STYLES.buttonDanger, width: '100%' }}>🗑️ Clear All Reviewers</button>
            </div>
            <div style={{ marginTop: 10, borderTop: '1px solid #333', paddingTop: 10 }}>
              <div style={STYLES.metaText}>Status:</div>
              <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Active: {gs.deepTactics?.activeDemonstrator?.name || 'None'}</div>
              <div style={{ fontSize: '0.75rem', color: '#aaa' }}>First: {gs.deepTactics?.firstReviewFan?.name || 'Not assigned'}</div>
              <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Second: {gs.deepTactics?.secondReviewFan?.name || 'Not assigned'}</div>
            </div>
          </div>
        </div>

        {/* ── FANS ROSTER ── */}
        <div style={STYLES.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ ...STYLES.header, marginBottom: 0 }}>👥 Fans ({viewers.length})</h3>
            <input type="text" placeholder="Search..." value={fanSearch} onChange={e => setFanSearch(e.target.value)} style={{ ...STYLES.input, width: '140px', padding: '3px 6px', fontSize: '0.7rem' }} />
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {viewers.filter(v => !fanSearch || v.name?.toLowerCase().includes(fanSearch.toLowerCase())).map(v => {
              const isFirst = gs.deepTactics?.firstReviewFan?.id === v.id;
              const isSecond = gs.deepTactics?.secondReviewFan?.id === v.id;
              const isActive = gs.deepTactics?.activeDemonstrator?.id === v.id;
              return (
                <div key={v.id} style={{ background: isActive ? 'rgba(76,175,80,0.2)' : isFirst || isSecond ? 'rgba(255,215,0,0.1)' : '#111', padding: '5px 8px', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: isActive ? '1px solid #4caf50' : isFirst || isSecond ? '1px solid #FFD700' : '1px solid #222' }}>
                  <div><span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{v.name || 'Anonymous'}{isActive && ' 🟢'}{isFirst && ' 🔵'}{isSecond && ' 🔴'}</span><span style={{ fontSize: '0.6rem', marginLeft: '4px', color: v.isVIP ? '#ffc107' : '#888' }}>{v.isVIP ? '⭐ VIP' : 'Fan'}</span></div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {!isFirst && !isSecond ? (
                      <>
                        <button onClick={() => handleAssign(v.id, 'first')} style={{ padding: '1px 4px', fontSize: '0.55rem', background: '#1565c0', border: 'none', color: '#fff', borderRadius: 2, cursor: 'pointer' }}>1st</button>
                        <button onClick={() => handleAssign(v.id, 'second')} style={{ padding: '1px 4px', fontSize: '0.55rem', background: '#b71c1c', border: 'none', color: '#fff', borderRadius: 2, cursor: 'pointer' }}>2nd</button>
                      </>
                    ) : (
                      <button onClick={() => handleRemove(v.id)} style={{ padding: '1px 4px', fontSize: '0.55rem', background: '#dc3545', border: 'none', color: '#fff', borderRadius: 2, cursor: 'pointer' }}>✕</button>
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
