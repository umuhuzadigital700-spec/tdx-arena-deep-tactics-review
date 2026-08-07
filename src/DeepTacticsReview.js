// ── ADDITIVE: DEEP TACTICS REVIEW COMPONENT ──
// New file: src/DeepTacticsReview.js

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
    background: 'linear-gradient(180deg, #1a4d1a 0%, #0d2b0d 100%)',
    borderRadius: '12px',
    border: '2px solid #4caf50',
    overflow: 'hidden',
    minHeight: '400px',
    cursor: 'pointer',
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
    width: '32px',
    height: '32px',
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
  },
  playerPool: {
    background: '#111',
    padding: '8px',
    borderRadius: '6px',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  searchBar: {
    width: '100%',
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '6px',
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

// Formation slot data (reused from App.js)
const FORMATION_SLOTS_DTR = {
  '4-4-2': [
    { label: 'GK',  top: 88, left: 50 }, { label: 'LB',  top: 70, left: 15 }, { label: 'CB1', top: 70, left: 35 }, { label: 'CB2', top: 70, left: 65 }, { label: 'RB',  top: 70, left: 85 },
    { label: 'LM',  top: 50, left: 15 }, { label: 'CM1', top: 50, left: 35 }, { label: 'CM2', top: 50, left: 65 }, { label: 'RM',  top: 50, left: 85 },
    { label: 'ST1', top: 25, left: 35 }, { label: 'ST2', top: 25, left: 65 }
  ],
  '4-3-3': [
    { label: 'GK',  top: 88, left: 50 }, { label: 'LB',  top: 70, left: 15 }, { label: 'CB1', top: 70, left: 35 }, { label: 'CB2', top: 70, left: 65 }, { label: 'RB',  top: 70, left: 85 },
    { label: 'CM1', top: 50, left: 25 }, { label: 'CM2', top: 50, left: 50 }, { label: 'CM3', top: 50, left: 75 },
    { label: 'LW',  top: 20, left: 20 }, { label: 'ST',  top: 15, left: 50 }, { label: 'RW',  top: 20, left: 80 }
  ],
  '3-5-2': [
    { label: 'GK',  top: 88, left: 50 }, { label: 'CB1', top: 70, left: 25 }, { label: 'CB2', top: 70, left: 50 }, { label: 'CB3', top: 70, left: 75 },
    { label: 'LWB', top: 52, left: 10 }, { label: 'CM1', top: 50, left: 30 }, { label: 'CM2', top: 50, left: 50 }, { label: 'CM3', top: 50, left: 70 }, { label: 'RWB', top: 52, left: 90 },
    { label: 'ST1', top: 22, left: 35 }, { label: 'ST2', top: 22, left: 65 }
  ],
  '4-5-1': [
    { label: 'GK',  top: 88, left: 50 }, { label: 'LB',  top: 70, left: 15 }, { label: 'CB1', top: 70, left: 35 }, { label: 'CB2', top: 70, left: 65 }, { label: 'RB',  top: 70, left: 85 },
    { label: 'LM',  top: 50, left: 10 }, { label: 'CM1', top: 50, left: 30 }, { label: 'CM2', top: 50, left: 50 }, { label: 'CM3', top: 50, left: 70 }, { label: 'RM',  top: 50, left: 90 },
    { label: 'ST',  top: 18, left: 50 }
  ],
  '5-3-2': [
    { label: 'GK',  top: 88, left: 50 }, { label: 'LWB', top: 68, left: 10 }, { label: 'CB1', top: 70, left: 28 }, { label: 'CB2', top: 70, left: 50 }, { label: 'CB3', top: 70, left: 72 }, { label: 'RWB', top: 68, left: 90 },
    { label: 'CM1', top: 48, left: 25 }, { label: 'CM2', top: 48, left: 50 }, { label: 'CM3', top: 48, left: 75 },
    { label: 'ST1', top: 22, left: 35 }, { label: 'ST2', top: 22, left: 65 }
  ],
  '4-2-3-1': [
    { label: 'GK',  top: 88, left: 50 }, { label: 'LB',  top: 72, left: 15 }, { label: 'CB1', top: 72, left: 35 }, { label: 'CB2', top: 72, left: 65 }, { label: 'RB',  top: 72, left: 85 },
    { label: 'DM1', top: 57, left: 35 }, { label: 'DM2', top: 57, left: 65 },
    { label: 'LAM', top: 38, left: 20 }, { label: 'CAM', top: 35, left: 50 }, { label: 'RAM', top: 38, left: 80 },
    { label: 'ST',  top: 18, left: 50 }
  ]
};

// ── Main DeepTacticsReview Component ──
export default function DeepTacticsReview({ 
  gameState, 
  socket, 
  user, 
  onClose,
  isReferee,
  isReviewFan,
  reviewRole // 'first' | 'second' | null
}) {
  const [gs, setGs] = useState(gameState || {});
  const [pitchState, setPitchState] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [animationStep, setAnimationStep] = useState(null);
  
  const pitchRef = useRef(null);
  
  // Subscribe to deep tactics updates
  useEffect(() => {
    if (!socket) return;
    
    const handleStateUpdate = (data) => {
      if (data.deepTactics) {
        setPitchState(data.deepTactics.pitchState || {});
        setGs(data);
      }
    };
    
    const handleAnimationStep = (stepData) => {
      setAnimationStep(stepData);
      setTimeout(() => setAnimationStep(null), 500);
    };
    
    socket.on('deepTacticsState', handleStateUpdate);
    socket.on('animationStep', handleAnimationStep);
    socket.on('reviewHandoff', ({ newDemonstrator }) => {
      // Show notification
      alert(`Demonstration control passed to: ${newDemonstrator}`);
    });
    
    return () => {
      socket.off('deepTacticsState', handleStateUpdate);
      socket.off('animationStep', handleAnimationStep);
      socket.off('reviewHandoff');
    };
  }, [socket]);
  
  // Get formation slots
  const formation1 = gs.team1Formation || '4-4-2';
  const formation2 = gs.team2Formation || '4-4-2';
  const slots1 = FORMATION_SLOTS_DTR[formation1] || FORMATION_SLOTS_DTR['4-4-2'];
  const slots2 = FORMATION_SLOTS_DTR[formation2] || FORMATION_SLOTS_DTR['4-4-2'];
  
  const team1Players = pitchState.team1Slots || [];
  const team2Players = pitchState.team2Slots || [];
  const ballPos = pitchState.ballPosition || { x: 50, y: 50 };
  const selectedSpots = pitchState.selectedSpots || [];
  const isAnimating = pitchState.isAnimating || false;
  const canInteract = isReferee || (isReviewFan && reviewRole === 'first' && 
    gs.deepTactics?.activeDemonstrator?.txId === user?.txId);
  
  // Handle spot click for player placement
  const handleSpotClick = (half, index) => {
    if (!canInteract) return;
    if (!selectedPlayer) return;
    
    socket.emit('refPlacePlayerOnPitch', { half, slotIndex: index, playerId: selectedPlayer });
    setSelectedPlayer(null);
  };
  
  // Handle player selection from pool
  const handlePlayerSelect = (playerId) => {
    setSelectedPlayer(selectedPlayer === playerId ? null : playerId);
  };
  
  // Handle tool activation
  const handleToolClick = (tool) => {
    if (!canInteract) return;
    
    if (selectedTool === tool) {
      setSelectedTool(null);
      return;
    }
    
    setSelectedTool(tool);
    
    // Handle specific tool actions
    if (tool === 'CLEAR_ANIMATION') {
      socket.emit('demoBallAction', { action: 'CLEAR_ANIMATION' });
      setSelectedTool(null);
    }
  };
  
  // Handle ball placement
  const handleBallPlacement = (half, index) => {
    if (!canInteract) return;
    if (selectedTool !== 'SET_BALL') return;
    
    socket.emit('demoBallAction', { 
      action: 'SET_BALL', 
      spotIndex: index, 
      half 
    });
    setSelectedTool(null);
  };
  
  // Handle drag start/end
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
  
  // Get selected players from both teams
  const allPlayers = [...(gs.team1Picks || []), ...(gs.team2Picks || [])];
  
  // Filter players
  const filteredPlayers = allPlayers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div style={DEEP_TACTICS_STYLES.overlay}>
      {/* Header */}
      <div style={DEEP_TACTICS_STYLES.header}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '20px', color: '#FFD700' }}>
            ⚽ Deep Tactics Review
          </span>
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
            fontWeight: '600',
          }}
        >
          ✕ Close
        </button>
      </div>
      
      {/* Status Bar */}
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
      }}>
        <span>Phase: {gs.deepTactics?.phase || 'IDLE'}</span>
        {isReferee && (
          <span>First Fan: {gs.deepTactics?.firstReviewFan?.name || 'Not assigned'}</span>
        )}
        {isReferee && (
          <span>Second Fan: {gs.deepTactics?.secondReviewFan?.name || 'Not assigned'}</span>
        )}
        {isReviewFan && (
          <span>Active Demonstrator: {gs.deepTactics?.activeDemonstrator?.name || 'Waiting...'}</span>
        )}
      </div>
      
      {/* Control Toolbar (active demonstrator only) */}
      {canInteract && (
        <div style={DEEP_TACTICS_STYLES.controlToolbar}>
          <button 
            onClick={() => handleToolClick('SET_BALL')}
            style={{
              ...DEEP_TACTICS_STYLES.toolButton,
              background: selectedTool === 'SET_BALL' ? '#FFD700' : '#222',
              color: selectedTool === 'SET_BALL' ? '#000' : '#fff',
            }}
          >
            💥 Ball
          </button>
          <button 
            onClick={() => handleToolClick('ADD_STEP_RIGHT')}
            style={DEEP_TACTICS_STYLES.toolButton}
          >
            ➡️ Forward-R
          </button>
          <button 
            onClick={() => handleToolClick('ADD_STEP_LEFT')}
            style={DEEP_TACTICS_STYLES.toolButton}
          >
            ⬅️ Forward-L
          </button>
          <button 
            onClick={() => handleToolClick('PLAY_ANIMATION')}
            style={{
              ...DEEP_TACTICS_STYLES.toolButton,
              background: isAnimating ? '#4caf50' : '#222',
            }}
          >
            🔶 {isAnimating ? 'Playing...' : 'Play'}
          </button>
          <button 
            onClick={() => handleToolClick('SELECT_SPOT')}
            style={{
              ...DEEP_TACTICS_STYLES.toolButton,
              background: selectedTool === 'SELECT_SPOT' ? '#FFD700' : '#222',
              color: selectedTool === 'SELECT_SPOT' ? '#000' : '#fff',
            }}
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
      
      {/* Pitch */}
      <div style={DEEP_TACTICS_STYLES.pitchContainer}>
        <div 
          ref={pitchRef}
          style={DEEP_TACTICS_STYLES.pitchWrapper}
        >
          {/* Team 1 (top half) */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            borderBottom: '2px dashed rgba(255,255,255,0.2)',
          }}>
            <div style={{ ...DEEP_TACTICS_STYLES.halfLabel, top: '8px', left: '50%', transform: 'translateX(-50%)' }}>
              {gs.team1Player?.name || 'Team 1'} ({formation1})
            </div>
            {slots1.map((slot, idx) => {
              const player = team1Players[idx];
              const isSelected = selectedSpots.includes(`team1-${idx}`);
              const isAnimatingHighlight = animationStep?.highlightSlot === idx && animationStep?.half === 'team1';
              return (
                <div
                  key={`t1-${idx}`}
                  style={{
                    ...DEEP_TACTICS_STYLES.slotCircle,
                    top: `${slot.top}%`,
                    left: `${slot.left}%`,
                    background: player ? '#1565c0' : 'rgba(255,255,255,0.1)',
                    border: isSelected ? '3px dashed #FFD700' : 
                            isAnimatingHighlight ? '3px solid #4caf50' :
                            '2px solid rgba(255,255,255,0.3)',
                    boxShadow: isSelected ? '0 0 20px rgba(255,215,0,0.3)' : 'none',
                    cursor: canInteract ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (selectedTool === 'SET_BALL') {
                      handleBallPlacement('team1', idx);
                    } else if (selectedTool === 'SELECT_SPOT') {
                      const action = isSelected ? 'deselect' : 'select';
                      socket.emit('demoSelectSpot', { half: 'team1', slotIndex: idx, action });
                    } else if (selectedPlayer) {
                      handleSpotClick('team1', idx);
                    }
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'team1', idx)}
                  onMouseUp={(e) => handleDragEnd(e, 'team1', idx)}
                  onMouseLeave={(e) => {
                    if (isDragging) handleDragEnd(e, 'team1', idx);
                  }}
                >
                  {player ? player.name : slot.label}
                </div>
              );
            })}
          </div>
          
          {/* Team 2 (bottom half) */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
          }}>
            <div style={{ ...DEEP_TACTICS_STYLES.halfLabel, bottom: '8px', left: '50%', transform: 'translateX(-50%)' }}>
              {gs.team2Player?.name || 'Team 2'} ({formation2})
            </div>
            {slots2.map((slot, idx) => {
              const player = team2Players[idx];
              const isSelected = selectedSpots.includes(`team2-${idx}`);
              const isAnimatingHighlight = animationStep?.highlightSlot === idx && animationStep?.half === 'team2';
              return (
                <div
                  key={`t2-${idx}`}
                  style={{
                    ...DEEP_TACTICS_STYLES.slotCircle,
                    top: `${100 - slot.top}%`,
                    left: `${slot.left}%`,
                    background: player ? '#d32f2f' : 'rgba(255,255,255,0.1)',
                    border: isSelected ? '3px dashed #FFD700' : 
                            isAnimatingHighlight ? '3px solid #4caf50' :
                            '2px solid rgba(255,255,255,0.3)',
                    boxShadow: isSelected ? '0 0 20px rgba(255,215,0,0.3)' : 'none',
                    cursor: canInteract ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (selectedTool === 'SET_BALL') {
                      handleBallPlacement('team2', idx);
                    } else if (selectedTool === 'SELECT_SPOT') {
                      const action = isSelected ? 'deselect' : 'select';
                      socket.emit('demoSelectSpot', { half: 'team2', slotIndex: idx, action });
                    } else if (selectedPlayer) {
                      handleSpotClick('team2', idx);
                    }
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'team2', idx)}
                  onMouseUp={(e) => handleDragEnd(e, 'team2', idx)}
                  onMouseLeave={(e) => {
                    if (isDragging) handleDragEnd(e, 'team2', idx);
                  }}
                >
                  {player ? player.name : slot.label}
                </div>
              );
            })}
          </div>
          
          {/* Ball */}
          <div style={{
            position: 'absolute',
            top: `${ballPos.y}%`,
            left: `${ballPos.x}%`,
            transform: 'translate(-50%, -50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #fff, #ddd)',
            boxShadow: '0 0 20px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
            zIndex: 10,
            pointerEvents: 'none',
            border: '2px solid #555',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#222',
            }} />
          </div>
          
          {/* Center circle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            pointerEvents: 'none',
          }} />
        </div>
        
        {/* Player Pool */}
        {isReferee && (
          <div style={DEEP_TACTICS_STYLES.playerPool}>
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={DEEP_TACTICS_STYLES.searchBar}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {filteredPlayers.map(player => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerSelect(player.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: selectedPlayer === player.id ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedPlayer === player.id ? '1px solid #FFD700' : '1px solid #333',
                    fontSize: '11px',
                    cursor: canInteract ? 'pointer' : 'default',
                    color: '#fff',
                  }}
                >
                  {player.name} ({player.position})
                </div>
              ))}
            </div>
            {selectedPlayer && (
              <div style={{ 
                fontSize: '11px', 
                color: '#FFD700', 
                marginTop: '4px',
                padding: '4px 8px',
                background: 'rgba(255,215,0,0.1)',
                borderRadius: '4px',
              }}>
                ℹ️ Tap a spot on the pitch to place {filteredPlayers.find(p => p.id === selectedPlayer)?.name}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Referee Controls */}
      {isReferee && (
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 0',
          borderTop: '1px solid #333',
          marginTop: '8px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => socket.emit('refOpenDemonstration')}
            style={{
              ...DEEP_TACTICS_STYLES.toolButton,
              background: gs.deepTactics?.pitchState?.showDemo ? '#4caf50' : '#222',
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
            style={DEEP_TACTICS_STYLES.toolButton}
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
            style={DEEP_TACTICS_STYLES.toolButton}
          >
            ▶️ Start Demonstration
          </button>
          <button
            onClick={() => socket.emit('refNextReview')}
            style={DEEP_TACTICS_STYLES.toolButton}
          >
            ➡️ Next Review
          </button>
        </div>
      )}
      
      {/* Review Fan Status */}
      {isReviewFan && !canInteract && (
        <div style={{
          textAlign: 'center',
          padding: '12px',
          background: 'rgba(255,215,0,0.1)',
          borderRadius: '8px',
          border: '1px solid #FFD700',
          marginTop: '8px',
        }}>
          <span style={{ fontSize: '16px', color: '#FFD700' }}>
            ⏳ Waiting for your turn...
          </span>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            {gs.deepTactics?.activeDemonstrator?.name || 'No active demonstrator'}
          </div>
        </div>
      )}
    </div>
  );
}
