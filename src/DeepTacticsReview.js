// src/DeepTacticsReview.js - Full Interactive Pitch for Reviewers (FINAL)
import React, { useState, useEffect, useCallback, useRef } from 'react';

const DEEP_TACTICS_STYLES = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.92)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #333',
    marginBottom: '12px',
  },
  pitchContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minHeight: 0,
  },
  pitchWrapper: {
    flex: 1,
    position: 'relative',
    background: 'linear-gradient(180deg, #1a6b1a 0%, #0d4a0d 100%)',
    borderRadius: '12px',
    border: '2px solid #4caf50',
    overflow: 'hidden',
    minHeight: '500px',
    cursor: 'default',
  },
  halfLabel: {
    position: 'absolute',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  slotCircle: {
    position: 'absolute',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '7px',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    overflow: 'hidden',
    wordBreak: 'break-all',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.2s ease',
    cursor: 'grab',
    border: '2px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.05)',
  },
  controlToolbar: {
    display: 'flex',
    gap: '8px',
    padding: '8px 4px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  toolButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #555',
    background: '#222',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.15s ease',
  },
};

const FORMATION_SLOTS_DTR = {
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

function PitchMarkings() {
  return (
    <>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderTop: 'none', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderBottom: 'none', pointerEvents: 'none' }} />
    </>
  );
}

export default function DeepTacticsReview({ gameState, socket, user, onClose, isReferee, isReviewFan, reviewRole }) {
  const [gs, setGs] = useState(gameState || {});
  const [pitchState, setPitchState] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [animationStep, setAnimationStep] = useState(null);
  const pitchRef = useRef(null);
  
  useEffect(() => {
    if (!socket) return;
    const handleStateUpdate = (data) => {
      if (data && data.deepTactics) {
        setPitchState(data.deepTactics.pitchState || {});
        setGs(prev => ({ ...prev, deepTactics: data.deepTactics }));
      }
    };
    const handleAnimationStep = (stepData) => {
      setAnimationStep(stepData);
      setTimeout(() => setAnimationStep(null), 500);
    };
    socket.on('deepTacticsState', handleStateUpdate);
    socket.on('animationStep', handleAnimationStep);
    return () => {
      socket.off('deepTacticsState', handleStateUpdate);
      socket.off('animationStep', handleAnimationStep);
    };
  }, [socket]);
  
  const formation1 = gs.team1Formation || '4-4-2';
  const formation2 = gs.team2Formation || '4-4-2';
  const slots1 = FORMATION_SLOTS_DTR[formation1] || FORMATION_SLOTS_DTR['4-4-2'];
  const slots2 = FORMATION_SLOTS_DTR[formation2] || FORMATION_SLOTS_DTR['4-4-2'];
  
  const team1Slots = pitchState.team1Slots || [];
  const team2Slots = pitchState.team2Slots || [];
  const ballPos = pitchState.ballPosition || { x: 50, y: 50 };
  const selectedSpots = pitchState.selectedSpots || [];
  const isAnimating = pitchState.isAnimating || false;
  
  const isActiveDemonstrator = isReviewFan && 
    reviewRole === 'first' && 
    gs.deepTactics?.activeDemonstrator?.txId === user?.txId;
  
  const canInteract = isReferee || isActiveDemonstrator;
  
  const handleToolClick = (tool) => {
    if (!canInteract) return;
    if (selectedTool === tool) { setSelectedTool(null); return; }
    setSelectedTool(tool);
    if (tool === 'CLEAR_ANIMATION') {
      socket.emit('demoBallAction', { action: 'CLEAR_ANIMATION' });
      setSelectedTool(null);
    }
  };
  
  const handleBallPlacement = (half, index) => {
    if (!canInteract) return;
    if (selectedTool !== 'SET_BALL') return;
    socket.emit('demoBallAction', { action: 'SET_BALL', spotIndex: index, half });
    setSelectedTool(null);
  };
  
  const handleDragStart = (e, half, index) => {
    if (!isActiveDemonstrator) return;
    setIsDragging(true);
  };
  
  const handleDragEnd = (e, half, index) => {
    if (!isActiveDemonstrator || !isDragging) return;
    setIsDragging(false);
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    socket.emit('demoMovePlayer', { half, slotIndex: index, newX: x, newY: y });
  };
  
  const renderHalf = (half, slotDefs, teamSlots, teamName, teamColor) => {
    const isTopHalf = half === 'team1';
    return (
      <div style={{ position: 'absolute', top: isTopHalf ? 0 : '50%', left: 0, right: 0, height: '50%', borderBottom: isTopHalf ? '2px dashed rgba(255,255,255,0.15)' : 'none', borderTop: !isTopHalf ? '2px dashed rgba(255,255,255,0.15)' : 'none' }}>
        <div style={{ ...DEEP_TACTICS_STYLES.halfLabel, top: isTopHalf ? '8px' : 'auto', bottom: !isTopHalf ? '8px' : 'auto', left: '50%', transform: 'translateX(-50%)' }}>
          {teamName || (half === 'team1' ? 'Team 1' : 'Team 2')} ({half === 'team1' ? formation1 : formation2})
        </div>
        {slotDefs.map((slot, idx) => {
          const player = teamSlots[idx];
          const isSelected = selectedSpots.includes(`${half}-${idx}`);
          const isAnimatingHighlight = animationStep?.highlightSlot === idx && animationStep?.half === half;
          const isEmpty = !player;
          
          return (
            <div
              key={`${half}-${idx}`}
              style={{
                ...DEEP_TACTICS_STYLES.slotCircle,
                top: isTopHalf ? `${slot.top}%` : `${100 - slot.top}%`,
                left: `${slot.left}%`,
                background: player ? teamColor : 'rgba(255,255,255,0.05)',
                border: isSelected ? '3px dashed #FFD700' : 
                        isAnimatingHighlight ? '3px solid #4caf50' :
                        player ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                boxShadow: isSelected ? '0 0 20px rgba(255,215,0,0.3)' : 'none',
                cursor: isActiveDemonstrator ? 'grab' : 'default',
              }}
              onClick={() => {
                if (selectedTool === 'SET_BALL' && canInteract) {
                  handleBallPlacement(half, idx);
                } else if (selectedTool === 'SELECT_SPOT' && canInteract) {
                  const action = isSelected ? 'deselect' : 'select';
                  socket.emit('demoSelectSpot', { half, slotIndex: idx, action });
                }
              }}
              onMouseDown={(e) => handleDragStart(e, half, idx)}
              onMouseUp={(e) => handleDragEnd(e, half, idx)}
              onMouseLeave={(e) => { if (isDragging) handleDragEnd(e, half, idx); }}
            >
              {player ? player.name : slot.label}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div style={DEEP_TACTICS_STYLES.overlay}>
      <div style={DEEP_TACTICS_STYLES.header}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '20px', color: '#FFD700' }}>⚽ Deep Tactics Review</span>
          <span style={{ marginLeft: '12px', fontSize: '12px', color: '#888' }}>
            {isReferee ? '🔴 Referee View' : isReviewFan ? '👤 Review Fan' : '👀 Spectator View'}
          </span>
        </div>
        <button onClick={onClose} style={{ padding: '6px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>✕ Close</button>
      </div>
      
      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', color: '#aaa', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span>Phase: {gs.deepTactics?.phase || 'IDLE'}</span>
        {isReviewFan && <span>Active: {gs.deepTactics?.activeDemonstrator?.name || 'Waiting...'}</span>}
        {isActiveDemonstrator && <span style={{ color: '#4caf50' }}>🟢 YOU ARE DEMONSTRATING</span>}
      </div>
      
      {canInteract && !isReferee && (
        <div style={DEEP_TACTICS_STYLES.controlToolbar}>
          <button onClick={() => handleToolClick('SET_BALL')} style={{ ...DEEP_TACTICS_STYLES.toolButton, background: selectedTool === 'SET_BALL' ? '#FFD700' : '#222', color: selectedTool === 'SET_BALL' ? '#000' : '#fff' }}>💥 Ball</button>
          <button onClick={() => handleToolClick('ADD_STEP_RIGHT')} style={DEEP_TACTICS_STYLES.toolButton}>➡️ Forward-R</button>
          <button onClick={() => handleToolClick('ADD_STEP_LEFT')} style={DEEP_TACTICS_STYLES.toolButton}>⬅️ Forward-L</button>
          <button onClick={() => handleToolClick('PLAY_ANIMATION')} style={{ ...DEEP_TACTICS_STYLES.toolButton, background: isAnimating ? '#4caf50' : '#222' }}>🔶 {isAnimating ? 'Playing...' : 'Play'}</button>
          <button onClick={() => handleToolClick('SELECT_SPOT')} style={{ ...DEEP_TACTICS_STYLES.toolButton, background: selectedTool === 'SELECT_SPOT' ? '#FFD700' : '#222', color: selectedTool === 'SELECT_SPOT' ? '#000' : '#fff' }}>⭕ Select</button>
          <button onClick={() => handleToolClick('CLEAR_ANIMATION')} style={DEEP_TACTICS_STYLES.toolButton}>🟧 Clear</button>
        </div>
      )}
      
      <div style={DEEP_TACTICS_STYLES.pitchContainer}>
        <div ref={pitchRef} style={DEEP_TACTICS_STYLES.pitchWrapper}>
          <PitchMarkings />
          {renderHalf('team1', slots1, team1Slots, gs.team1Name || 'Team 1', '#1565c0')}
          {renderHalf('team2', slots2, team2Slots, gs.team2Name || 'Team 2', '#b71c1c')}
          <div style={{ position: 'absolute', top: `${ballPos.y}%`, left: `${ballPos.x}%`, transform: 'translate(-50%, -50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #fff, #ddd)', boxShadow: '0 0 20px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)', zIndex: 10, pointerEvents: 'none', border: '2px solid #555' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#222' }} />
          </div>
        </div>
      </div>
      
      {isReviewFan && !isActiveDemonstrator && gs.deepTactics?.phase === 'LIVE_DEMO' && (
        <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,215,0,0.1)', borderRadius: '8px', border: '1px solid #FFD700', marginTop: '8px' }}>
          <span style={{ fontSize: '14px', color: '#FFD700' }}>⏳ {gs.deepTactics?.activeDemonstrator?.name || 'Another user'} is currently demonstrating. Please wait for your turn.</span>
        </div>
      )}
      
      {isActiveDemonstrator && (
        <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(76,175,80,0.2)', borderRadius: '8px', border: '1px solid #4caf50', marginTop: '8px' }}>
          <span style={{ fontSize: '14px', color: '#4caf50' }}>🟢 You are demonstrating! Drag spots and use the toolbar.</span>
        </div>
      )}
    </div>
  );
}
