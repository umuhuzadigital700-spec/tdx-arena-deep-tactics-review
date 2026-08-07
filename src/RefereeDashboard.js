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
  metaText: { fontSize: '0.85rem', color: '#aaa', margin: '4px 0' },
  buttonGold: { padding: '10px 16px', background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000', border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2
