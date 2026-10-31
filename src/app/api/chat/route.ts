import { NextRequest, NextResponse } from 'next/server';
import { getAiChatResponse } from '@/lib/aiPlanner';
import { sanitizeString, checkRateLimit, INPUT_LIMITS } from '@/lib/security';
import { ChatMessage, EventPlan } from '@/types/event';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local-client';
    const rateCheck = checkRateLimit(ip, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a few seconds before sending another message.' },
        { status: 429 }
      );
    }

    let rawBody: { message?: unknown; eventPlan?: unknown; history?: unknown };
    try {
      rawBody = (await req.json()) as { message?: unknown; eventPlan?: unknown; history?: unknown };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json({ error: 'Request body must be a valid JSON object.' }, { status: 400 });
    }

    const { message, eventPlan, history } = rawBody;

    const sanitizedMessage = sanitizeString(message, INPUT_LIMITS.CHAT_MESSAGE);
    if (!sanitizedMessage) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const typedHistory: ChatMessage[] = Array.isArray(history) ? (history as ChatMessage[]) : [];
    const typedPlan: EventPlan | null =
      eventPlan && typeof eventPlan === 'object' && 'id' in eventPlan
        ? (eventPlan as EventPlan)
        : null;

    const aiResult = await getAiChatResponse(sanitizedMessage, typedPlan, typedHistory);

    return NextResponse.json({
      success: true,
      reply: aiResult.reply,
      suggestions: aiResult.suggestions
    });
  } catch (err: unknown) {
    console.error('API /api/chat error:', err);
    return NextResponse.json({ error: 'Failed to process chat consultation' }, { status: 500 });
  }
}
