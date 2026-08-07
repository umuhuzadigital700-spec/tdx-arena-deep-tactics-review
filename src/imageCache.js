// src/imageCache.js - Smart Image Caching
// This stores images locally so they don't depend on Discord staying online

import React, { useState, useEffect } from 'react';

export const imageCache = {
  cache: new Map(),
  
  // Save an image URL to local storage
  saveImage(key, imageData) {
    try {
      localStorage.setItem(`img_${key}`, imageData);
      this.cache.set(key, imageData);
    } catch (e) {
      console.warn('Failed to cache image:', e);
    }
  },
  
  // Get image from cache
  getImage(key) {
    try {
      // Check memory cache first
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      // Check localStorage
      const stored = localStorage.getItem(`img_${key}`);
      if (stored) {
        this.cache.set(key, stored);
        return stored;
      }
      return null;
    } catch (e) {
      return null;
    }
  },
  
  // Clear all cached images (for "hard reset purge")
  clearAll() {
    this.cache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('img_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
    console.log('🗑️ All cached images cleared');
  },
  
  // ── ADDITIVE: CLEAR A SINGLE IMAGE FROM CACHE ──
  clearSingle(key) {
    try {
      this.cache.delete(key);
      localStorage.removeItem(`img_${key}`);
      console.log(`🗑️ Cache cleared for: ${key}`);
      return true;
    } catch (e) {
      console.warn('Failed to clear single cache:', e);
      return false;
    }
  },
  
  // ── ADDITIVE: FETCH AND CACHE WITH FORCE REFRESH ──
  async fetchAndCache(key, url, forceRefresh = false) {
    try {
      // If force refresh, clear existing cache first
      if (forceRefresh) {
        this.clearSingle(key);
      }
      
      // Check cache if not forcing refresh
      if (!forceRefresh) {
        const cached = this.getImage(key);
        if (cached) {
          return cached;
        }
      }
      
      // If it's already a data URL, save it directly
      if (url && url.startsWith('data:')) {
        this.saveImage(key, url);
        return url;
      }
      
      // Add cache-busting parameter to prevent CDN caching
      const cacheBuster = `t=${Date.now()}`;
      const urlWithCacheBuster = url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
      
      // Fetch the image
      const response = await fetch(urlWithCacheBuster, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const dataUrl = reader.result;
          this.saveImage(key, dataUrl);
          resolve(dataUrl);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed to fetch image:', e);
      return this.getImage(key) || url;
    }
  }
};

// ── CACHED IMAGE COMPONENT ──
export function CachedImage({ imageKey, src, alt, style, className, onError, forceRefresh = false }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadImage = async () => {
      // If forceRefresh is true, clear cache first
      if (forceRefresh) {
        imageCache.clearSingle(imageKey);
      }
      
      const cached = imageCache.getImage(imageKey);
      if (cached && !forceRefresh) {
        setImageSrc(cached);
        setLoading(false);
        return;
      }
      
      if (src) {
        const dataUrl = await imageCache.fetchAndCache(imageKey, src, forceRefresh);
        if (dataUrl) {
          setImageSrc(dataUrl);
        }
        setLoading(false);
      }
    };
    
    loadImage();
  }, [imageKey, src, forceRefresh]);
  
  if (loading) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        color: '#555',
        fontSize: 12
      }}>
        ⏳ Loading...
      </div>
    );
  }
  
  return (
    <img
      src={imageSrc || src}
      alt={alt || 'Cached image'}
      style={style}
      className={className}
      onError={(e) => {
        if (onError) onError(e);
        const cached = imageCache.getImage(imageKey);
        if (cached && cached !== imageSrc) {
          setImageSrc(cached);
        }
      }}
    />
  );
}
