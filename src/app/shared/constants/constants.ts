// Voting options fallback
export const DEFAULT_VOTE_VALUES = ['1', '2', '3', '5', '8'];

// Room code generation bounds
export const ROOM_CODE_MIN = 100000;
export const ROOM_CODE_MAX = 999999;

// Local storage keys
export const STORAGE_USER_NAME_KEY = 'userName';

// Routes
export const ROUTE_ROOM_BASE = '/room';

// Error messages
export const ERROR_MESSAGES = {
  roomAlreadyExists: 'A room with this name already exists.'
};

// Firestore collection/field names
export const COLLECTIONS = {
  rooms: 'rooms',
  players: 'players'
};

// Firestore field names
export const STORAGE_KEYS = {
  userName: 'userName'
};

export const MESSAGES = {
  enterName: 'Enter your name to join the room:'
};

// Firestore field keys
export const FIRESTORE_FIELDS = {
  showVotes: 'showVotes',
  vote: 'vote',
  voteValues: 'voteValues'
};

// Player session constants
export const PLAYER_TIMEOUT_MS = 10000;
export const HEARTBEAT_INTERVAL_MS = 5000;

// Average vote precision
export const AVERAGE_DECIMALS = 2;

// Cleanup messages
export const CLEANUP_MESSAGES = {
  success: '✅ All rooms and players deleted successfully.',
  failure: '❌ Failed to delete some or all rooms. Check console for details.'
};
