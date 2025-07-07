export type Room = {
  id: string;
  roomName: string;
  host: string;
  isPublic: boolean;
  inviteCode: string;
  players: number;
};

export interface RoomState {
  users: string[];
  host: string | null;
}
