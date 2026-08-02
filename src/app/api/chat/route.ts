import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";
import { buildSystemPrompt } from "@/lib/chat-prompt";
import { query } from "@/lib/db";

const MODEL = process.env.CHAT_MODEL || "claude-opus-5";
const MAX_HISTORY = 10;

type ChatTurn = { role: "user" | "assistant"; content: string };

function isChatTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (v.role === "user" || v.role === "assistant") && typeof v.content === "string";
}

async function logMessages(sessionId: string, turns: ChatTurn[]) {
  try {
    for (const turn of turns) {
      await query(`INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)`, [
        sessionId,
        turn.role,
        turn.content,
      ]);
    }
  } catch (error) {
    console.error("Failed to log chat messages:", error);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" && body.sessionId.length <= 64 ? body.sessionId : randomUUID();
  const history: ChatTurn[] = Array.isArray(body.history)
    ? body.history.filter(isChatTurn).slice(-MAX_HISTORY)
    : [];

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The chat assistant isn't configured yet. Set ANTHROPIC_API_KEY in the environment." },
      { status: 503 }
    );
  }

  const client = new Anthropic();

  let reply: string;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      thinking: { type: "disabled" },
      output_config: { effort: "low" },
      system: buildSystemPrompt(),
      messages: [
        ...history.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: "user" as const, content: message },
      ],
    });

    if (response.stop_reason === "refusal") {
      reply = `I'm not able to help with that. For anything about our services, feel free to message us directly on WhatsApp.`;
    } else {
      const textBlock = response.content.find((block) => block.type === "text");
      reply = textBlock && textBlock.type === "text" ? textBlock.text : "Sorry, I didn't quite catch that — could you rephrase?";
    }
  } catch (error) {
    console.error("Chat request failed:", error);
    return NextResponse.json(
      { error: "The chat assistant is temporarily unavailable. Please message us on WhatsApp instead." },
      { status: 502 }
    );
  }

  void logMessages(sessionId, [
    { role: "user", content: message },
    { role: "assistant", content: reply },
  ]);

  return NextResponse.json({ reply, sessionId });
}
