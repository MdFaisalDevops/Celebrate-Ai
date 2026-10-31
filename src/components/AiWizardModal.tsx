'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CalendarHeart,
  Cake,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { EventPlan, EventType, WizardAnswers } from '@/types/event';

interface AiWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: EventPlan) => void;
}

export const AiWizardModal: React.FC<AiWizardModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('Consulting AI Event Knowledge Base...');
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [guestCount, setGuestCount] = useState(100);
  const [totalBudget, setTotalBudget] = useState(25000);
  const [currency, setCurrency] = useState('USD');
  const [location, setLocation] = useState('San Francisco Bay Area, CA');
  const [targetDate, setTargetDate] = useState('2026-10-24');
  const [themeVibe, setThemeVibe] = useState('Modern Romantic Garden');
  const [topPriority, setTopPriority] = useState('Guest Experience & Catering');
  const [specialNotes, setSpecialNotes] = useState('');

  if (!isOpen) return null;

  // Preset themes based on event type
  const themePresets: Record<EventType, string[]> = {
    wedding: [
      'Modern Romantic Garden',
      'Coastal Sage & Terracotta',
      'Moody Black Tie Elegance',
      'Boho Meadow & Pampas Grass',
      'Art Deco Great Gatsby'
    ],
    birthday: [
      'Synthwave 80s Neon Arcade',
      'Golden Glamour 30th/40th/50th',
      'Tropical Sunset Havana Nights',
      'Secret Speakeasy Lounge',
      'Y2K Glitz & Retro Beats'
    ],
    community: [
      'Harvest & Unity Local Fair',
      'Eco-Friendly Green Park Fest',
      'Tech & Innovation Hackathon/Expo',
      'Multicultural Street Food Fair',
      'Neighborhood Block Party & 5K'
    ],
  };

  const priorityOptions = [
    'Unforgettable Catering & Bar',
    'High-Energy Live Music & DJ',
    'Cinematic Photography & Film',
    'Stunning Atmospheric Decor & Florals',
    'Inclusive Community Connection & Activities',
  ];

  const handleNext = () => {
    if (step === 2 && !title.trim()) {
      setTitle(
        eventType === 'wedding'
          ? 'Dream Celebration'
          : eventType === 'birthday'
          ? 'Milestone Birthday Bash'
          : 'Community Unity Festival'
      );
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#06b6d4', '#f59e0b'],
      });
    } catch {
      // Ignore if reduced motion or canvas blocked
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const answers: WizardAnswers = {
      eventType,
      title: title.trim() || `${eventType.toUpperCase()} Celebration`,
      guestCount,
      totalBudget,
      currency,
      location: location.trim() || 'Scenic Venue',
      targetDate: targetDate || '2026-10-24',
      themeVibe: themeVibe.trim() || 'Chic & Memorable',
      topPriority,
      specialNotes: specialNotes.trim(),
    };

    try {
      setLoadingPhase('Synthesizing guest count dynamics and venue requirements...');
      await new Promise((r) => setTimeout(r, 400));

      setLoadingPhase('Optimizing mathematical budget allocation across vendors...');
      await new Promise((r) => setTimeout(r, 400));

      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to synthesize plan');
      }

      setLoadingPhase('Polishing timeline milestones & personalized GenAI ideas...');
      await new Promise((r) => setTimeout(r, 300));

      triggerCelebration();
      onPlanGenerated(data.plan);
      onClose();
    } catch (err: unknown) {
      console.error('Wizard error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-heading"
    >
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div className="flex items-center gap-2">
            <div className="logo-icon" style={{ width: '28px', height: '28px' }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <h2 id="wizard-heading" style={{ fontSize: '1.3rem' }}>
                AI Event Consultation
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Step {step} of 5 — {step === 1 ? 'Event Category' : step === 2 ? 'Details & Scale' : step === 3 ? 'Budget Allocation' : step === 4 ? 'Aesthetic & Vibe' : 'Priorities & Needs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close wizard"
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 10px', borderRadius: '50%' }}
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${(step / 5) * 100}%`,
              background: 'var(--gradient-brand)',
              transition: 'width var(--trans-base)'
            }}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#fda4af',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4" style={{ padding: '3.5rem 1rem' }}>
            <Loader2 size={42} className="gradient-text" style={{ animation: 'spin 1.2s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
                Synthesizing Your Bespoke Plan...
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {loadingPhase}
              </p>
            </div>
            <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="#10b981" /> Guardrails verified & rate-limit safe
            </div>
          </div>
        ) : (
          <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {/* Step 1: Event Type */}
            {step === 1 && (
              <div className="flex flex-col gap-3">
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  What type of celebration are we bringing to life?
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => { setEventType('wedding'); handleNext(); }}
                    className={`glass-card ${eventType === 'wedding' ? 'active-border' : ''}`}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: eventType === 'wedding' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      padding: '1.2rem 1rem'
                    }}
                  >
                    <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #f43f5e, #a855f7)', marginBottom: '0.75rem' }}>
                      <CalendarHeart size={18} color="#fff" />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>Wedding</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Ceremonies, receptions, rehearsal dinners & run of show.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEventType('birthday'); handleNext(); }}
                    className={`glass-card ${eventType === 'birthday' ? 'active-border' : ''}`}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: eventType === 'birthday' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      padding: '1.2rem 1rem'
                    }}
                  >
                    <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)', marginBottom: '0.75rem' }}>
                      <Cake size={18} color="#fff" />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>Milestone Birthday</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Sweet 16, 21st, 30th, 50th, rooftop lounges & themed bashes.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEventType('community'); handleNext(); }}
                    className={`glass-card ${eventType === 'community' ? 'active-border' : ''}`}
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: eventType === 'community' ? '2px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                      padding: '1.2rem 1rem'
                    }}
                  >
                    <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', marginBottom: '0.75rem' }}>
                      <Users size={18} color="#fff" />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>Community Event</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Charity galas, street festivals, 5Ks & cultural fairs.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Scale & Location */}
            {step === 2 && (
              <div className="flex flex-col gap-3">
                <div className="form-group">
                  <label htmlFor="input-title" className="form-label">
                    Celebration Name / Couple / Honoree
                  </label>
                  <input
                    id="input-title"
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      eventType === 'wedding'
                        ? 'e.g. Maya & Liam’s Sunlit Vineyard Wedding'
                        : eventType === 'birthday'
                        ? 'e.g. Jordan’s 40th Speakeasy Soirée'
                        : 'e.g. Oakridge Summer Arts & Unity Festival'
                    }
                    maxLength={100}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="input-location" className="form-label">
                      <MapPin size={14} /> City or Venue Style
                    </label>
                    <input
                      id="input-location"
                      type="text"
                      className="form-input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Austin, TX (Rooftop / Park)"
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="input-date" className="form-label">
                      <Calendar size={14} /> Target Date
                    </label>
                    <input
                      id="input-date"
                      type="date"
                      className="form-input"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-guests" className="form-label">
                      <Users size={14} /> Estimated Guest Count: <span className="gradient-text">{guestCount}</span>
                    </label>
                  </div>
                  <input
                    id="input-guests"
                    type="range"
                    min="10"
                    max="1000"
                    step="5"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
                  />
                  <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Intimate (10)</span>
                    <span>Mid-size (150)</span>
                    <span>Grand Festival (1000)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Budget & Currency */}
            {step === 3 && (
              <div className="flex flex-col gap-3">
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label htmlFor="currency-select" className="form-label">
                      Currency
                    </label>
                    <select
                      id="currency-select"
                      className="form-select"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="budget-input" className="form-label">
                      <DollarSign size={14} /> Total Target Budget
                    </label>
                    <input
                      id="budget-input"
                      type="number"
                      className="form-input"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(Number(e.target.value))}
                      min="500"
                      max="10000000"
                      step="500"
                    />
                  </div>
                </div>

                {/* Quick Budget Tags */}
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                    Quick Budget Presets:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[5000, 15000, 30000, 50000, 85000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTotalBudget(val)}
                        className={`btn btn-sm ${totalBudget === val ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {currency} {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '0.85rem', marginTop: '0.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} color="#06b6d4" />
                    CelebrateAI automatically calculates recommended category splits and reserves a 5% contingency buffer!
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Theme & Vibe */}
            {step === 4 && (
              <div className="flex flex-col gap-3">
                <div className="form-group">
                  <label htmlFor="theme-input" className="form-label">
                    Atmosphere & Design Theme
                  </label>
                  <input
                    id="theme-input"
                    type="text"
                    className="form-input"
                    value={themeVibe}
                    onChange={(e) => setThemeVibe(e.target.value)}
                    placeholder="e.g. Modern Sunset Minimalist"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>
                    Popular Vibe Presets for {eventType}:
                  </label>
                  <div className="flex flex-col gap-2">
                    {themePresets[eventType].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setThemeVibe(preset)}
                        className={`btn btn-sm ${themeVibe === preset ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ justifyContent: 'flex-start' }}
                      >
                        <Sparkles size={14} /> {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Priorities & Special Inclusions */}
            {step === 5 && (
              <div className="flex flex-col gap-3">
                <div className="form-group">
                  <label htmlFor="priority-select" className="form-label">
                    Top Priority Focus
                  </label>
                  <select
                    id="priority-select"
                    className="form-select"
                    value={topPriority}
                    onChange={(e) => setTopPriority(e.target.value)}
                  >
                    {priorityOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="special-notes" className="form-label">
                    Special Dietary, Accessibility or Sound Requirements
                  </label>
                  <textarea
                    id="special-notes"
                    className="form-textarea"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g., Wheelchair ramp needed for stage, 15 vegan meals, city 10 PM sound curfew, kid-friendly craft zone..."
                    maxLength={500}
                  />
                </div>

                <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                  <p style={{ fontSize: '0.82rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HeartHandshake size={16} /> Ready to generate your complete blueprint with timeline, budget breakdown, vendor CRM & GenAI creative ideas!
                  </p>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex items-center justify-between" style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary btn-sm"
                  aria-label="Previous step"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary btn-sm"
                  aria-label="Next step"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ background: 'var(--gradient-brand)', padding: '0.65rem 1.4rem' }}
                  aria-label="Generate complete event blueprint"
                >
                  <Sparkles size={16} /> Generate Blueprint
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
