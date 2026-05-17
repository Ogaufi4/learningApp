import { NextRequest, NextResponse } from "next/server";
import {
  applyHumanAction,
  createInitialState,
  type MorrisState,
} from "@/lib/games/twelve-mens-morris";
import { sql } from "@/lib/server/db";

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

async function getRoom(roomCode: string) {
  await ensureMorrisRoomsTable();

  const rows = await sql`
    select room_code, host_name, guest_name, game_state, updated_at
    from morris_rooms
    where room_code = ${roomCode}
    limit 1
  `;

  return rows[0] as
    | {
        room_code: string;
        host_name: string;
        guest_name: string | null;
        game_state: MorrisState;
        updated_at: string;
      }
    | undefined;
}

function serializeRoom(room: NonNullable<Awaited<ReturnType<typeof getRoom>>>) {
  return {
    roomCode: room.room_code,
    hostName: room.host_name,
    guestName: room.guest_name ?? "",
    state: room.game_state,
    updatedAt: room.updated_at,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ roomCode: string }> },
) {
  const { roomCode } = await context.params;
  const room = await getRoom(roomCode.toUpperCase());

  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  return NextResponse.json({ room: serializeRoom(room) });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ roomCode: string }> },
) {
  const { roomCode } = await context.params;
  const normalizedRoomCode = roomCode.toUpperCase();
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const playerName = String(body.playerName ?? "").trim();
  const playerNumber = Number(body.playerNumber ?? 0) as 1 | 2;
  const point = Number(body.point ?? -1);

  const room = await getRoom(normalizedRoomCode);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  if (action === "join") {
    if (!playerName) {
      return NextResponse.json({ error: "Player name is required." }, { status: 400 });
    }

    if (!room.guest_name) {
      await sql`
        update morris_rooms
        set guest_name = ${playerName}, updated_at = now()
        where room_code = ${normalizedRoomCode}
      `;

      const updatedRoom = await getRoom(normalizedRoomCode);
      return NextResponse.json({
        playerNumber: 2,
        room: serializeRoom(updatedRoom!),
      });
    }

    if (room.host_name === playerName) {
      return NextResponse.json({
        playerNumber: 1,
        room: serializeRoom(room),
      });
    }

    if (room.guest_name === playerName) {
      return NextResponse.json({
        playerNumber: 2,
        room: serializeRoom(room),
      });
    }

    return NextResponse.json({ error: "Room already has two players." }, { status: 409 });
  }

  if (action === "restart") {
    const state = createInitialState();
    await sql`
      update morris_rooms
      set game_state = ${JSON.stringify(state)}::jsonb, updated_at = now()
      where room_code = ${normalizedRoomCode}
    `;

    const updatedRoom = await getRoom(normalizedRoomCode);
    return NextResponse.json({ room: serializeRoom(updatedRoom!) });
  }

  if (action === "move") {
    if (playerNumber !== 1 && playerNumber !== 2) {
      return NextResponse.json({ error: "Valid player number is required." }, { status: 400 });
    }

    const currentState = room.game_state;
    if (!room.guest_name) {
      return NextResponse.json({ error: "Waiting for another player to join." }, { status: 409 });
    }

    if (currentState.currentPlayer !== playerNumber) {
      return NextResponse.json({ error: "It is not your turn." }, { status: 409 });
    }

    const result = applyHumanAction(currentState, point);
    if (!result.changed) {
      return NextResponse.json({ error: "That move is not valid right now." }, { status: 409 });
    }

    await sql`
      update morris_rooms
      set game_state = ${JSON.stringify(result.nextState)}::jsonb, updated_at = now()
      where room_code = ${normalizedRoomCode}
    `;

    const updatedRoom = await getRoom(normalizedRoomCode);
    return NextResponse.json({ room: serializeRoom(updatedRoom!) });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
