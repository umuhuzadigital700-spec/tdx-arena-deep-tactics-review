// src/RefereeDashboard.js - Focused on Deep Tactics Review
import React, { useState, useEffect, useCallback } from 'react';

const STYLES = {
  container: { padding: '20px', background: '#000', minHeight: '100vh', fontFamily: 'sans-serif', color: '#eee', boxSizing: 'border-box' },
  mainHeader: { color: '#fff', marginTop: 0, marginBottom: 20, fontSize: '1.5rem', borderBottom: '2px solid #222', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  panel: { background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, padding: 16, marginBottom: 16, color: '#eee' },
  header: { margin: 0, marginBottom: 12, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: 1, color: '#ffc107', display: 'flex', alignItems: 'center', gap: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 },
  card: { background: '#111', border: '1px solid #444', borderRadius: 6, padding: 12, textAlign: 'center', fontSize: '0.85rem', position: 'relative' },
  badge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%' },
  button: { padding: '10px 16px', background: '#2c2c54', color: '#fff', border: '1px solid #444', borderRadius: 4, fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  input: { padding: '8px 12px', borderRadius: 4, border: '1px solid #555', background: '#222', color: '#fff', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' },
  metaText: { fontSize: '0.85rem', color: '#aaa', margin: '4px 0' }
};

// ── Formation Slot Templates ──
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

function RefPitchView({ formation, tactics, title, color }) {
  const slots = FORMATION_SLOTS[formation] || FORMATION_SLOTS['4-4-2'];
  return (
    <div style={{ flex: 1, minWidth: '240px', background: '#111', border: '1px solid #333', padding: 12, borderRadius: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 'bold', color, marginBottom: 8, textTransform: 'uppercase' }}>{title} ({formation})</div>
      <div style={{ position: 'relative', width: '100%', paddingTop: '130%', background: 'linear-gradient(180deg, #1b4d22 0%, #0f3014 100%)', border: '1px solid #444', borderRadius: 6, overflow: 'hidden' }}>
        {slots.map((s, idx) => {
          const card = tactics[idx];
          return (
            <div key={idx} style={{ position: 'absolute', top: `${s.top}%`, left: `${s.left}%`, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: card ? color : 'rgba(255,255,255,0.08)', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 'bold', color: '#fff', padding: 2, boxSizing: 'border-box', overflow: 'hidden', wordBreak: 'break-all' }}>
                {card ? card.name : s.label}
              </div>
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

  const viewersList = Array.isArray(gs.allViewers) ? gs.allViewers : [];

  if (!isReferee) return null;

  return (
    <div style={STYLES.container}>
      <div style={STYLES.mainHeader}>
        <span>🧠 Deep Tactics Review — Control Tower</span>
        <span style={{ fontSize: '0.85rem', background: '#333', padding: '4px 10px', borderRadius: 12, color: '#00f2fe' }}>
          Phase: {gs.deepTactics?.phase || 'IDLE'}
        </span>
      </div>

      {/* ── PITCH OVERVIEW ── */}
      <div style={STYLES.panel}>
        <h3 style={STYLES.header}>👁️ Live Tactical Pitch Overview</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', background: '#111', padding: 10, borderRadius: 6 }}>
            <span style={{ color: '#00f2fe', fontSize: '0.85rem', fontWeight: 'bold' }}>Team 1 Roster ({gs.team1Picks?.length || 0}):</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {(gs.team1Picks || []).map(p => <span key={p.id} style={{ fontSize: 11, background: '#222', padding: '3px 6px', borderRadius: 4 }}>{p.name}</span>)}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', background: '#111', padding: 10, borderRadius: 6 }}>
            <span style={{ color: '#ff5252', fontSize: '0.85rem', fontWeight: 'bold' }}>Team 2 Roster ({gs.team2Picks?.length || 0}):</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {(gs.team2Picks || []).map(p => <span key={p.id} style={{ fontSize: 11, background: '#222', padding: '3px 6px', borderRadius: 4 }}>{p.name}</span>)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
          <RefPitchView formation={gs.team1Formation || '4-4-2'} tactics={gs.team1Tactics || {}} title={gs.team1Name || "Team 1"} color="#1565c0" />
          <RefPitchView formation={gs.team2Formation || '4-4-2'} tactics={gs.team2Tactics || {}} title={gs.team2Name || "Team 2"} color="#b71c1c" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* ── LEFT COLUMN: Controls ── */}
        <div>
          <div style={STYLES.panel}>
            <h3 style={STYLES.header}>⚡ Deep Tactics Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => {
                  if (window.confirm('Start Deep Tactics Review?')) {
                    socket.emit('refInitDeepTactics');
                    if (window._toggleDeepTactics) {
                      window._toggleDeepTactics(true);
                    }
                  }
                }}
                style={{
                  ...STYLES.button,
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: '#000',
                  fontWeight: 800,
                  width: '100%',
                }}
              >
                🧠 Start Deep Tactics Review
              </button>

              <button
                onClick={() => socket.emit('refOpenDemonstration')}
                style={{
                  ...STYLES.button,
                  background: gs.deepTactics?.pitchState?.showDemo ? '#4caf50' : '#222',
                  width: '100%',
                }}
              >
                {gs.deepTactics?.pitchState?.showDemo ? '🔓 Demo Open' : '🔒 Open Demonstration'}
              </button>

              <button
                onClick={() => {
                  const firstFan = prompt('Enter First Review Fan TX ID:');
                  const secondFan = prompt('Enter Second Review Fan TX ID:');
                  if (firstFan || secondFan) {
                    socket.emit('refAssignReviewFans', { firstFanTxId: firstFan, secondFanTxId: secondFan });
                  }
                }}
                style={{ ...STYLES.button, width: '100%' }}
              >
                👥 Assign Review Fans
              </button>

              <button
                onClick={() => {
                  const fanTxId = prompt('Enter TX ID of fan to start demonstration:');
                  if (fanTxId) {
                    socket.emit('refStartDemonstration', { fanTxId });
                  }
                }}
                style={{ ...STYLES.button, width: '100%' }}
              >
                ▶️ Start Demonstration
              </button>

              <button
                onClick={() => socket.emit('refNextReview')}
                style={{ ...STYLES.button, width: '100%' }}
              >
                ➡️ Next Review
              </button>
            </div>

            <div style={{ marginTop: 12, borderTop: '1px solid #333', paddingTop: 12 }}>
              <div style={STYLES.metaText}>Status:</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                Active: {gs.deepTactics?.activeDemonstrator?.name || 'None'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                First Fan: {gs.deepTactics?.firstReviewFan?.name || 'Not assigned'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                Second Fan: {gs.deepTactics?.secondReviewFan?.name || 'Not assigned'}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Spectator Roster ── */}
        <div style={STYLES.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ ...STYLES.header, marginBottom: 0 }}>👥 Spectator Roster ({viewersList.length})</h3>
            <input type="text" placeholder="Search handles..." value={fanSearch} onChange={e => setFanSearch(e.target.value)} style={{ ...STYLES.input, width: '180px', padding: '4px 8px', fontSize: '0.8rem' }} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {viewersList
              .filter(v => !fanSearch || (v && v.name && v.name.toLowerCase().includes(fanSearch.toLowerCase())))
              .map((v, idx) => (
                <div key={v.id || idx} style={{ background: '#111', padding: '8px 12px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{v.name || 'Anonymous Fan'}</span>
                    <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: v.isVIP ? '#ffc107' : '#888' }}>
                      {v.isVIP ? '⭐ VIP' : 'Fan'} ({v.role || 'spectator'})
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => {
                        // Quick assign as first review fan
                        if (v.txId) {
                          const firstFan = v.txId;
                          const secondFan = prompt('Enter Second Review Fan TX ID (or leave blank):');
                          socket.emit('refAssignReviewFans', { firstFanTxId: firstFan, secondFanTxId: secondFan || '' });
                        }
                      }}
                      style={{ padding: '2px 6px', fontSize: '0.6rem', background: '#FFD700', border: 'none', color: '#000', borderRadius: 2, cursor: 'pointer' }}
                    >
                      Set as Reviewer
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* ── FULL DEEP TACTICS REVIEW OVERLAY ── */}
      {window._toggleDeepTactics && (
        <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,215,0,0.05)', borderRadius: 8, border: '1px solid rgba(255,215,0,0.2)' }}>
          <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center' }}>
            🔄 Deep Tactics Review overlay is available. It will open automatically when fans are assigned.
          </p>
        </div>
      )}
    </div>
  );
}
