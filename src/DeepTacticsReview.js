// src/DeepTacticsReview.js - Full Interactive Demonstration Pitch (FIXED)
import React, { useState, useEffect, useRef } from 'react';

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
    aspectRatio: '16/9',
    minHeight: '400px',
    maxHeight: '70vh',
    cursor: 'default',
  },
  halfLabel: {
    position: 'absolute',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    zIndex: 1,
  },
  slotCircle: {
    position: 'absolute',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '7px',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    overflow: 'hidden',
    wordBreak: 'break-word',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.2s ease',
    cursor: 'grab',
    border: '2px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px',
    lineHeight: '1.1',
    zIndex: 2,
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
  toolButtonActive: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '2px solid #FFD700',
    background: '#FFD700',
    color: '#000',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.15s ease',
  },
  toolButtonPlaying: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '2px solid #4caf50',
    background: '#4caf50',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
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
      {/* Center circle */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 1 }} />
      {/* Center line */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 1 }} />
      {/* Center dot */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 1 }} />
      {/* Team 1 penalty area (top) */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderTop: 'none', pointerEvents: 'none', zIndex: 1 }} />
      {/* Team 2 penalty area (bottom) */}
      <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderBottom: 'none', pointerEvents: 'none', zIndex: 1 }} />
      {/* Team 1 goal box */}
      <div style={{ position: 'absolute', top: 0, left: '35%', right: '35%', height: '8%', border: '2px solid rgba(255,255,255,0.1)', borderTop: 'none', pointerEvents: 'none', zIndex: 1 }} />
      {/* Team 2 goal box */}
      <div style={{ position: 'absolute', bottom: 0, left: '35%', right: '35%', height: '8%', border: '2px solid rgba(255,255,255,0.1)', borderBottom: 'none', pointerEvents: 'none', zIndex: 1 }} />
    </>
  );
}

export default function DeepTacticsReview({ gameState, socket, user, onClose, isReferee, isReviewFan, reviewRole }) {
  const [gs, setGs] = useState(gameState || {});
  const [pitchState, setPitchState] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [animationStep, setAnimationStep] = useState(null);
  const [hasControl, setHasControl] = useState(false);
  const [isActiveDemonstrator, setIsActiveDemonstrator] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const pitchRef = useRef(null);

  // ── SOCKET LISTENERS ──
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

    const handleDemonstrationControl = ({ hasControl: control }) => {
      setHasControl(control);
      if (control && isReviewFan) {
        setIsActiveDemonstrator(true);
        setShowToolbar(true);
      } else {
        setIsActiveDemonstrator(false);
        setShowToolbar(false);
      }
    };

    socket.on('deepTacticsState', handleStateUpdate);
    socket.on('animationStep', handleAnimationStep);
    socket.on('demonstrationControl', handleDemonstrationControl);

    return () => {
      socket.off('deepTacticsState', handleStateUpdate);
      socket.off('animationStep', handleAnimationStep);
      socket.off('demonstrationControl', handleDemonstrationControl);
    };
  }, [socket, isReviewFan]);

  // ── CHECK IF THIS USER IS THE ACTIVE DEMONSTRATOR ──
  useEffect(() => {
    const isActive = isReviewFan && 
      gs.deepTactics?.activeDemonstrator?.txId === user?.txId &&
      hasControl;
    setIsActiveDemonstrator(isActive);
    setShowToolbar(isActive);
  }, [gs.deepTactics?.activeDemonstrator, user, hasControl, isReviewFan]);

  // ── GET FORMATION SLOTS ──
  const formation1 = gs.team1Formation || '4-4-2';
  const formation2 = gs.team2Formation || '4-4-2';
  const slots1 = FORMATION_SLOTS_DTR[formation1] || FORMATION_SLOTS_DTR['4-4-2'];
  const slots2 = FORMATION_SLOTS_DTR[formation2] || FORMATION_SLOTS_DTR['4-4-2'];

  const team1Slots = pitchState.team1Slots || [];
  const team2Slots = pitchState.team2Slots || [];
  const ballPos = pitchState.ballPosition || { x: 50, y: 50 };
  const selectedSpots = pitchState.selectedSpots || [];
  const isAnimating = pitchState.isAnimating || false;

  const canInteract = isActiveDemonstrator;

  // ── TOOL HANDLERS ──
  const handleToolClick = (tool) => {
    if (!canInteract) return;
    if (selectedTool === tool) {
      setSelectedTool(null);
      return;
    }
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

  const handlePlayAnimation = () => {
    if (!canInteract) return;
    socket.emit('demoBallAction', { action: 'PLAY_ANIMATION' });
  };

  const handleSelectSpot = (half, index) => {
    if (!canInteract) return;
    if (selectedTool !== 'SELECT_SPOT') return;
    const isSelected = selectedSpots.includes(`${half}-${index}`);
    const action = isSelected ? 'deselect' : 'select';
    socket.emit('demoSelectSpot', { half, slotIndex: index, action });
  };

  // ── DRAG HANDLERS ──
  const handleDragStart = (e, half, index) => {
    if (!canInteract) return;
    setIsDragging(true);
  };

  const handleDragEnd = (e, half, index) => {
    if (!canInteract || !isDragging) return;
    setIsDragging(false);
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    socket.emit('demoMovePlayer', { half, slotIndex: index, newX: x, newY: y });
  };

  // ── RENDER HALF WITH PLAYER NAMES (Team 1 faces DOWN, Team 2 faces UP) ──
  const renderHalf = (half, slotDefs, teamSlots, teamName, teamColor, isTopHalf) => {
    // Team 1 (top half) - players face DOWN (normal)
    // Team 2 (bottom half) - players face UP (flipped)
    const isFlipped = !isTopHalf;
    
    return (
      <div style={{ 
        position: 'absolute', 
        top: isTopHalf ? 0 : '50%', 
        left: 0, 
        right: 0, 
        height: '50%',
        borderBottom: isTopHalf ? '2px dashed rgba(255,255,255,0.15)' : 'none',
        borderTop: !isTopHalf ? '2px dashed rgba(255,255,255,0.15)' : 'none',
        zIndex: 1,
      }}>
        <div style={{ 
          ...DEEP_TACTICS_STYLES.halfLabel, 
          top: isTopHalf ? '8px' : 'auto', 
          bottom: !isTopHalf ? '8px' : 'auto', 
          left: '50%', 
          transform: 'translateX(-50%)',
          color: teamColor,
        }}>
          {teamName || (half === 'team1' ? 'Team 1' : 'Team 2')} ({half === 'team1' ? formation1 : formation2})
        </div>
        {slotDefs.map((slot, idx) => {
          const player = teamSlots[idx];
          const isSelected = selectedSpots.includes(`${half}-${idx}`);
          const isAnimatingHighlight = animationStep?.highlightSlot === idx && animationStep?.half === half;
          const isEmpty = !player;

          // ── DISPLAY PLAYER NAME if exists, otherwise show position label ──
          const displayName = player ? player.name : slot.label;

          // ── For Team 2 (bottom half), flip the text ──
          const textTransform = isFlipped ? 'scaleY(-1)' : 'none';

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
                cursor: canInteract ? 'grab' : 'default',
                zIndex: isSelected ? 10 : 2,
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
              <span style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                transform: textTransform,
                fontSize: player ? '8px' : '6px',
                fontWeight: player ? 'bold' : 'normal',
                padding: '1px',
                lineHeight: '1.1',
                textAlign: 'center',
                wordBreak: 'break-word',
              }}>
                {displayName}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={DEEP_TACTICS_STYLES.overlay}>
      {/* ── HEADER ── */}
      <div style={DEEP_TACTICS_STYLES.header}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '20px', color: '#FFD700' }}>⚽ Deep Tactics Review</span>
          <span style={{ marginLeft: '12px', fontSize: '12px', color: '#888' }}>
            {isReferee ? '🔴 Referee View' : isReviewFan ? '👤 Review Fan' : '👀 Spectator View'}
          </span>
        </div>
        <button 
          onClick={onClose} 
          style={{ 
            padding: '6px 16px', 
            background: '#dc3545', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: '600' 
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* ── STATUS BAR ── */}
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '8px 12px', 
        borderRadius: '6px', 
        marginBottom: '12px', 
        fontSize: '13px', 
        color: '#aaa', 
        display: 'flex', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        zIndex: 1,
      }}>
        <span>Phase: {gs.deepTactics?.phase || 'IDLE'}</span>
        {isReviewFan && (
          <span style={{ color: isActiveDemonstrator ? '#4caf50' : '#FFD700' }}>
            {isActiveDemonstrator ? '🟢 YOU ARE DEMONSTRATING' : '👀 Watching demonstration'}
          </span>
        )}
      </div>

      {/* ── CONTROL TOOLBAR (Active Demonstrator Only) ── */}
      {showToolbar && (
        <div style={DEEP_TACTICS_STYLES.controlToolbar}>
          <button 
            onClick={() => handleToolClick('SET_BALL')} 
            style={selectedTool === 'SET_BALL' ? DEEP_TACTICS_STYLES.toolButtonActive : DEEP_TACTICS_STYLES.toolButton}
          >
            💥 Ball
          </button>
          <button 
            onClick={() => handleToolClick('ADD_STEP_RIGHT')} 
            style={selectedTool === 'ADD_STEP_RIGHT' ? DEEP_TACTICS_STYLES.toolButtonActive : DEEP_TACTICS_STYLES.toolButton}
          >
            ➡️ Forward-R
          </button>
          <button 
            onClick={() => handleToolClick('ADD_STEP_LEFT')} 
            style={selectedTool === 'ADD_STEP_LEFT' ? DEEP_TACTICS_STYLES.toolButtonActive : DEEP_TACTICS_STYLES.toolButton}
          >
            ⬅️ Forward-L
          </button>
          <button 
            onClick={handlePlayAnimation} 
            style={isAnimating ? DEEP_TACTICS_STYLES.toolButtonPlaying : DEEP_TACTICS_STYLES.toolButton}
          >
            🔶 {isAnimating ? 'Playing...' : 'Play'}
          </button>
          <button 
            onClick={() => handleToolClick('SELECT_SPOT')} 
            style={selectedTool === 'SELECT_SPOT' ? DEEP_TACTICS_STYLES.toolButtonActive : DEEP_TACTICS_STYLES.toolButton}
          >
            ⭕ Select
          </button>
          <button 
            onClick={() => handleToolClick('CLEAR_ANIMATION')} 
            style={DEEP_TACTICS_STYLES.toolButton}
          >
            🟧 Clear
          </button>
        </div>
      )}

      {/* ── PITCH ── */}
      <div style={DEEP_TACTICS_STYLES.pitchContainer}>
        <div ref={pitchRef} style={DEEP_TACTICS_STYLES.pitchWrapper}>
          <PitchMarkings />
          
          {/* Team 1 (top half) - faces DOWN */}
          {renderHalf('team1', slots1, team1Slots, gs.team1Name || 'Team 1', '#1565c0', true)}
          
          {/* Team 2 (bottom half) - faces UP */}
          {renderHalf('team2', slots2, team2Slots, gs.team2Name || 'Team 2', '#b71c1c', false)}
          
          {/* ── BALL ── */}
          <div style={{
            position: 'absolute',
            top: `${ballPos.y}%`,
            left: `${ballPos.x}%`,
            transform: 'translate(-50%, -50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ffffff, #cccccc)',
            boxShadow: '0 0 20px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
            zIndex: 5,
            pointerEvents: 'none',
            border: '2px solid rgba(255,255,255,0.8)',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
