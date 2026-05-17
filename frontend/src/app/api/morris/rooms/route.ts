import { NextRequest, NextResponse } from "next/server";
import { createInitialState } from "@/lib/games/twelve-mens-morris";
import { sql } from "@/lib/server/db";

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function ensureMorrisRoomsTable() {
  await sql`
    create table if not exists morris_rooms (
      room_code varchar(6) primary key,
      host_name varchar not null,
      guest_name varchar,
      game_state jsonb not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    )
  `;
}

function generateRoomCode() {
  return Array.from({ length: 6 }, () => {
    const index = Math.floor(Math.random() * ROOM_CODE_ALPHABET.length);
    return ROOM_CODE_ALPHABET[index];
  }).join("");
}

export async function POST(request: NextRequest) {
  await ensureMorrisRoomsTable();

  const body = await request.json().catch(() => ({}));
  const playerName = String(body.playerName ?? "").trim();

  if (!playerName) {
    return NextResponse.json({ error: "Player name is required." }, { status: 400 });
  }

  let roomCode = generateRoomCode();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const existing = await sql`
      select room_code
      from morris_rooms
      where room_code = ${roomCode}
      limit 1
    `;

    if (!existing[0]) {
      break;
    }

    roomCode = generateRoomCode();
  }

  const state = createInitialState();

  await sql`
    insert into morris_rooms (room_code, host_name, game_state)
    values (${roomCode}, ${playerName}, ${JSON.stringify(state)}::jsonb)
  `;

  return NextResponse.json({
    roomCode,
    playerNumber: 1,
    playerName,
    room: {
      roomCode,
      hostName: playerName,
      guestName: "",
      state,
    },
  });
}
