import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Users,
  DoorOpen,
  Copy,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Avatar from "../components/common/Avatar";
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
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const [activeTab, setActiveTab] = useState("all"); // 'all', 'create', 'join'

  const loadRooms = useCallback(async () => {
    try {
      setIsLoading(true);
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

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    if (!roomName.trim()) {
      toast.error("Please enter a room name.");
      return;
    }

    try {
      setIsCreating(true);
      const room = await createRoom({ name: roomName });
      setRoomName("");
      toast.success(`Room "${room.name}" created!`);
      toast.info(`Room invitation code: ${room.code}`);
      setActiveTab("all");
      await loadRooms();
    } catch (error) {
      toast.error(error.message || "Unable to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (event) => {
    event.preventDefault();
    if (!roomCode.trim()) {
      toast.error("Please enter a room code.");
      return;
    }

    try {
      setIsJoining(true);
      const room = await joinRoom({ code: roomCode });
      setRoomCode("");
      toast.success(`Joined "${room.name}"!`);
      setActiveTab("all");
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
      toast.success("Room invitation code copied!");
    } catch {
      toast.error("Unable to copy room code.");
    }
  };

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Rooms & Circles
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium">
            Manage your shared circles, invite members, and split expenses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "create" ? "all" : "create")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
              activeTab === "create"
                ? "bg-[#18191E] text-white"
                : "bg-[#00C4A7] hover:bg-[#00B096] text-white shadow-teal-500/20"
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Create Room</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "join" ? "all" : "join")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === "join"
                ? "bg-[#18191E] text-white border-transparent"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <DoorOpen className="h-4 w-4" />
            <span>Join with Code</span>
          </button>
        </div>
      </div>

      {/* Forms Section: Create & Join */}
      {activeTab === "create" && (
        <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-sm animate-in fade-in max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-[#00C4A7]">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Create a New Room</h2>
              <p className="text-xs text-gray-400">Start an expense-sharing circle with friends</p>
            </div>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Room Name
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 402, Road Trip, Goa Vacation"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={150}
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 rounded-2xl bg-[#00C4A7] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#00C4A7]/25 hover:bg-[#00B096] transition-all disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Confirm & Create"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "join" && (
        <div className="rounded-[28px] bg-white p-6 border border-gray-100 shadow-sm animate-in fade-in max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-[#00C4A7]">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Join Existing Room</h2>
              <p className="text-xs text-gray-400">Enter a 10-character room invitation code</p>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Invitation Code
              </label>
              <input
                type="text"
                placeholder="e.g. ABC123XYZ0"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={10}
                required
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isJoining}
                className="flex-1 rounded-2xl bg-[#18191E] py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-all disabled:opacity-60"
              >
                {isJoining ? "Joining..." : "Join Circle"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Rooms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Active Circles ({rooms.length})
          </p>

          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4A7]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-[28px] bg-white p-12 text-center text-sm text-gray-400 border border-gray-100">
            Loading your circles from the backend...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-[28px] bg-white p-12 text-center border border-gray-100 max-w-md mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#00C4A7] mb-3">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No rooms found</h3>
            <p className="mt-1 text-xs text-gray-400">
              Create your first room or join one with an invitation code.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#00C4A7] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#00B096]"
            >
              <Plus className="h-4 w-4" />
              <span>Create Room</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="group rounded-[28px] bg-white p-5 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#CCFBF1] text-[#008F7A] shadow-xs">
                        <Avatar name={room.name} size="sm" shape="squircle" className="bg-transparent" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">{room.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">
                          {room.memberCount || room.members?.length || 1} members
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-[#18191E] group-hover:text-white text-gray-700 transition-colors shadow-2xs"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Code Bar */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F8F9FA] px-3.5 py-2.5 border border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Room Code:
                      </span>
                      <p className="font-mono text-xs font-bold text-gray-900 tracking-wider">
                        {room.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(room.code)}
                      className="text-xs font-bold text-[#00C4A7] hover:text-[#00B096]"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Currency: {room.defaultCurrency || "INR"}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                    className="text-xs font-bold text-gray-900 hover:text-[#00C4A7]"
                  >
                    View Details &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
