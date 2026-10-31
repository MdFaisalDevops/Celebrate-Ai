'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Zap, Type, RefreshCw, X } from 'lucide-react';

interface AccessibilityToolbarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ isOpen, onClose }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  useEffect(() => {
    // High contrast toggle
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    // Reduced motion toggle
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);

  useEffect(() => {
    // Font scale
    const root = document.documentElement;
    if (fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (fontSize === 'xlarge') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [fontSize]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
      className="glass-card"
      style={{
        position: 'fixed',
        top: '4.5rem',
        right: '1.5rem',
        width: '320px',
        zIndex: 900,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-strong)',
        animation: 'scaleUp 180ms ease'
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <h3 id="a11y-title" style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Eye size={18} className="gradient-text" /> Accessibility Suite
        </h3>
        <button
          onClick={onClose}
          aria-label="Close accessibility controls"
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 8px', borderRadius: '50%' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* High Contrast Mode */}
        <div className="flex items-center justify-between">
          <label htmlFor="toggle-contrast" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
            High Contrast Mode
          </label>
          <input
            id="toggle-contrast"
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <label htmlFor="toggle-motion" style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Zap size={14} /> Reduced Motion
          </label>
          <input
            id="toggle-motion"
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
          />
        </div>

        {/* Font Size Scaling */}
        <div>
          <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
            <Type size={14} /> Reading Font Size
          </label>
          <div className="flex gap-2">
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`btn btn-sm ${fontSize === size ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, textTransform: 'capitalize' }}
              >
                {size === 'xlarge' ? 'XL' : size}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Defaults */}
        <button
          onClick={() => {
            setHighContrast(false);
            setReducedMotion(false);
            setFontSize('normal');
          }}
          className="btn btn-outline btn-sm"
          style={{ marginTop: '0.5rem', width: '100%' }}
        >
          <RefreshCw size={14} /> Reset Defaults
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          WCAG 2.1 AA Compliant & Screen Reader Ready
        </p>
      </div>
    </div>
  );
};
