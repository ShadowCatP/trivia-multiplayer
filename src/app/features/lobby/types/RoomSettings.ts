export type RoomSettings = {
  roomName: string;
  isPublic: boolean;
  maxPlayers: number;
  questionTimeLimit: number; // in seconds
  shuffleQuestions: boolean;
  showAnswersAfterQuestion: boolean;
};
