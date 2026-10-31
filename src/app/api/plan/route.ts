import { NextRequest, NextResponse } from 'next/server';
import { generateEventPlan } from '@/lib/aiPlanner';
import { WizardAnswers } from '@/types/event';
import { sanitizeString, checkRateLimit, INPUT_LIMITS } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting defense
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(ip, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before generating another plan.' },
        { status: 429 }
      );
    }

    let rawBody: Record<string, unknown>;
    try {
      rawBody = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ error: 'Request body must be a valid JSON object.' }, { status: 400 });
    }

    // Security sanitization and bounds checking
    const answers: WizardAnswers = {
      eventType: typeof rawBody.eventType === 'string' && ['wedding', 'birthday', 'community'].includes(rawBody.eventType)
        ? (rawBody.eventType as WizardAnswers['eventType'])
        : 'wedding',
      title: sanitizeString(rawBody.title || '', INPUT_LIMITS.TITLE) || 'Celebration Event',
      guestCount: Math.min(Math.max(Number(rawBody.guestCount) || 50, 1), 10000),
      totalBudget: Math.min(Math.max(Number(rawBody.totalBudget) || 10000, 100), 10000000),
      currency: sanitizeString(rawBody.currency || 'USD', 5) || 'USD',
      location: sanitizeString(rawBody.location || '', INPUT_LIMITS.LOCATION) || 'Local Venue',
      targetDate: sanitizeString(rawBody.targetDate || '', 20) || '2026-10-24',
      themeVibe: sanitizeString(rawBody.themeVibe || '', INPUT_LIMITS.THEME) || 'Elegant Celebration',
      topPriority: sanitizeString(rawBody.topPriority || '', INPUT_LIMITS.PRIORITY) || 'Guest Experience',
      specialNotes: sanitizeString(rawBody.specialNotes || '', INPUT_LIMITS.SPECIAL_NOTES),
    };

    const plan = await generateEventPlan(answers);

    return NextResponse.json({ success: true, plan });
  } catch (err: unknown) {
    console.error('API /api/plan error:', err);
    const message = err instanceof Error ? err.message : 'Failed to generate event plan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
