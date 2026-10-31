'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Music,
  Copy,
  Check,
  HeartHandshake,
  Lightbulb,
  Camera
} from 'lucide-react';
import { EventPlan } from '@/types/event';

interface IdeasMoodboardProps {
  plan: EventPlan;
}

export const IdeasMoodboard: React.FC<IdeasMoodboardProps> = ({ plan }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <section aria-labelledby="ideas-heading" className="flex flex-col gap-6">
      {/* Atmosphere Concept Header Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
          <div className="logo-icon" style={{ background: 'var(--gradient-brand)' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <h2 id="ideas-heading" style={{ fontSize: '1.4rem' }}>
              {plan.personalizedIdeas.themeConcept}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Aesthetic Direction, Curated Soundtrack & Atmosphere Styling
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {plan.vibeDescription}
        </p>
      </div>

      {/* Color Palette Grid */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Palette className="gradient-text" size={20} /> Curated Harmonic Color Swatches
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Click any color block to copy hex code for invitations, floral orders, or linens.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {plan.colorPalette.map((color, idx) => (
            <button
              key={idx}
              onClick={() => copyHex(color.hex)}
              className="glass-card"
              style={{
                padding: '0.65rem',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform var(--trans-fast)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              title={`Click to copy ${color.hex}`}
            >
              <div
                style={{
                  width: '100%',
                  height: '54px',
                  borderRadius: 'var(--radius-md)',
                  background: color.hex,
                  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {copiedHex === color.hex && (
                  <span style={{ background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                    Copied!
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {color.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {color.hex}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Section: Creative Highlights & Playlist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* Creative Highlights */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lightbulb className="gradient-text" size={20} /> Signature Experience Highlights
          </h3>
          <div className="flex flex-col gap-3">
            {plan.personalizedIdeas.creativeHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span className="badge badge-purple" style={{ marginTop: '2px' }}>
                  {idx + 1}
                </span>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {highlight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Curated Playlist Vibe */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Music className="gradient-text" size={20} /> Sound & Music Atmosphere
          </h3>
          <div className="flex flex-col gap-2">
            {plan.personalizedIdeas.curatedPlaylistVibe.map((track, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'var(--gradient-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Music size={14} color="#fff" />
                </div>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {track}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GenAI Invitation Prompt Generator Card */}
      <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: '0.75rem' }}>
          <div className="flex items-center gap-2">
            <Camera size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.15rem' }}>GenAI Art Prompt for Invitations & Decor Mockups</h3>
          </div>
          <button
            onClick={() => copyPrompt(plan.personalizedIdeas.aiPromptForInvitations)}
            className="btn btn-secondary btn-sm"
          >
            {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
            {copiedPrompt ? 'Copied Prompt!' : 'Copy AI Prompt'}
          </button>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Use this curated prompt in Google Imagen, Midjourney, or DALL-E to generate stunning visual stationary or backdrop renders:
        </p>
        <div
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#67e8f9',
            lineHeight: '1.5',
          }}
        >
          {plan.personalizedIdeas.aiPromptForInvitations}
        </div>
      </div>

      {/* Accessibility & Dietary Inclusivity Card */}
      {(plan.specialRequirements || plan.dietaryRestrictions || plan.accessibilityNeeds) && (
        <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <HeartHandshake size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem' }}>Inclusivity & Special Accommodations</h3>
          </div>
          <div className="flex flex-col gap-2" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            {plan.specialRequirements && (
              <p><strong>Special Requirements:</strong> {plan.specialRequirements}</p>
            )}
            {plan.dietaryRestrictions && (
              <p><strong>Dietary Accommodations:</strong> {plan.dietaryRestrictions}</p>
            )}
            {plan.accessibilityNeeds && (
              <p><strong>Accessibility Planning:</strong> {plan.accessibilityNeeds}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
