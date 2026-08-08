// src/App.js - TDX Arena Deep Tactics Review (FULLY MOBILE RESPONSIVE)
import React, { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import RefereeDashboard from './RefereeDashboard';
import DeepTacticsReview from './DeepTacticsReview';

const BACKEND_URL = window.location.origin;

const socket = io(BACKEND_URL, {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
  forceNew: false,
  upgrade: true,
});

const WARNING_TEXT = `Iki gikoresho ni urubuga rwo gusesengura takitike (Deep Tactics Review). Gukoresha uyu mukino wemera ko wujuje amategeko yose yavuzwe.`;
const LOGIN_INSTRUCTION = `KWINIURA: ANDIKA TDX-ID YAWE`;

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 'clamp(14px, 2vw, 16px)',
  outline: 'none',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
};

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [refLoading, setRefLoading] = useState(false);
  const [error, setError] = useState('');
  const [refMode, setRefMode] = useState(false);
  const [refToken, setRefToken] = useState('');

  const handleFanLogin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !txId.trim()) { setError('Please enter your name and TDX-ID.'); return; }
    if (txId.trim().length !== 11) { setError('TDX-ID must be exactly 11 digits.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId: txId.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (res.status === 400 || data.error === 'DUPLICATE_SESSION') {
        setError(data.message || 'This TDX-ID is already actively in use.');
        setLoading(false);
        return;
      }
      if (data.valid) {
        socket.emit('joinWaitingRoom', { name: name.trim(), ticketCode: txId.trim() });
        onLogin({ name: data.matchName || name.trim(), txId: txId.trim(), isVIP: data.isVIP, amount: data.amount, role: 'fan' });
      } else {
        setError('TDX-ID not verified. Check the SMS you received.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleRefLogin = (e) => {
    e.preventDefault();
    if (!refToken.trim() || refLoading) return;
    const token = refToken.trim();
    setRefLoading(true);
    setError('');
    const timeout = setTimeout(() => {
      setRefLoading(false);
      setError('Server did not respond. Check your internet.');
    }, 6000);
    socket.once('refConfirm', (ok) => {
      clearTimeout(timeout);
      setRefLoading(false);
      if (ok) {
        onLogin({ name: 'Referee', txId: 'REF', isVIP: true, role: 'referee', token });
      } else {
        setError('Invalid referee token. Try again.');
      }
    });
    socket.emit('claimReferee', token);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            fontSize: 'clamp(32px, 8vw, 48px)',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: 2,
          }}>🧠 DEEP TACTICS</div>
          <div style={{ color: '#aaa', fontSize: 'clamp(11px, 1.5vw, 13px)', letterSpacing: 2, textTransform: 'uppercase' }}>
            Review Arena
          </div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,200,0,0.25)',
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 20,
        }}>
          <p style={{ color: '#ccc', fontSize: 'clamp(11px, 1.2vw, 13px)', lineHeight: 1.7, margin: 0 }}>
            {WARNING_TEXT}
          </p>
          <div style={{
            background: '#FFD700',
            color: '#000',
            borderRadius: 8,
            padding: '10px 14px',
            fontWeight: 800,
            fontSize: 'clamp(13px, 1.5vw, 15px)',
            marginTop: 12,
          }}>
            {LOGIN_INSTRUCTION}
          </div>
        </div>
        {!refMode ? (
          <form onSubmit={handleFanLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: '#aaa', fontSize: 'clamp(11px, 1.2vw, 12px)', display: 'block', marginBottom: 5 }}>
                Amazina (Izina)
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                maxLength={60}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#aaa', fontSize: 'clamp(11px, 1.2vw, 12px)', display: 'block', marginBottom: 5 }}>
                TDX-ID (11 digits)
              </label>
              <input
                value={txId}
                onChange={e => setTxId(e.target.value.replace(/\D/g, '').substring(0, 11))}
                placeholder="00000000000"
                inputMode="numeric"
                maxLength={11}
                style={{ ...inputStyle, letterSpacing: 4, fontWeight: 700, fontSize: 'clamp(16px, 3vw, 20px)' }}
              />
            </div>
            {error && (
              <div style={{
                background: 'rgba(220,50,50,0.15)',
                border: '1px solid rgba(220,50,50,0.4)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#ff6b6b',
                fontSize: 'clamp(12px, 1.2vw, 13px)',
                marginBottom: 14,
              }}>
                ⚠️ {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || txId.length !== 11 || !name.trim()}
              style={{
                width: '100%',
                padding: '14px 0',
                background: loading ? '#555' : 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                border: 'none',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 'clamp(14px, 1.8vw, 16px)',
                cursor: loading ? 'not-allowed' : 'pointer',
                touchAction: 'manipulation',
              }}
            >
              {loading ? '⏳ Checking...' : '✅ LOGIN'}
            </button>
            <div
              onClick={() => setRefMode(true)}
              style={{ textAlign: 'center', marginTop: 16, color: '#555', fontSize: 11, cursor: 'pointer', userSelect: 'none' }}
            >
              · · ·
            </div>
          </form>
        ) : (
          <form onSubmit={handleRefLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ color: '#aaa', fontSize: 'clamp(11px, 1.2vw, 12px)', display: 'block', marginBottom: 5 }}>
                Referee Token
              </label>
              <input
                type="password"
                value={refToken}
                onChange={e => setRefToken(e.target.value)}
                placeholder="Enter referee password"
                style={inputStyle}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={refLoading}
              style={{
                width: '100%',
                padding: '13px 0',
                background: refLoading ? '#555' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 'clamp(14px, 1.8vw, 16px)',
                cursor: refLoading ? 'not-allowed' : 'pointer',
                touchAction: 'manipulation',
              }}
            >
              {refLoading ? '⏳ Checking...' : '🔑 Login as Referee'}
            </button>
            <div
              onClick={() => setRefMode(false)}
              style={{ textAlign: 'center', marginTop: 12, color: '#555', fontSize: 12, cursor: 'pointer', userSelect: 'none' }}
            >
              ← Back
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [gs, setGs] = useState(null);
  const [refOk, setRefOk] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showReviewOverlay, setShowReviewOverlay] = useState(false);

  // ── HEARTBEAT ──
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (socket && socket.connected && user?.txId) {
        socket.emit('heartbeat', { txId: user.txId });
      }
    }, 10000);
    return () => clearInterval(heartbeatInterval);
  }, [socket, user]);

  // ── SOCKET LISTENERS ──
  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('gameStateUpdate', (data) => { setGs(data); });
    socket.on('refConfirm', (ok) => { if (ok) setRefOk(true); });
    socket.on('loginError', (err) => alert(err.message || 'Login Error'));

    socket.on('deepTacticsState', (data) => {
      if (data && data.deepTactics) {
        setGs(prev => {
          const newState = {
            ...prev,
            deepTactics: data.deepTactics,
            team1Formation: data.team1Formation || prev?.team1Formation || '4-4-2',
            team2Formation: data.team2Formation || prev?.team2Formation || '4-4-2',
            team1Picks: data.team1Picks || prev?.team1Picks || [],
            team2Picks: data.team2Picks || prev?.team2Picks || [],
          };
          return newState;
        });
      }
    });

    socket.on('formationUpdated', ({ team, formation }) => {
      setGs(prev => {
        const newState = { ...prev };
        if (team === 'team1') newState.team1Formation = formation;
        else if (team === 'team2') newState.team2Formation = formation;
        return newState;
      });
    });

    // ── Show/hide review overlay for fans ──
    socket.on('demonstrationControl', ({ hasControl }) => {
      setShowReviewOverlay(hasControl);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameStateUpdate');
      socket.off('refConfirm');
      socket.off('loginError');
      socket.off('deepTacticsState');
      socket.off('formationUpdated');
      socket.off('demonstrationControl');
    };
  }, []);

  // ── Global toggle for Referee to open overlay ──
  useEffect(() => {
    window._toggleDeepTactics = (show) => {
      setShowReviewOverlay(show);
    };
    return () => {
      window._toggleDeepTactics = null;
    };
  }, []);

  if (!connected) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0f0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ fontSize: 32 }}>⏳</div>
        <div style={{ fontSize: 'clamp(14px, 2vw, 16px)' }}>Connecting to server...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  if (user.role === 'referee') {
    return <RefereeDashboard socket={socket} gameState={gs} isReferee={refOk} token={user.token} />;
  }

  // ── FAN VIEW ──
  const isReviewFan = gs?.deepTactics?.firstReviewFan?.txId === user?.txId ||
                      gs?.deepTactics?.secondReviewFan?.txId === user?.txId;
  const reviewRole = gs?.deepTactics?.firstReviewFan?.txId === user?.txId ? 'first' :
                     gs?.deepTactics?.secondReviewFan?.txId === user?.txId ? 'second' : null;

  // Fan should see overlay if:
  // 1. They are a review fan AND (demonstration is live OR showReviewOverlay is true)
  const shouldShowOverlay = isReviewFan && 
    (gs?.deepTactics?.phase === 'LIVE_DEMO' || showReviewOverlay);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
      color: '#fff',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 'clamp(18px, 4vw, 24px)', color: '#FFD700' }}>🧠 DEEP TACTICS</span>
          <span style={{ color: '#aaa', fontSize: 'clamp(10px, 1.2vw, 12px)', marginLeft: 8 }}>Review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {user.isVIP && (
            <span style={{
              background: 'linear-gradient(135deg,#FFD700,#FFA500)',
              color: '#000',
              fontSize: 'clamp(10px, 1vw, 11px)',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 20,
            }}>⭐ VIP</span>
          )}
          <span style={{ color: '#888', fontSize: 'clamp(12px, 1.5vw, 14px)' }}>{user.name}</span>
        </div>
      </div>

      {shouldShowOverlay ? (
        <DeepTacticsReview
          gameState={gs}
          socket={socket}
          user={user}
          onClose={() => setShowReviewOverlay(false)}
          isReferee={false}
          isReviewFan={isReviewFan}
          reviewRole={reviewRole}
        />
      ) : (
        <div style={{
          background: 'rgba(255,215,0,0.1)',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: 10,
          padding: 'clamp(20px, 5vw, 40px)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'clamp(28px, 6vw, 40px)', marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 700, color: '#FFD700' }}>
            Waiting for the Referee
          </div>
          <div style={{ fontSize: 'clamp(12px, 1.5vw, 14px)', color: '#aaa', marginTop: 8 }}>
            {isReviewFan ? 'You are assigned as a reviewer. The demonstration will start soon.' : 'The demonstration has not started yet.'}
          </div>
          <div style={{ fontSize: 'clamp(11px, 1.2vw, 12px)', color: '#555', marginTop: 12 }}>
            Phase: {gs?.deepTactics?.phase || 'IDLE'}
            {gs?.deepTactics?.activeDemonstrator?.name && (
              <span> — Active: {gs.deepTactics.activeDemonstrator.name}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
