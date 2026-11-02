
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Users,
  DoorOpen,
  Copy,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";

import {
  createRoom,
  getMyRooms,
  joinRoom,
} from "../services/groupService";

export default function Rooms() {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [rooms, setRooms] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Load rooms from the backend.
  const loadRooms = useCallback(async () => {
    try {
      const data = await getMyRooms();
      setRooms(data);
    } catch (error) {
      toast.error(error.message || "Unable to load rooms.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Create a room through the backend.
  const handleCreateRoom = async (event) => {
    event.preventDefault();

    if (!roomName.trim()) {
      toast.error("Please enter a room name.");
      return;
    }

    try {
      setIsCreating(true);

      const room = await createRoom({
        name: roomName,
      });

      setRoomName("");

      toast.success(`Room "${room.name}" created!`);
      toast.info(`Your room code is ${room.code}`);

      await loadRooms();
    } catch (error) {
      toast.error(error.message || "Unable to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  // Join a room using its invitation code.
  const handleJoinRoom = async (event) => {
    event.preventDefault();

    if (!roomCode.trim()) {
      toast.error("Please enter a room code.");
      return;
    }

    try {
      setIsJoining(true);

      const room = await joinRoom({
        code: roomCode,
      });

      setRoomCode("");

      toast.success(`You joined "${room.name}"!`);

      await loadRooms();
    } catch (error) {
      toast.error(error.message || "Unable to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Room code copied.");
    } catch {
      toast.error("Unable to copy room code.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Rooms"
        description="Create rooms, invite people, and manage shared expenses."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Room */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-foreground">
                Create a Room
              </h2>

              <p className="text-sm text-muted-foreground">
                Start a new expense-sharing group.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <Input
              id="roomName"
              label="Room Name"
              placeholder="e.g. Goa Trip, Flat Expenses"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              maxLength={150}
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isCreating}
              disabled={isCreating}
            >
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </form>
        </Card>

        {/* Join Room */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <DoorOpen className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-foreground">
                Join a Room
              </h2>

              <p className="text-sm text-muted-foreground">
                Enter an invitation code shared with you.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <Input
              id="roomCode"
              label="Room Code"
              placeholder="Enter 10-character room code"
              value={roomCode}
              onChange={(event) =>
                setRoomCode(event.target.value.toUpperCase())
              }
              maxLength={10}
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={isJoining}
              disabled={isJoining}
            >
              <Users className="h-4 w-4" />
              Join Room
            </Button>
          </form>
        </Card>
      </div>

      {/* Room List */}
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            Your Rooms
          </h2>

          <p className="text-sm text-muted-foreground">
            Rooms you have created or joined.
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading your rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="font-medium text-foreground">
              No rooms yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first room or join an existing room using
              an invitation code.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="rounded-lg border border-border p-4 transition-colors hover:border-brand-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Users className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-foreground">
                        {room.name}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        {room.memberCount}{" "}
                        {room.memberCount === 1 ? "member" : "members"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Room Code
                    </p>

                    <p className="font-mono text-sm font-semibold tracking-wider">
                      {room.code}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCode(room.code)}
                    aria-label="Copy room code"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />

                  Created{" "}
                  {room.createdAt
                    ? new Date(room.createdAt).toLocaleDateString()
                    : "Date unavailable"}
                </div>

                <Button
                  className="mt-4 w-full"
                  variant="secondary"
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  View Room
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
