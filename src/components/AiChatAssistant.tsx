'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Copy,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { EventPlan, ChatMessage } from '@/types/event';

interface AiChatAssistantProps {
  plan: EventPlan;
}

/** Duration in ms before the "Copied" indicator resets. */
const COPY_RESET_DELAY = 1800;

/** Builds the initial welcome message for the chat session. */
function buildWelcomeMessage(plan: EventPlan): ChatMessage {
  return {
    id: 'welcome-1',
    role: 'assistant',
    content: `Hello! I'm your CelebrateAI Concierge. I have full context on **${plan.title}** (${plan.guestCount} guests, ${plan.totalBudget.toLocaleString()} ${plan.currency}). How can I help you optimize your celebration today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'How can I save 15% on catering?',
      'Draft a vendor negotiation email',
      'Suggest 3 unique guest icebreaker games',
      'Review my day-of timeline flow',
    ],
  };
}

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ plan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([buildWelcomeMessage(plan)]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          eventPlan: plan,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI response');
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Here are some ideas for your celebration.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || ['Budget optimization tips', 'Vendor negotiation email'],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I am here to help you design, budget, and organize every detail of your celebration! Try asking about cost savings, vendor tips, or creative guest activities.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['How to cut catering costs', 'Vendor negotiation script', 'Unique icebreakers'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, plan, messages]);

  const copyMessage = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), COPY_RESET_DELAY);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Chat history refreshed! How can I assist with **${plan.title}** right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'How can I save 15% on catering?',
          'Draft a vendor negotiation email',
          'Suggest 3 unique guest icebreaker games',
        ],
      },
    ]);
  }, [plan.title]);

  return (
    <div className="chat-drawer no-print" role="region" aria-label="AI Assistant Chat">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-trigger-btn"
          aria-label="Open AI Event Assistant Chat"
          title="Open AI Event Assistant"
        >
          <Sparkles size={26} />
        </button>
      )}

      {/* Slide-out Chat Panel */}
      {isOpen && (
        <div className="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title">
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'rgba(10, 11, 18, 0.95)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="logo-icon" style={{ width: '28px', height: '28px' }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <div>
                <h3 id="chat-title" style={{ fontSize: '0.95rem', margin: 0 }}>
                  CelebrateAI Co-Planner
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Active Context Aware
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 6px', borderRadius: '50%' }}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 6px', borderRadius: '50%' }}
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    maxWidth: '88%',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: msg.role === 'user' ? 'var(--accent-purple)' : 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {msg.role === 'user' ? <User size={13} /> : <Bot size={13} color="var(--accent-cyan)" />}
                  </div>

                  <div
                    style={{
                      background: msg.role === 'user' ? 'var(--accent-purple)' : 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}

                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between" style={{ marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {msg.timestamp}
                        </span>
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.68rem',
                          }}
                          aria-label="Copy response"
                        >
                          {copiedId === msg.id ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                          {copiedId === msg.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Follow-up suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div
                    className="flex flex-col gap-1"
                    style={{ marginTop: '0.5rem', marginLeft: '2rem', maxWidth: '85%' }}
                  >
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.3rem 0.65rem',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        ⚡ {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.5rem' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>CelebrateAI is formulating advice...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(14, 16, 30, 0.95)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about this event..."
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
              disabled={loading}
              maxLength={800}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-md)', padding: '0 0.85rem' }}
              disabled={loading || !input.trim()}
              aria-label="Send message to AI assistant"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
