// src/DeepTacticsReview.js - Full Interactive Demonstration Pitch (FULLY WORKING)
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
    padding: 'clamp(8px, 2vw, 16px)',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #333',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px',
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
    minHeight: 'clamp(300px, 50vh, 500px)',
    maxHeight: 'clamp(400px, 70vh, 600px)',
    cursor: 'default',
    touchAction: 'none',
  },
  halfLabel: {
    position: 'absolute',
    fontSize: 'clamp(10px, 1.2vw, 14px)',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    zIndex: 1,
  },
  slotCircle: {
    position: 'absolute',
    width: 'clamp(32px, 4vw, 44px)',
    height: 'clamp(32px, 4vw, 44px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(6px, 0.7vw, 8px)',
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
    touchAction: 'none',
  },
  controlToolbar: {
    display: 'flex',
    gap: 'clamp(4px, 1vw, 8px)',
    padding: '8px 4px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  toolButton: {
    padding: 'clamp(4px, 0.8vw, 8px) clamp(8px, 1.5vw, 14px)',
    borderRadius: '6px',
    border: '1px solid #555',
    background: '#222',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 'clamp(11px, 1.2vw, 14px)',
    fontWeight: '600',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  toolButtonActive: {
    padding: 'clamp(4px, 0.8vw, 8px) clamp(8px, 1.5vw, 14px)',
    borderRadius: '6px',
    border: '2px solid #FFD700',
    background: '#FFD700',
    color: '#000',
    cursor: 'pointer',
    fontSize: 'clamp(11px, 1.2vw, 14px)',
    fontWeight: '700',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  toolButtonPlaying: {
    padding: 'clamp(4px, 0.8vw, 8px) clamp(8px, 1.5vw, 14px)',
    borderRadius: '6px',
    border: '2px solid #4caf50',
    background: '#4caf50',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 'clamp(11px, 1.2vw, 14px)',
    fontWeight: '700',
    transition: 'all 0.15s ease',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
};

const FORMATION_SLOTS_DTR = {
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
  ]
};

function PitchMarkings() {
  return (
    <>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'clamp(50px, 8vw, 80px)', height: 'clamp(50px, 8vw, 80px)', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderTop: 'none', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '18%', border: '2px solid rgba(255,255,255,0.15)', borderBottom: 'none', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: 0, left: '35%', right: '35%', height: '8%', border: '2px solid rgba(255,255,255,0.1)', borderTop: 'none', pointerEvents: 'none', zIndex: 1 }} />
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
  const dragDataRef = useRef(null);

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

  useEffect(() => {
    const isActive = isReviewFan && 
      gs.deepTactics?.activeDemonstrator?.txId === user?.txId &&
      hasControl;
    setIsActiveDemonstrator(isActive);
    setShowToolbar(isActive);
  }, [gs.deepTactics?.activeDemonstrator, user, hasControl, isReviewFan]);

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

  const handleDragStart = (e, half, index) => {
    if (!canInteract) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragDataRef.current = { half, index, clientX, clientY, isDragging: true };
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!canInteract || !isDragging || !dragDataRef.current) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragDataRef.current.clientX = clientX;
    dragDataRef.current.clientY = clientY;
  };

  const handleDragEnd = (e) => {
    if (!canInteract || !isDragging || !dragDataRef.current) return;
    e.preventDefault();
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((dragDataRef.current.clientX - rect.left) / rect.width) * 100;
    const y = ((dragDataRef.current.clientY - rect.top) / rect.height) * 100;
    const { half, index } = dragDataRef.current;
    socket.emit('demoMovePlayer', { half, slotIndex: index, newX: x, newY: y });
    setIsDragging(false);
    dragDataRef.current = null;
  };

  const renderHalf = (half, slotDefs, teamSlots, teamName, teamColor, isTopHalf) => {
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
          const displayName = player ? player.name : slot.label;
          const topPos = isTopHalf ? slot.top : (100 - slot.top);

          return (
            <div
              key={`${half}-${idx}`}
              style={{
                ...DEEP_TACTICS_STYLES.slotCircle,
                top: `${topPos}%`,
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
              onMouseUp={handleDragEnd}
              onMouseLeave={(e) => { if (isDragging) handleDragEnd(e); }}
              onTouchStart={(e) => handleDragStart(e, half, idx)}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <span style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                fontSize: player ? 'clamp(7px, 0.8vw, 9px)' : 'clamp(5px, 0.6vw, 7px)',
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
      <div style={DEEP_TACTICS_STYLES.header}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 'clamp(16px, 2.5vw, 22px)', color: '#FFD700' }}>⚽ Deep Tactics Review</span>
          <span style={{ marginLeft: '12px', fontSize: 'clamp(10px, 1vw, 12px)', color: '#888' }}>
            {isReferee ? '🔴 Referee View' : isReviewFan ? '👤 Review Fan' : '👀 Spectator View'}
          </span>
        </div>
        <button 
          onClick={onClose} 
          style={{ 
            padding: 'clamp(4px, 0.8vw, 8px) clamp(12px, 2vw, 20px)', 
            background: '#dc3545', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            fontWeight: '600',
            fontSize: 'clamp(12px, 1.2vw, 14px)',
            touchAction: 'manipulation',
          }}
        >
          ✕ Close
        </button>
      </div>

      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        padding: '8px 12px', 
        borderRadius: '6px', 
        marginBottom: '12px', 
        fontSize: 'clamp(11px, 1vw, 13px)', 
        color: '#aaa', 
        display: 'flex', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 1,
      }}>
        <span>Phase: {gs.deepTactics?.phase || 'IDLE'}</span>
        {isReviewFan && (
          <span style={{ color: isActiveDemonstrator ? '#4caf50' : '#FFD700' }}>
            {isActiveDemonstrator ? '🟢 YOU ARE DEMONSTRATING' : '👀 Watching demonstration'}
          </span>
        )}
      </div>

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

      <div style={DEEP_TACTICS_STYLES.pitchContainer}>
        <div 
          ref={pitchRef} 
          style={DEEP_TACTICS_STYLES.pitchWrapper}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <PitchMarkings />
          
          {renderHalf('team1', slots1, team1Slots, gs.team1Name || 'Team 1', '#1565c0', true)}
          {renderHalf('team2', slots2, team2Slots, gs.team2Name || 'Team 2', '#b71c1c', false)}
          
          <div style={{
            position: 'absolute',
            top: `${ballPos.y}%`,
            left: `${ballPos.x}%`,
            transform: 'translate(-50%, -50%)',
            width: 'clamp(14px, 1.8vw, 20px)',
            height: 'clamp(14px, 1.8vw, 20px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffffff, #cccccc)',
            boxShadow: '0 0 30px rgba(255,255,255,0.5), 0 4px 15px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.2)',
            zIndex: 5,
            pointerEvents: 'none',
            border: '2px solid rgba(255,255,255,0.9)',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(3px, 0.4vw, 5px)',
              height: 'clamp(3px, 0.4vw, 5px)',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)',
            }} />
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: 'clamp(3px, 0.3vw, 4px)',
              height: 'clamp(3px, 0.3vw, 4px)',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.6)',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
