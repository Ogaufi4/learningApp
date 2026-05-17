"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Copy,
  Gamepad2,
  RotateCcw,
  Sparkles,
  Swords,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSharedAudioContext } from "@/lib/audio";
import {
  BOARD_POINTS,
  CONNECTIONS,
  applyHumanAction,
  createInitialState,
  getLegalMoves,
  getRemovablePoints,
  type MorrisState,
} from "@/lib/games/twelve-mens-morris";

type PlayMode = "local" | "multiplayer";

type RoomSnapshot = {
  roomCode: string;
  hostName: string;
  guestName: string;
  state: MorrisState;
  updatedAt: number;
};

type RoomSession = {
  roomCode: string;
  playerNumber: 1 | 2;
  playerName: string;
};

const ROOM_STORAGE_PREFIX = "morris-room-";
const ROOM_SESSION_STORAGE_KEY = "morris-room-session";

function playTone(enabled: boolean, frequency: number, duration = 0.12) {
  if (!enabled || typeof window === "undefined") {
    return;
  }

  const context = getSharedAudioContext();
  if (!context) {
    return;
  }
  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.03;
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function getRoomStorageKey(roomCode: string) {
  return `${ROOM_STORAGE_PREFIX}${roomCode.toUpperCase()}`;
}

function readRoom(roomCode: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getRoomStorageKey(roomCode));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as RoomSnapshot;
  } catch {
    return null;
  }
}

function writeRoom(room: RoomSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  const nextRoom = {
    ...room,
    roomCode: room.roomCode.toUpperCase(),
    updatedAt: Date.now(),
  };

  window.localStorage.setItem(getRoomStorageKey(nextRoom.roomCode), JSON.stringify(nextRoom));
}

function readRoomSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(ROOM_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as RoomSession;
  } catch {
    return null;
  }
}

function writeRoomSession(session: RoomSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.sessionStorage.removeItem(ROOM_SESSION_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(ROOM_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function TwelveMensMorrisGame() {
  const [soundOn, setSoundOn] = useState(true);
  const [playMode, setPlayMode] = useState<PlayMode>("local");
  const [state, setState] = useState<MorrisState>(() => createInitialState());
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [roomSession, setRoomSession] = useState<RoomSession | null>(null);
  const [roomSnapshot, setRoomSnapshot] = useState<RoomSnapshot | null>(null);
  const [statusMessage, setStatusMessage] = useState("Choose local play or create a private multiplayer room.");

  const highlightedPoints = useMemo(() => {
    if (state.removingPiece) {
      return getRemovablePoints(state.board, state.currentPlayer === 1 ? 2 : 1);
    }
    if (state.phase === "movement" && state.selectedPoint !== null) {
      return getLegalMoves(state, state.selectedPoint);
    }
    return state.board
      .map((piece, index) => ({ piece, index }))
      .filter(({ piece }) => (state.phase === "placement" ? piece === 0 : piece === state.currentPlayer))
      .map(({ index }) => index);
  }, [state]);

  const isInRoom = playMode === "multiplayer" && roomSession && roomSnapshot;
  const yourPlayerNumber = roomSession?.playerNumber ?? null;
  const isYourTurn = !isInRoom || state.currentPlayer === yourPlayerNumber;
  const multiplayerInviteLink =
    typeof window !== "undefined" && roomSession
      ? `${window.location.origin}${window.location.pathname}?room=${roomSession.roomCode}`
      : "";

  useEffect(() => {
    const existingSession = readRoomSession();
    if (!existingSession) {
      return;
    }

    const room = readRoom(existingSession.roomCode);
    if (!room) {
      writeRoomSession(null);
      return;
    }

    setPlayMode("multiplayer");
    setRoomSession(existingSession);
    setRoomSnapshot(room);
    setState(room.state);
    setPlayerNameInput(existingSession.playerName);
    setRoomCodeInput(existingSession.roomCode);
    setStatusMessage(
      room.guestName
        ? `${room.hostName} and ${room.guestName} are connected in room ${room.roomCode}.`
        : `Room ${room.roomCode} is waiting for a second player.`,
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (!roomFromUrl) {
      return;
    }

    setPlayMode("multiplayer");
    setRoomCodeInput(roomFromUrl.toUpperCase());
    setStatusMessage(`Invite detected for room ${roomFromUrl.toUpperCase()}. Enter your name and tap Join Room.`);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncRoom = (nextRoom: RoomSnapshot | null) => {
      if (!roomSession || !nextRoom || nextRoom.roomCode !== roomSession.roomCode) {
        return;
      }

      setRoomSnapshot(nextRoom);
      setState(nextRoom.state);
      setStatusMessage(
        nextRoom.guestName
          ? `${nextRoom.hostName} and ${nextRoom.guestName} are connected in room ${nextRoom.roomCode}.`
          : `Room ${nextRoom.roomCode} is waiting for a second player.`,
      );
    };

    const handleStorage = (event: StorageEvent) => {
      if (!roomSession || event.key !== getRoomStorageKey(roomSession.roomCode) || !event.newValue) {
        return;
      }

      try {
        syncRoom(JSON.parse(event.newValue) as RoomSnapshot);
      } catch {
        return;
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [roomSession]);

  const syncLocalRoomState = (nextState: MorrisState) => {
    if (!roomSession || !roomSnapshot) {
      return;
    }

    const nextRoom: RoomSnapshot = {
      ...roomSnapshot,
      state: nextState,
      updatedAt: Date.now(),
    };

    writeRoom(nextRoom);
    setRoomSnapshot(nextRoom);
  };

  const resetLocalMatch = () => {
    const nextState = createInitialState();
    setState(nextState);
    setPlayMode("local");
    setRoomSession(null);
    setRoomSnapshot(null);
    writeRoomSession(null);
    setStatusMessage("New local two-player match ready.");
  };

  const createRoom = () => {
    const playerName = playerNameInput.trim();
    if (!playerName) {
      setStatusMessage("Enter your name before creating a room.");
      return;
    }

    let roomCode = generateRoomCode();
    while (readRoom(roomCode)) {
      roomCode = generateRoomCode();
    }

    const room: RoomSnapshot = {
      roomCode,
      hostName: playerName,
      guestName: "",
      state: createInitialState(),
      updatedAt: Date.now(),
    };

    const session: RoomSession = {
      roomCode,
      playerNumber: 1,
      playerName,
    };

    writeRoom(room);
    writeRoomSession(session);
    setPlayMode("multiplayer");
    setRoomCodeInput(roomCode);
    setRoomSession(session);
    setRoomSnapshot(room);
    setState(room.state);
    setStatusMessage(`Room ${roomCode} created. Copy the invite link and open it in another tab or send the code to your friend.`);
  };

  const joinRoom = () => {
    const playerName = playerNameInput.trim();
    const roomCode = roomCodeInput.trim().toUpperCase();

    if (!playerName) {
      setStatusMessage("Enter your name before joining a room.");
      return;
    }

    if (!roomCode) {
      setStatusMessage("Enter a room code to join.");
      return;
    }

    const room = readRoom(roomCode);
    if (!room) {
      setStatusMessage(`Room ${roomCode} was not found. Create it first in another tab.`);
      return;
    }

    let playerNumber: 1 | 2 = 2;
    let nextRoom = room;

    if (!room.guestName) {
      nextRoom = {
        ...room,
        guestName: playerName,
        updatedAt: Date.now(),
      };
      writeRoom(nextRoom);
    } else if (room.guestName === playerName) {
      playerNumber = 2;
    } else if (room.hostName === playerName) {
      playerNumber = 1;
    } else {
      setStatusMessage(`Room ${roomCode} already has two players connected.`);
      return;
    }

    const session: RoomSession = {
      roomCode,
      playerNumber,
      playerName,
    };

    writeRoomSession(session);
    setPlayMode("multiplayer");
    setRoomSession(session);
    setRoomSnapshot(nextRoom);
    setState(nextRoom.state);
    setStatusMessage(`Joined room ${roomCode} as Player ${playerNumber}.`);
  };

  const copyInviteLink = async () => {
    if (!multiplayerInviteLink) {
      setStatusMessage("Create or join a room first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(multiplayerInviteLink);
      setStatusMessage("Invite link copied. Open it in another tab or send it to a friend.");
    } catch {
      setStatusMessage(`Copy failed. Share this room code instead: ${roomSession?.roomCode}`);
    }
  };

  const leaveRoom = () => {
    setPlayMode("local");
    setRoomSession(null);
    setRoomSnapshot(null);
    writeRoomSession(null);
    setState(createInitialState());
    setStatusMessage("Left the room. Back to local play.");
  };

  const restartRoom = () => {
    if (!roomSession || !roomSnapshot) {
      resetLocalMatch();
      return;
    }

    const nextState = createInitialState();
    const nextRoom: RoomSnapshot = {
      ...roomSnapshot,
      state: nextState,
      updatedAt: Date.now(),
    };

    writeRoom(nextRoom);
    setRoomSnapshot(nextRoom);
    setState(nextState);
    setStatusMessage(`Room ${roomSession.roomCode} restarted.`);
  };

  const onPointClick = (point: number) => {
    if (isInRoom && !roomSnapshot?.guestName) {
      setStatusMessage("This room is waiting for a second player to join.");
      return;
    }

    if (!isYourTurn) {
      setStatusMessage(`It is Player ${state.currentPlayer}'s turn right now.`);
      return;
    }

    const result = applyHumanAction(state, point);
    if (!result.changed) {
      return;
    }

    playTone(soundOn, result.nextState.removingPiece ? 660 : 440);
    setState(result.nextState);

    if (isInRoom) {
      syncLocalRoomState(result.nextState);
      setStatusMessage(`Room ${roomSession?.roomCode} updated.`);
      return;
    }

    setStatusMessage(result.nextState.lastAction);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(187,247,208,0.7),_rgba(255,255,255,1)_55%)] p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <Image src="/logo.png" alt="Puolingo logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Puolingo Games</p>
                <p className="text-sm font-semibold text-slate-500">Play with friends or side-by-side</p>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Play Twelve Men&apos;s Morris inside Puolingo</h1>
            <p className="mt-3 text-base font-medium text-slate-600">
              Start a local match or create a private room with an invite code so a second player can join.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant={playMode === "local" ? "secondary" : "outline"} onClick={resetLocalMatch}>
              <Swords className="mr-2 h-4 w-4" />
              Local Match
            </Button>
            <Button variant={playMode === "multiplayer" ? "secondary" : "outline"} onClick={() => setPlayMode("multiplayer")}>
              <Users className="mr-2 h-4 w-4" />
              Multiplayer
            </Button>
            <Button variant="outline" onClick={() => setSoundOn((value) => !value)}>
              {soundOn ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
              {soundOn ? "Sound On" : "Sound Off"}
            </Button>
            <Button variant="outline" onClick={() => (isInRoom ? restartRoom() : resetLocalMatch())}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>
      </div>

      {playMode === "multiplayer" ? (
        <Card className="rounded-[2rem] border-emerald-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <Users className="h-5 w-5 text-emerald-600" />
              Multiplayer Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Input
                placeholder="Your name"
                value={playerNameInput}
                onChange={(event) => setPlayerNameInput(event.target.value)}
              />
              <Input
                placeholder="Room code"
                value={roomCodeInput}
                onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={createRoom}>Create Room</Button>
                <Button variant="outline" onClick={joinRoom}>Join Room</Button>
              </div>
            </div>

            {roomSession ? (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-slate-700">
                <Badge variant="outline">{`Room ${roomSession.roomCode}`}</Badge>
                <Badge variant="outline">{`You are Player ${roomSession.playerNumber}`}</Badge>
                <span>{roomSnapshot?.hostName || "Host"} vs {roomSnapshot?.guestName || "Waiting..."}</span>
                <Button size="sm" variant="outline" onClick={copyInviteLink}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Invite Link
                </Button>
                <Button size="sm" variant="ghost" onClick={leaveRoom}>
                  Leave Room
                </Button>
              </div>
            ) : null}

            <p className="text-sm font-medium leading-6 text-slate-600">{statusMessage}</p>
            <p className="text-xs leading-5 text-slate-500">
              Current beta: room sync works when the invite is opened in another tab or browser window on this device.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden rounded-[2rem] border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="mx-auto max-w-[720px] rounded-[1.75rem] bg-slate-950 p-4 sm:p-6">
              <svg viewBox="0 0 100 100" className="aspect-square w-full">
                {CONNECTIONS.map(([from, to]) => (
                  <line
                    key={`${from}-${to}`}
                    x1={BOARD_POINTS[from].x}
                    y1={BOARD_POINTS[from].y}
                    x2={BOARD_POINTS[to].x}
                    y2={BOARD_POINTS[to].y}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ))}
                {BOARD_POINTS.map((point, index) => {
                  const piece = state.board[index];
                  const isSelected = state.selectedPoint === index;
                  const isHighlighted = highlightedPoints.includes(index);
                  const isEmpty = piece === 0;
                  return (
                    <g key={index}>
                      {isHighlighted ? (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="5.8"
                          fill={state.removingPiece ? "rgba(248,113,113,0.25)" : "rgba(74,222,128,0.26)"}
                        />
                      ) : null}
                      {isEmpty ? (
                        <>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="2.15"
                            fill="#dbe4f3"
                            stroke={isHighlighted ? "#4ade80" : "#334155"}
                            strokeWidth={isHighlighted ? "0.95" : "0.75"}
                            className="cursor-pointer"
                            onClick={() => onPointClick(index)}
                          />
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="0.82"
                            fill={isHighlighted ? "#86efac" : "#0f172a"}
                            pointerEvents="none"
                          />
                        </>
                      ) : (
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="3.8"
                          fill={piece === 1 ? "#38bdf8" : "#fb7185"}
                          stroke={isSelected ? "#fde047" : "#0f172a"}
                          strokeWidth={isSelected ? "1.4" : "1"}
                          className="cursor-pointer"
                          onClick={() => onPointClick(index)}
                        />
                      )}
                      {piece !== 0 ? (
                        <circle
                          cx={point.x - 0.7}
                          cy={point.y - 0.7}
                          r="1.25"
                          fill={piece === 1 ? "#e0f2fe" : "#ffe4e6"}
                          pointerEvents="none"
                        />
                      ) : null}
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <Gamepad2 className="h-5 w-5 text-emerald-600" />
                Match Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{playMode === "multiplayer" ? "Private Room" : "Local Versus"}</Badge>
                <Badge variant="outline">{state.phase === "placement" ? "Placement Phase" : "Movement Phase"}</Badge>
                {state.gameOver ? (
                  <Badge variant={state.winner === 1 ? "secondary" : "destructive"}>
                    {`Player ${state.winner} Wins`}
                  </Badge>
                ) : (
                  <Badge variant={state.currentPlayer === 1 ? "secondary" : "default"}>
                    {`Player ${state.currentPlayer} Turn`}
                  </Badge>
                )}
                {playMode === "multiplayer" && yourPlayerNumber ? (
                  <Badge variant={isYourTurn ? "secondary" : "outline"}>
                    {isYourTurn ? "Your Turn" : "Opponent Turn"}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm font-medium leading-6 text-slate-600">{state.lastAction}</p>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                    {playMode === "multiplayer" ? roomSnapshot?.hostName || "Player One" : "Player One"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">Pieces to place: {state.unplacedPieces[0]}</p>
                  <p className="text-sm font-semibold text-slate-700">Pieces on board: {state.boardPieces[0]}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
                    {playMode === "multiplayer" ? roomSnapshot?.guestName || "Waiting for join" : "Player Two"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">Pieces to place: {state.unplacedPieces[1]}</p>
                  <p className="text-sm font-semibold text-slate-700">Pieces on board: {state.boardPieces[1]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Game Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm font-medium leading-6 text-slate-600">
              <p>Players first place all 12 pieces one at a time. Every line of three forms a mill and lets you remove an opposing piece.</p>
              <p>Once all pieces are placed, select one of your pieces and move it along a connected line to an empty point.</p>
              <p>If you are reduced to three pieces, you can jump to any empty point on the board.</p>
              <p>Win by reducing your opponent below three active pieces or by blocking every legal move.</p>
              <p>Multiplayer now shows room controls, invite links, and turn locking so the second player can join and play from another tab.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
