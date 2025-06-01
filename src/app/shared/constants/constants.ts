export const HEARTBEAT_INTERVAL_MS = 60000;
export const PLAYER_TIMEOUT_MS = 300000;
export const ROOM_CODE_MIN = 100000;
export const ROOM_CODE_MAX = 999999;
export const AVERAGE_DECIMALS = 2;

export const DEFAULT_VOTE_VALUES = ['1', '2', '3', '5', '8'];
export const ROUTE_ROOM_BASE = '/room';
export const BIN = 'bin';

export const MESSAGES = {
  roomAlreadyExists: 'A room with this name already exists. Enter a new name.',
  enterName: 'Enter your name to join the room:',
  success: 'All rooms and players deleted successfully.',
  failure: 'Failed to delete some or all rooms. Check console for details.',
};

export const COLLECTIONS = {
  rooms: 'rooms',
  players: 'players',
};

export const STORAGE_KEYS = {
  userName: 'userName',
  playerId: 'playerId',
};

export const FIRESTORE_FIELDS = {
  showVotes: 'showVotes',
  vote: 'vote',
  voteValues: 'voteValues',
};