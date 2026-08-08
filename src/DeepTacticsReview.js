// src/DeepTacticsReview.js - COMPLETE FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.92)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #333',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  toolbar: {
    display: 'flex',
    gap: '6px',
    padding: '6px 0',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pitchWrapper: {
    flex: 1,
    position: 'relative',
    background: 'linear-gradient(180deg, #1a7a1a 0%, #0d4a0d 100%)',
    borderRadius: '10px',
    border: '2px solid #4caf50',
    overflow: 'hidden',
    aspectRatio: '16/9',
    minHeight: '300px',
    maxHeight: '70vh',
    touchAction: 'none',
  },
  halfLabel: {
    position: 'absolute',
    fontSize: 'clamp(12px, 1.2vw, 16px)',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    zIndex: 1,
  },
  spot: {
    position: 'absolute',
    width: 'clamp(36px, 4vw, 46px)',
    height: 'clamp(36px, 4vw, 46px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(7px, 0.8vw, 9px)',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    overflow: 'hidden',
    wordBreak: 'break-word',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.2s ease',
    border: '2px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.06)',
    padding: '2px',
    lineHeight: '1.1',
    zIndex: 2,
  },
  ball: {
    position: 'absolute',
    width: 'clamp(16px, 1.8vw, 22px)',
    height: 'clamp(16px, 1.8vw, 22px)',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, #ffffff, #cccccc)',
    boxShadow: '0 0 30px rgba(255,255,255,0.5), 0 4px 15px rgba(0,0,0,0.5)',
    zIndex: 5,
    pointerEvents: 'none',
    border: '2px solid rgba(255,255,255,0.9)',
  },
  btn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #555',
    background: '#222',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 'clamp(12px, 1.2vw, 15px)',
    fontWeight: '600',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
  },
  btnActive: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '2px solid #FFD700',
    background: '#FFD700',
    color: '#000',
    cursor: 'pointer',
    fontSize: 'clamp(12px, 1.2vw, 15px)',
    fontWeight: '700',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
  },
  btnPlaying: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '2px solid #4caf50',
    background: '#4caf50',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 'clamp(12px, 1.2vw, 15px)',
    fontWeight: '700',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
  },
};

// ── CORRECT FORMATION SLOTS ──
// STRIKERS at TOP of half (center line), GK at BOTTOM of half (goal line)
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

function PitchMarkings() {
  return (
    <>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'clamp(50px, 8vw, 80px)', height: 'clamp(50px, 8vw, 80px)', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderTop: 'none', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderBottom: 'none', pointerEvents: 'none', zIndex: 1 }} />
    </>
  );
}

export default function DeepTacticsReview({ gameState, socket, user, onClose, isReferee, isReviewFan, reviewRole }) {
  const [gs, setGs] = useState(gameState || {});
  const [pitch, setPitch] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasControl, setHasControl] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [animStep, setAnimStep] = useState(null);
  const pitchRef = useRef(null);
  const dragRef = useRef(null);

  // ── UPDATE FROM GAME STATE ──
  useEffect(() => {
    if (gameState?.deepTactics) {
      setPitch(gameState.deepTactics.pitchState || {});
      setGs(gameState);
    }
  }, [gameState]);

  // ── SOCKET LISTENERS ──
  useEffect(() => {
    if (!socket) return;

    const onState = (data) => {
      if (data?.deepTactics) {
        setPitch(data.deepTactics.pitchState || {});
        setGs(prev => ({ ...prev, deepTactics: data.deepTactics }));
      }
    };

    const onControl = ({ hasControl: c }) => {
      setHasControl(c);
      if (c && isReviewFan) {
        setIsActive(true);
        setShowToolbar(true);
      } else {
        setIsActive(false);
        setShowToolbar(false);
      }
    };

    const onAnimStep = (data) => {
      setAnimStep(data);
      setTimeout(() => setAnimStep(null), 500);
    };

    socket.on('deepTacticsState', onState);
    socket.on('demonstrationControl', onControl);
    socket.on('animationStep', onAnimStep);

    return () => {
      socket.off('deepTacticsState', onState);
      socket.off('demonstrationControl', onControl);
      socket.off('animationStep', onAnimStep);
    };
  }, [socket, isReviewFan]);

  // ── CHECK ACTIVE STATUS ──
  useEffect(() => {
    const active = isReviewFan && gs.deepTactics?.activeDemonstrator?.txId === user?.txId && hasControl;
    setIsActive(active);
    setShowToolbar(active);
  }, [gs.deepTactics?.activeDemonstrator, user, hasControl, isReviewFan]);

  // ── GET FORMATIONS ──
  const f1 = gs.team1Formation || '4-4-2';
  const f2 = gs.team2Formation || '4-4-2';
  const slots1 = SLOTS[f1] || SLOTS['4-4-2'];
  const slots2 = SLOTS[f2] || SLOTS['4-4-2'];

  // ── GET PITCH DATA ──
  const team1Slots = pitch.team1Slots || [];
  const team2Slots = pitch.team2Slots || [];
  const ballPos = pitch.ballPosition || { x: 50, y: 50 };
  const selectedSpots = pitch.selectedSpots || [];
  const isAnimating = pitch.isAnimating || false;
  const canInteract = isActive;

  // ── TOOL HANDLERS ──
  const handleTool = (tool) => {
    if (!canInteract) return;
    if (selectedTool === tool) { setSelectedTool(null); return; }
    setSelectedTool(tool);
    if (tool === 'CLEAR') {
      socket.emit('demoBallAction', { action: 'CLEAR_ANIMATION' });
      setSelectedTool(null);
    }
  };

  const handleBallPlace = (half, idx) => {
    if (!canInteract || selectedTool !== 'BALL') return;
    socket.emit('demoBallAction', { action: 'SET_BALL', spotIndex: idx, half });
    setSelectedTool(null);
  };

  const handlePlay = () => {
    if (!canInteract) return;
    socket.emit('demoBallAction', { action: 'PLAY_ANIMATION' });
  };

  const handleSelect = (half, idx) => {
    if (!canInteract || selectedTool !== 'SELECT') return;
    const key = `${half}-${idx}`;
    const isSel = selectedSpots.includes(key);
    socket.emit('demoSelectSpot', { half, slotIndex: idx, action: isSel ? 'deselect' : 'select' });
  };

  // ── DRAG ──
  const dragStart = (e, half, idx) => {
    if (!canInteract) return;
    e.preventDefault();
    const cX = e.touches ? e.touches[0].clientX : e.clientX;
    const cY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = { half, idx, cX, cY, dragging: true };
    setIsDragging(true);
  };

  const dragMove = (e) => {
    if (!canInteract || !isDragging || !dragRef.current) return;
    e.preventDefault();
    const cX = e.touches ? e.touches[0].clientX : e.clientX;
    const cY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current.cX = cX;
    dragRef.current.cY = cY;
  };

  const dragEnd = (e) => {
    if (!canInteract || !isDragging || !dragRef.current) return;
    e.preventDefault();
    const rect = pitchRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((dragRef.current.cX - rect.left) / rect.width) * 100;
      const y = ((dragRef.current.cY - rect.top) / rect.height) * 100;
      socket.emit('demoMovePlayer', { half: dragRef.current.half, slotIndex: dragRef.current.idx, newX: x, newY: y });
    }
    setIsDragging(false);
    dragRef.current = null;
  };

  // ── RENDER HALF ──
  const renderHalf = (half, slotDefs, teamSlots, teamName, color, isTop) => {
    // For Team 2 (bottom half), flip the positions
    const isFlipped = !isTop;
    
    return (
      <div style={{
        position: 'absolute',
        top: isTop ? 0 : '50%',
        left: 0, right: 0,
        height: '50%',
        borderBottom: isTop ? '2px dashed rgba(255,255,255,0.12)' : 'none',
        borderTop: !isTop ? '2px dashed rgba(255,255,255,0.12)' : 'none',
        zIndex: 1,
      }}>
        <div style={{ ...styles.halfLabel, top: isTop ? '6px' : 'auto', bottom: !isTop ? '6px' : 'auto', left: '50%', transform: 'translateX(-50%)', color }}>
          {teamName || (half === 'team1' ? 'Team 1' : 'Team 2')} ({half === 'team1' ? f1 : f2})
        </div>
        {slotDefs.map((slot, idx) => {
          const player = teamSlots && teamSlots[idx] ? teamSlots[idx] : null;
          const hasPlayer = player && player.name && player.name.trim() !== '';
          const display = hasPlayer ? player.name : slot.label;
          const isSel = selectedSpots.includes(`${half}-${idx}`);
          const isHighlight = animStep?.highlightSlot === idx && animStep?.half === half;
          // ── For Team 2, flip vertically ──
          const topPos = isFlipped ? (100 - slot.top) : slot.top;

          return (
            <div
              key={`${half}-${idx}`}
              style={{
                ...styles.spot,
                top: `${topPos}%`,
                left: `${slot.left}%`,
                background: hasPlayer ? color : 'rgba(255,255,255,0.05)',
                border: isSel ? '3px dashed #FFD700' :
                        isHighlight ? '3px solid #4caf50' :
                        hasPlayer ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                boxShadow: isSel ? '0 0 20px rgba(255,215,0,0.3)' : 'none',
                cursor: canInteract ? 'grab' : 'default',
              }}
              onClick={() => {
                if (selectedTool === 'BALL' && canInteract) handleBallPlace(half, idx);
                else if (selectedTool === 'SELECT' && canInteract) handleSelect(half, idx);
              }}
              onMouseDown={(e) => dragStart(e, half, idx)}
              onMouseUp={dragEnd}
              onMouseLeave={(e) => { if (isDragging) dragEnd(e); }}
              onTouchStart={(e) => dragStart(e, half, idx)}
              onTouchMove={dragMove}
              onTouchEnd={dragEnd}
            >
              <span style={{ fontSize: hasPlayer ? 'clamp(7px, 0.8vw, 9px)' : 'clamp(5px, 0.6vw, 7px)', fontWeight: hasPlayer ? 'bold' : 'normal', lineHeight: 1.1, textAlign: 'center', wordBreak: 'break-word' }}>
                {display}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.overlay}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#FFD700' }}>⚽ Deep Tactics Review</span>
          <span style={{ marginLeft: '10px', fontSize: 'clamp(10px, 1vw, 12px)', color: '#888' }}>
            {isReferee ? '🔴 Referee' : isReviewFan ? '👤 Reviewer' : '👀 Spectator'}
          </span>
        </div>
        <button onClick={onClose} style={{ padding: '4px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: 'clamp(12px, 1.2vw, 14px)' }}>✕ Close</button>
      </div>

      {/* STATUS */}
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '6px', marginBottom: '10px', fontSize: 'clamp(11px, 1vw, 13px)', color: '#aaa', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', zIndex: 1 }}>
        <span>Phase: {gs.deepTactics?.phase || 'IDLE'}</span>
        {isReviewFan && <span style={{ color: isActive ? '#4caf50' : '#FFD700' }}>{isActive ? '🟢 YOU ARE DEMONSTRATING' : '👀 Watching'}</span>}
      </div>

      {/* TOOLBAR */}
      {showToolbar && (
        <div style={styles.toolbar}>
          <button onClick={() => handleTool('BALL')} style={selectedTool === 'BALL' ? styles.btnActive : styles.btn}>💥 Ball</button>
          <button onClick={() => handleTool('STEP_R')} style={selectedTool === 'STEP_R' ? styles.btnActive : styles.btn}>➡️ Forward-R</button>
          <button onClick={() => handleTool('STEP_L')} style={selectedTool === 'STEP_L' ? styles.btnActive : styles.btn}>⬅️ Forward-L</button>
          <button onClick={handlePlay} style={isAnimating ? styles.btnPlaying : styles.btn}>🔶 {isAnimating ? 'Playing...' : 'Play'}</button>
          <button onClick={() => handleTool('SELECT')} style={selectedTool === 'SELECT' ? styles.btnActive : styles.btn}>⭕ Select</button>
          <button onClick={() => handleTool('CLEAR')} style={styles.btn}>🟧 Clear</button>
        </div>
      )}

      {/* PITCH */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0 }}>
        <div ref={pitchRef} style={styles.pitchWrapper} onTouchMove={dragMove} onTouchEnd={dragEnd}>
          <PitchMarkings />
          {renderHalf('team1', slots1, team1Slots, gs.team1Name || 'Team 1', '#1976d2', true)}
          {renderHalf('team2', slots2, team2Slots, gs.team2Name || 'Team 2', '#d32f2f', false)}
          <div style={{ ...styles.ball, top: `${ballPos.y}%`, left: `${ballPos.x}%` }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(0,0,0,0.25)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
