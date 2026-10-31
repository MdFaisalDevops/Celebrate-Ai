import { describe, it, expect } from 'vitest';
import { POST as planRoute } from '@/app/api/plan/route';
import { POST as chatRoute } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

function createJsonRequest(url: string, body: unknown, ip = 'test-unit-ip'): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

describe('API Route Handlers Suite', () => {
  it('POST /api/plan generates a valid plan with correct status 200', async () => {
    const req = createJsonRequest('http://localhost:3000/api/plan', {
      eventType: 'wedding',
      title: 'Harbor Sunset Wedding',
      guestCount: 80,
      totalBudget: 28000,
      currency: 'USD',
      location: 'San Diego Harbor',
      targetDate: '2026-11-12',
      themeVibe: 'Nautical Sunset Chic',
      topPriority: 'Catering & Open Bar',
    }, 'plan-client-1');

    const res = await planRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.plan).toBeDefined();
    expect(data.plan.title).toBe('Harbor Sunset Wedding');
    expect(data.plan.guestCount).toBe(80);
    expect(data.plan.totalBudget).toBe(28000);
  });

  it('POST /api/plan handles bounds checking and defaults safely', async () => {
    const req = createJsonRequest('http://localhost:3000/api/plan', {
      eventType: 'invalid_type',
      guestCount: -50,
      totalBudget: 10,
    }, 'plan-client-2');

    const res = await planRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    // Should default eventType to wedding and clamp guest count / budget to minimum bounds
    expect(data.plan.eventType).toBe('wedding');
    expect(data.plan.guestCount).toBe(1);
    expect(data.plan.totalBudget).toBe(100);
  });

  it('POST /api/chat rejects empty messages with 400 Bad Request', async () => {
    const req = createJsonRequest('http://localhost:3000/api/chat', {
      message: '   ',
    }, 'chat-client-1');

    const res = await chatRoute(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain('Message cannot be empty');
  });

  it('POST /api/chat successfully responds to event planning questions', async () => {
    const req = createJsonRequest('http://localhost:3000/api/chat', {
      message: 'What are the top 3 ways to save on floral decor?',
    }, 'chat-client-2');

    const res = await chatRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.reply).toBeTruthy();
    expect(Array.isArray(data.suggestions)).toBe(true);
    expect(data.suggestions.length).toBeGreaterThan(0);
  });
});

