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
  normalizeMorrisState,
  type MorrisState,
} from "@/lib/games/twelve-mens-morris";

type PlayMode = "local" | "multiplayer";

type RoomSnapshot = {
  roomCode: string;
  hostName: string;
  guestName: string;
  state: MorrisState;
  updatedAt: string;
};

function normalizeRoomSnapshot(value: unknown): RoomSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<RoomSnapshot>;
  if (typeof candidate.roomCode !== "string" || typeof candidate.hostName !== "string") {
    return null;
  }

  return {
    roomCode: candidate.roomCode.toUpperCase(),
    hostName: candidate.hostName,
    guestName: typeof candidate.guestName === "string" ? candidate.guestName : "",
    state: normalizeMorrisState(candidate.state),
    updatedAt:
      typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
  };
}

type RoomSession = {
  roomCode: string;
  playerNumber: 1 | 2;
  playerName: string;
};

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

  const fetchRoom = async (roomCode: string) => {
    const response = await fetch(`/api/morris/rooms/${roomCode.toUpperCase()}`, {
      cache: "no-store",
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Room request failed.");
    }

    const room = normalizeRoomSnapshot(payload.room);
    if (!room) {
      throw new Error("Room payload was invalid.");
    }

    return room;
  };

  useEffect(() => {
    const existingSession = readRoomSession();
    if (!existingSession) {
      return;
    }

    fetchRoom(existingSession.roomCode)
      .then((room) => {
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
      })
      .catch(() => {
        writeRoomSession(null);
      });
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

    const normalizedRoomCode = roomFromUrl.toUpperCase();
    const timeoutId = window.setTimeout(() => {
      setPlayMode("multiplayer");
      setRoomCodeInput(normalizedRoomCode);
      setStatusMessage(`Invite detected for room ${normalizedRoomCode}. Enter your name and tap Join Room.`);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!roomSession) {
      return;
    }

    const interval = window.setInterval(() => {
      fetchRoom(roomSession.roomCode)
        .then((room) => {
          setRoomSnapshot(room);
          setState(room.state);
          setStatusMessage(
            room.guestName
              ? `${room.hostName} and ${room.guestName} are connected in room ${room.roomCode}.`
              : `Room ${room.roomCode} is waiting for a second player.`,
          );
        })
        .catch(() => {});
    }, 1500);

    return () => window.clearInterval(interval);
  }, [roomSession]);

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

    fetch("/api/morris/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not create room.");
        }

        const session: RoomSession = {
          roomCode: payload.roomCode,
          playerNumber: payload.playerNumber,
          playerName,
        };

        writeRoomSession(session);
        setPlayMode("multiplayer");
        setRoomCodeInput(payload.roomCode);
        setRoomSession(session);
        const room = normalizeRoomSnapshot(payload.room);
        if (!room) {
          throw new Error("Room payload was invalid.");
        }

        setRoomSnapshot(room);
        setState(room.state);
        setStatusMessage(`Room ${payload.roomCode} created. Copy the invite link and send it to your friend.`);
      })
      .catch((error: Error) => {
        setStatusMessage(error.message);
      });
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

    fetch(`/api/morris/rooms/${roomCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", playerName }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not join room.");
        }

        const session: RoomSession = {
          roomCode,
          playerNumber: payload.playerNumber,
          playerName,
        };

        writeRoomSession(session);
        setPlayMode("multiplayer");
        setRoomSession(session);
        const room = normalizeRoomSnapshot(payload.room);
        if (!room) {
          throw new Error("Room payload was invalid.");
        }

        setRoomSnapshot(room);
        setState(room.state);
        setStatusMessage(`Joined room ${roomCode} as Player ${payload.playerNumber}.`);
      })
      .catch((error: Error) => {
        setStatusMessage(error.message);
      });
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
    if (!roomSession) {
      resetLocalMatch();
      return;
    }

    fetch(`/api/morris/rooms/${roomSession.roomCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restart" }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not restart room.");
        }

        const room = normalizeRoomSnapshot(payload.room);
        if (!room) {
          throw new Error("Room payload was invalid.");
        }

        setRoomSnapshot(room);
        setState(room.state);
        setStatusMessage(`Room ${roomSession.roomCode} restarted.`);
      })
      .catch((error: Error) => {
        setStatusMessage(error.message);
      });
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

    if (isInRoom && roomSession) {
      fetch(`/api/morris/rooms/${roomSession.roomCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move",
          playerNumber: roomSession.playerNumber,
          point,
        }),
      })
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error ?? "Move failed.");
          }

          const room = normalizeRoomSnapshot(payload.room);
          if (!room) {
            throw new Error("Room payload was invalid.");
          }

          setRoomSnapshot(room);
          setState(room.state);
          setStatusMessage(`Room ${roomSession.roomCode} updated.`);
        })
        .catch((error: Error) => {
          setStatusMessage(error.message);
          fetchRoom(roomSession.roomCode)
            .then((room) => {
              setRoomSnapshot(room);
              setState(room.state);
            })
            .catch(() => {});
        });
      return;
    }

    setStatusMessage(result.nextState.lastAction);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-amber-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <Image src="/logo.png" alt="Diteme logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">Diteme Games</p>
                <p className="text-sm font-semibold text-slate-500">Traditional board strategy</p>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Play Mohele inside Diteme</h1>
            <p className="mt-3 text-base font-medium text-slate-600">
              Start a local match or create a private room, then move pieces across a carved wooden Mohele board.
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
        <Card className="overflow-hidden rounded-[1.25rem] border-[#3a2117] bg-[#3a2117] shadow-[0_18px_36px_rgba(41,24,18,0.24)]">
          <CardContent className="p-3 sm:p-4">
            <div className="mx-auto max-w-[720px] rounded-[0.85rem] border-[10px] border-[#2f1b13] bg-[#2f1b13] p-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.08)] sm:border-[14px] sm:p-3">
              <svg viewBox="0 0 100 100" className="aspect-square w-full rounded-sm">
                <defs>
                  <linearGradient id="moheleWood" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e7c78a" />
                    <stop offset="42%" stopColor="#c99555" />
                    <stop offset="100%" stopColor="#f0d39a" />
                  </linearGradient>
                  <pattern id="moheleGrain" width="14" height="100" patternUnits="userSpaceOnUse">
                    <path d="M2 0 C5 18 0 32 4 50 C8 68 1 82 5 100" fill="none" stroke="#8b5a2b" strokeOpacity="0.2" strokeWidth="0.65" />
                    <path d="M10 0 C7 20 13 36 9 54 C5 72 12 88 8 100" fill="none" stroke="#fff5cf" strokeOpacity="0.18" strokeWidth="0.5" />
                  </pattern>
                  <filter id="pieceShadow" x="-35%" y="-35%" width="170%" height="170%">
                    <feDropShadow dx="0.9" dy="1.3" stdDeviation="1.1" floodColor="#2f1b13" floodOpacity="0.42" />
                  </filter>
                  <radialGradient id="yellowPiece" cx="35%" cy="28%" r="70%">
                    <stop offset="0%" stopColor="#fff8a6" />
                    <stop offset="48%" stopColor="#f5b616" />
                    <stop offset="100%" stopColor="#9f5f00" />
                  </radialGradient>
                  <radialGradient id="bluePiece" cx="35%" cy="28%" r="70%">
                    <stop offset="0%" stopColor="#86d7ff" />
                    <stop offset="48%" stopColor="#0c83c5" />
                    <stop offset="100%" stopColor="#06405f" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="100" height="100" fill="url(#moheleWood)" />
                <rect x="0" y="0" width="100" height="100" fill="url(#moheleGrain)" />
                <rect x="3" y="3" width="94" height="94" fill="none" stroke="#5a321d" strokeWidth="1.4" opacity="0.5" />
                <text x="50" y="10" textAnchor="middle" className="select-none fill-[#3f2516] text-[6px] font-bold tracking-[0.04em]">
                  Mohele
                </text>
                {CONNECTIONS.map(([from, to]) => (
                  <line
                    key={`${from}-${to}`}
                    x1={BOARD_POINTS[from].x}
                    y1={BOARD_POINTS[from].y}
                    x2={BOARD_POINTS[to].x}
                    y2={BOARD_POINTS[to].y}
                    stroke="#6b4324"
                    strokeWidth="0.65"
                    strokeLinecap="round"
                    opacity="0.72"
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
                          fill={state.removingPiece ? "rgba(127,29,29,0.18)" : "rgba(255,255,255,0.28)"}
                          stroke={state.removingPiece ? "#7f1d1d" : "#f8e0a2"}
                          strokeWidth="0.45"
                        />
                      ) : null}
                      {isEmpty ? (
                        <>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="2.35"
                            fill="#2b1a10"
                            stroke={isHighlighted ? "#f7d269" : "#8b5a2b"}
                            strokeWidth={isHighlighted ? "0.8" : "0.45"}
                            className="cursor-pointer"
                            onClick={() => onPointClick(index)}
                          />
                          <circle
                            cx={point.x - 0.55}
                            cy={point.y - 0.55}
                            r="0.65"
                            fill={isHighlighted ? "#fff3bd" : "#0f0905"}
                            opacity="0.8"
                            pointerEvents="none"
                          />
                        </>
                      ) : (
                        <g filter="url(#pieceShadow)" className="cursor-pointer" onClick={() => onPointClick(index)}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="4.1"
                            fill={piece === 1 ? "url(#yellowPiece)" : "url(#bluePiece)"}
                            stroke={isSelected ? "#fff7ad" : "#3a2117"}
                            strokeWidth={isSelected ? "1.4" : "0.7"}
                          />
                          <circle
                            cx={point.x - 1.2}
                            cy={point.y - 1.2}
                            r="1"
                            fill="#ffffff"
                            opacity="0.72"
                            pointerEvents="none"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
                <text x="7" y="95" className="select-none fill-[#4b2d1a] text-[2.5px] font-semibold">
                  A strategy game played on Diteme
                </text>
                <text x="72" y="95" className="select-none fill-[#4b2d1a] text-[2.2px] font-semibold">
                  Yellow vs Blue
                </text>
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
                <div className="rounded-2xl bg-yellow-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
                    {playMode === "multiplayer" ? roomSnapshot?.hostName || "Player One" : "Player One"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">Pieces to place: {state.unplacedPieces[0]}</p>
                  <p className="text-sm font-semibold text-slate-700">Pieces on board: {state.boardPieces[0]}</p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
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
              <p>Mohele is played with 12 pieces per player. Every line of three forms a mill and lets you remove an opposing piece.</p>
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

