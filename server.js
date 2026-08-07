// server.js — TDX Arena Deep Tactics Review Backend
const PLAYERS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbZ1scBQnek93hKRTCjN74gBCWz7JV7hP2gw4Zkw58TI93kScE-r61IB6UDoUe4miKn1oH2tis7F7r/pub?gid=0&single=true&output=csv';
const PAYMENT_VERIFY_URL = 'https://script.google.com/macros/s/AKfycby53O0rxnbNv3i7gLkxAZDmSVbjtAD6LEpEwE4nelF0sFNXXqInNFsvrZfnszPjbcGk/exec';
const VIP_THRESHOLD = 2000;

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// ── GAME STATE ──
function freshGameState() {
  return {
    allViewers: [],
    deepTactics: {
      active: false,
      firstReviewFan: null,
      secondReviewFan: null,
      activeDemonstrator: null,
      phase: 'IDLE',
      pitchState: {
        team1Slots: new Array(11).fill(null),
        team2Slots: new Array(11).fill(null),
        ballPosition: { x: 50, y: 50 },
        selectedSpots: [],
        animationQueue: [],
        isAnimating: false,
        showDemo: false,
      },
      searchTerm: '',
    },
    // ── FORMATION SETTINGS (for the pitch) ──
    team1Formation: '4-4-2',
    team2Formation: '4-4-2',
    team1Name: 'Team 1',
    team2Name: 'Team 2',
    team1Picks: [],
    team2Picks: [],
  };
}

let state = freshGameState();
const activeSockets = new Map();
const sessionStore = new Map();
const SESSION_TIMEOUT = 300000; // 5 minutes

// ── HEARTBEAT ──
const heartbeatRegistry = new Map();
const HEARTBEAT_TIMEOUT = 900000; // 15 minutes
const HEARTBEAT_CHECK_INTERVAL = 60000;

function getPublicState() {
  return { ...state };
}

function broadcast() {
  io.emit('gameStateUpdate', getPublicState());
}

function findViewerByTxId(txId) {
  return state.allViewers.find(v => String(v.txId) === String(txId));
}

function getViewerByTxIdSafe(txId) {
  if (!txId) return null;
  return state.allViewers.find(v => String(v.txId) === String(txId).trim()) || null;
}

function findViewerBySocket(sid) {
  return state.allViewers.find(v => v.id === sid);
}

// ── PLAYER LOADER FROM CSV ──
let masterCardPool = [];

async function loadPickedPlayers() {
  try {
    const res = await fetch(PLAYERS_CSV_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const text = await res.text();
    const rows = parseCSV(text);

    if (rows.length > 0) {
      const validRows = rows.filter(row => {
        const name = row.name || row.Name || row.NAME;
        const id = row.id || row.ID;
        if (!name || !id) return false;
        if (!String(name).trim()) return false;
        return true;
      });

      if (validRows.length > 0) {
        const newPool = validRows.map((r, i) => ({
          id: String(r.id || r.ID || `P${i + 1}`).trim(),
          name: String(r.name || r.Name || r.NAME || `Player ${i + 1}`).trim(),
          position: String(r.position || r.Position || r.POSITION || 'CM').trim(),
          rating: parseInt(r.rating || r.Rating || r.RATING || 75, 10),
          club: String(r.club || r.Club || r.CLUB || '').trim(),
          image: String(r.image || r.Image || r.IMAGE || '').trim(),
          team: String(r.team || r.Team || r.TEAM || '').trim(),
          slotIndex: parseInt(r.slotIndex || r.SlotIndex || r.SLOTINDEX || 0, 10),
        }));

        if (newPool.length > 0) {
          // Split players by team
          const team1Picks = newPool.filter(p => p.team && p.team.toLowerCase().includes('team 1'));
          const team2Picks = newPool.filter(p => p.team && p.team.toLowerCase().includes('team 2'));
          // Any unassigned go to team1 as fallback
          const unassigned = newPool.filter(p => !p.team || !p.team.toLowerCase().includes('team'));
          
          state.team1Picks = [...team1Picks, ...unassigned].slice(0, 11);
          state.team2Picks = team2Picks.slice(0, 11);
          
          masterCardPool = newPool;
          console.log(`✅ Picked players loaded: ${masterCardPool.length} players`);
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    console.warn('⚠️ Failed to load picked players:', e.message);
    return false;
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

// ── PERIODIC RELOAD ──
setInterval(async () => {
  const loaded = await loadPickedPlayers();
  if (loaded) {
    // Update pitch with new players
    state.deepTactics.pitchState.team1Slots = state.team1Picks.slice(0, 11);
    while (state.deepTactics.pitchState.team1Slots.length < 11) {
      state.deepTactics.pitchState.team1Slots.push(null);
    }
    state.deepTactics.pitchState.team2Slots = state.team2Picks.slice(0, 11);
    while (state.deepTactics.pitchState.team2Slots.length < 11) {
      state.deepTactics.pitchState.team2Slots.push(null);
    }
    broadcast();
  }
}, 60000); // Reload every minute

// ── PAYMENT VERIFICATION ──
async function verifyPayment(txId, name) {
  try {
    const url = `${PAYMENT_VERIFY_URL}?code=${encodeURIComponent(txId)}&name=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      valid: data.valid === true,
      amount: parseInt(data.amount || 0, 10),
      isVIP: parseInt(data.amount || 0, 10) >= VIP_THRESHOLD,
      matchName: data.name || name,
    };
  } catch (e) {
    return { valid: false, amount: 0, isVIP: false, matchName: name };
  }
}

const REF_TOKEN = process.env.REF_TOKEN || 'REFEREE_2025';

// ── ANIMATION SEQUENCE PLAYER ──
function playAnimationSequence(socket) {
  const pitch = state.deepTactics.pitchState;
  let stepIndex = 0;
  const totalSteps = pitch.animationQueue.length;
  
  function processStep() {
    if (stepIndex >= totalSteps) {
      pitch.isAnimating = false;
      io.emit('deepTacticsState', state.deepTactics);
      return;
    }
    
    const step = pitch.animationQueue[stepIndex];
    const moveDelta = 15;
    
    switch(step.direction) {
      case 'forward-right':
        pitch.ballPosition.x = Math.min(100, pitch.ballPosition.x + moveDelta);
        pitch.ballPosition.y = Math.max(0, pitch.ballPosition.y - moveDelta);
        break;
      case 'forward-left':
        pitch.ballPosition.x = Math.max(0, pitch.ballPosition.x - moveDelta);
        pitch.ballPosition.y = Math.max(0, pitch.ballPosition.y - moveDelta);
        break;
      case 'backward-right':
        pitch.ballPosition.x = Math.min(100, pitch.ballPosition.x + moveDelta);
        pitch.ballPosition.y = Math.min(100, pitch.ballPosition.y + moveDelta);
        break;
      case 'backward-left':
        pitch.ballPosition.x = Math.max(0, pitch.ballPosition.x - moveDelta);
        pitch.ballPosition.y = Math.min(100, pitch.ballPosition.y + moveDelta);
        break;
    }
    
    const highlightSlot = step.spotIndex;
    io.emit('deepTacticsState', state.deepTactics);
    io.emit('animationStep', { stepIndex, totalSteps, highlightSlot });
    
    stepIndex++;
    setTimeout(processStep, step.duration || 1000);
  }
  
  setTimeout(processStep, 500);
}

// ── REST ENDPOINTS ──
app.post('/api/verify', async (req, res) => {
  const { txId, name } = req.body;
  if (!txId || !name) return res.status(400).json({ error: 'txId and name required' });
  
  if (activeSockets.has(String(txId).trim())) {
    return res.status(400).json({ valid: false, error: 'DUPLICATE_SESSION', message: 'This TDX-ID is already active on another device.' });
  }

  const result = await verifyPayment(txId, name);
  res.json(result);
});

app.get('/api/state', (req, res) => res.json(getPublicState()));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// ── SOCKET.IO CONNECTION HANDLER ──
io.on('connection', (socket) => {
  socket.emit('gameStateUpdate', getPublicState());

  socket.on('joinWaitingRoom', async ({ name, ticketCode }) => {
    if (!name || !ticketCode) return;
    const txId = String(ticketCode).trim();

    if (activeSockets.has(txId)) {
      const activeSid = activeSockets.get(txId);
      if (activeSid !== socket.id) {
        socket.emit('loginError', { code: 'DUPLICATE_SESSION', message: 'This TDX-ID is active on another device.' });
        return;
      }
    }

    const existing = findViewerByTxId(txId);
    if (existing) {
      existing.id = socket.id;
      activeSockets.set(txId, socket.id);
      socket.emit('loginSuccess', { txId, name: existing.name, isVIP: existing.isVIP, amount: existing.amount });
      socket.emit('gameStateUpdate', getPublicState());
      return;
    }

    const payment = await verifyPayment(txId, name);
    if (!payment.valid) {
      socket.emit('loginError', { code: 'INVALID_PAYMENT', message: 'TDX-ID ntabwo yemejwe.' });
      return;
    }

    const viewer = {
      id: socket.id,
      txId,
      name: payment.matchName || String(name).trim(),
      role: 'spectator',
      isPremium: payment.isVIP,
      amount: payment.amount,
      isVIP: payment.isVIP,
      secureLink: null,
    };

    state.allViewers.push(viewer);
    activeSockets.set(txId, socket.id);
    
    sessionStore.set(txId, {
      name: viewer.name,
      role: viewer.role,
      isVIP: viewer.isVIP,
      amount: viewer.amount,
      lastSeen: Date.now()
    });
    
    socket.emit('loginSuccess', { txId, name: viewer.name, isVIP: viewer.isVIP, amount: viewer.amount });
    broadcast();
  });

  socket.on('claimReferee', (token) => {
    if (token !== REF_TOKEN) {
      socket.emit('refConfirm', false);
      return;
    }
    socket.emit('refConfirm', true);
    socket.emit('gameStateUpdate', getPublicState());
  });

  // ── DEEP TACTICS REVIEW EVENTS ──
  socket.on('refInitDeepTactics', () => {
    // Always allow in this app
    state.deepTactics.active = true;
    state.deepTactics.phase = 'ASSIGNING';
    state.deepTactics.pitchState = {
      team1Slots: state.team1Picks.slice(0, 11),
      team2Slots: state.team2Picks.slice(0, 11),
      ballPosition: { x: 50, y: 50 },
      selectedSpots: [],
      animationQueue: [],
      isAnimating: false,
      showDemo: false,
    };
    
    while (state.deepTactics.pitchState.team1Slots.length < 11) {
      state.deepTactics.pitchState.team1Slots.push(null);
    }
    while (state.deepTactics.pitchState.team2Slots.length < 11) {
      state.deepTactics.pitchState.team2Slots.push(null);
    }
    
    broadcast();
    io.emit('deepTacticsState', state.deepTactics);
  });

  socket.on('refAssignReviewFans', ({ firstFanTxId, secondFanTxId }) => {
    if (!state.deepTactics.active) return;
    
    const firstFan = state.allViewers.find(v => String(v.txId) === firstFanTxId);
    const secondFan = state.allViewers.find(v => String(v.txId) === secondFanTxId);
    
    if (firstFan) state.deepTactics.firstReviewFan = firstFan;
    if (secondFan) state.deepTactics.secondReviewFan = secondFan;
    
    if (firstFan || secondFan) {
      state.deepTactics.phase = 'SETUP';
    }
    
    broadcast();
    io.emit('deepTacticsState', state.deepTactics);
  });

  socket.on('refPlacePlayerOnPitch', ({ half, slotIndex, playerId }) => {
    if (!state.deepTactics.active || state.deepTactics.phase === 'LIVE_DEMO') return;
    
    const halfSlots = half === 'team1' 
      ? state.deepTactics.pitchState.team1Slots 
      : state.deepTactics.pitchState.team2Slots;
    
    if (slotIndex < 0 || slotIndex >= 11) return;
    
    const player = (half === 'team1' ? state.team1Picks : state.team2Picks)
      .find(p => String(p.id) === String(playerId));
    
    if (player) {
      halfSlots[slotIndex] = player;
      broadcast();
      io.emit('deepTacticsState', state.deepTactics);
    }
  });

  socket.on('refOpenDemonstration', () => {
    if (!state.deepTactics.active) return;
    state.deepTactics.pitchState.showDemo = true;
    state.deepTactics.phase = 'DEMONSTRATION_READY';
    broadcast();
    io.emit('deepTacticsState', state.deepTactics);
  });

  socket.on('refStartDemonstration', ({ fanTxId }) => {
    if (!state.deepTactics.active || !state.deepTactics.pitchState.showDemo) return;
    
    const fan = state.allViewers.find(v => String(v.txId) === fanTxId);
    if (!fan) return;
    
    state.deepTactics.activeDemonstrator = fan;
    state.deepTactics.phase = 'LIVE_DEMO';
    
    broadcast();
    io.emit('deepTacticsState', state.deepTactics);
  });

  socket.on('demoMovePlayer', ({ half, slotIndex, newX, newY }) => {
    if (!state.deepTactics.active || state.deepTactics.phase !== 'LIVE_DEMO') return;
    
    const viewer = findViewerBySocket(socket.id);
    if (!viewer || String(viewer.txId) !== String(state.deepTactics.activeDemonstrator?.txId)) return;
    
    const halfSlots = half === 'team1' 
      ? state.deepTactics.pitchState.team1Slots 
      : state.deepTactics.pitchState.team2Slots;
    
    if (slotIndex < 0 || slotIndex >= 11 || !halfSlots[slotIndex]) return;
    
    halfSlots[slotIndex] = {
      ...halfSlots[slotIndex],
      _x: Math.max(0, Math.min(100, newX)),
      _y: Math.max(0, Math.min(100, newY))
    };
    
    io.emit('deepTacticsState', state.deepTactics);
  });

  socket.on('demoBallAction', ({ action, spotIndex, half, direction }) => {
    if (!state.deepTactics.active || state.deepTactics.phase !== 'LIVE_DEMO') return;
    
    const viewer = findViewerBySocket(socket.id);
    if (!viewer || String(viewer.txId) !== String(state.deepTactics.activeDemonstrator?.txId)) return;
    
    const pitch = state.deepTactics.pitchState;
    
    switch(action) {
      case 'SET_BALL':
        if (spotIndex !== undefined && half) {
          const halfSlots = half === 'team1' ? pitch.team1Slots : pitch.team2Slots;
          if (spotIndex >= 0 && spotIndex < 11 && halfSlots[spotIndex]) {
            const slot = halfSlots[spotIndex];
            pitch.ballPosition = { 
              x: slot._x || [10, 30, 50, 70, 90][spotIndex % 5],
              y: slot._y || [20, 40, 60, 80][Math.floor(spotIndex / 3) % 4]
            };
          }
        }
        break;
        
      case 'ADD_ANIMATION_STEP':
        if (direction && spotIndex !== undefined && half) {
          pitch.animationQueue.push({
            direction,
            spotIndex,
            half,
            duration: 1000
          });
        }
        break;
        
      case 'PLAY_ANIMATION':
        if (pitch.animationQueue.length > 0) {
          pitch.isAnimating = true;
          io.emit('deepTacticsState', state.deepTactics);
          playAnimationSequence(socket);
        }
        break;
        
      case 'CLEAR_ANIMATION':
        pitch.animationQueue = [];
        pitch.isAnimating = false;
        break;
    }
    
    io.emit('deepTacticsState', state.deepTactics);
  });

  socket.on('demoSelectSpot', ({ half, slotIndex, action }) => {
    if (!state.deepTactics.active || state.deepTactics.phase !== 'LIVE_DEMO') return;
    
    const viewer = findViewerBySocket(socket.id);
    if (!viewer || String(viewer.txId) !== String(state.deepTactics.activeDemonstrator?.txId)) return;
    
    const pitch = state.deepTactics.pitchState;
    const spotKey = `${half}-${slotIndex}`;
    
    if (action === 'select') {
      if (!pitch.selectedSpots.includes(spotKey)) {
        pitch.selectedSpots.push(spotKey);
      }
    } else if (action === 'deselect') {
      pitch.selectedSpots = pitch.selectedSpots.filter(s => s !== spotKey);
    } else if (action === 'clear') {
      pitch.selectedSpots = [];
    }
    
    io.emit('deepTacticsState', state.deepTactics);
  });

  socket.on('refNextReview', () => {
    if (!state.deepTactics.active) return;
    
    const current = state.deepTactics.activeDemonstrator;
    const nextFan = state.deepTactics.secondReviewFan;
    
    if (nextFan && (!current || String(current.txId) !== String(nextFan.txId))) {
      state.deepTactics.activeDemonstrator = nextFan;
      state.deepTactics.pitchState.selectedSpots = [];
      state.deepTactics.pitchState.animationQueue = [];
      state.deepTactics.pitchState.isAnimating = false;
      io.emit('deepTacticsState', state.deepTactics);
      io.emit('reviewHandoff', { newDemonstrator: nextFan.name });
    }
  });

  // ── HEARTBEAT ──
  socket.on('heartbeat', ({ txId }) => {
    if (!txId) return;
    const txIdStr = String(txId).trim();
    const viewer = getViewerByTxIdSafe(txIdStr);
    if (!viewer) return;
    
    heartbeatRegistry.set(txIdStr, {
      socketId: socket.id,
      lastHeartbeat: Date.now(),
      viewer: viewer
    });
    
    const session = sessionStore.get(txIdStr);
    if (session) {
      session.lastSeen = Date.now();
    }
    
    const existsInState = state.allViewers.some(v => String(v.txId) === txIdStr);
    if (!existsInState) {
      state.allViewers.push(viewer);
      broadcast();
    }
  });

  // ── DISCONNECT ──
  socket.on('disconnect', () => {
    for (const [txId, sid] of activeSockets.entries()) {
      if (sid === socket.id) {
        activeSockets.delete(txId);
        const viewerIdx = state.allViewers.findIndex(v => v.id === socket.id);
        if (viewerIdx !== -1) state.allViewers.splice(viewerIdx, 1);
        broadcast();
        break;
      }
    }
  });
});

// ── HEARTBEAT CLEANUP ──
setInterval(() => {
  const now = Date.now();
  const staleEntries = [];
  
  for (const [txId, data] of heartbeatRegistry.entries()) {
    const timeSinceLastHeartbeat = now - data.lastHeartbeat;
    const socketStillActive = activeSockets.has(txId);
    
    if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT && !socketStillActive) {
      staleEntries.push(txId);
    }
  }
  
  for (const txId of staleEntries) {
    heartbeatRegistry.delete(txId);
    if (!activeSockets.has(txId)) {
      const viewerIdx = state.allViewers.findIndex(v => String(v.txId) === txId);
      if (viewerIdx !== -1) {
        state.allViewers.splice(viewerIdx, 1);
      }
    }
  }
  
  for (const [txId, session] of sessionStore.entries()) {
    if (now - session.lastSeen > SESSION_TIMEOUT) {
      sessionStore.delete(txId);
    }
  }
  
  if (staleEntries.length > 0) {
    broadcast();
  }
}, HEARTBEAT_CHECK_INTERVAL);

// ── START SERVER ──
const PORT = process.env.PORT || 4001; // Use different port than main app

loadPickedPlayers().then(() => {
  // Initialize pitch with players
  state.deepTactics.pitchState.team1Slots = state.team1Picks.slice(0, 11);
  while (state.deepTactics.pitchState.team1Slots.length < 11) {
    state.deepTactics.pitchState.team1Slots.push(null);
  }
  state.deepTactics.pitchState.team2Slots = state.team2Picks.slice(0, 11);
  while (state.deepTactics.pitchState.team2Slots.length < 11) {
    state.deepTactics.pitchState.team2Slots.push(null);
  }
  
  server.listen(PORT, () => {
    console.log(`🧠 Deep Tactics Review server running on port ${PORT}`);
  });
});
