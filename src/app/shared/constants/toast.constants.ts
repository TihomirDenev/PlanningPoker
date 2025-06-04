import { ToastMessage } from 'src/app/shared/models/toast.model';

const TOAST_LIFE_SHORT = 1800;
const TOAST_LIFE_MEDIUM = 2000;
const TOAST_LIFE_LONG = 2500;
const TOAST_LIFE_ERROR = 3000;

export const TOAST_MESSAGES = {
  room: {
    alreadyExists: {
      severity: 'error',
      summary: 'Room Error',
      detail: 'A room with this name already exists.',
      life: TOAST_LIFE_MEDIUM,
    } as ToastMessage,

    created: (roomCode: string): ToastMessage => ({
      severity: 'success',
      summary: 'Room Created',
      detail: `Room "${roomCode}" was successfully created!`,
      life: TOAST_LIFE_MEDIUM,
    }),

    notFound: {
      severity: 'error',
      summary: 'Room Not Found',
      detail: 'No room with this name exists.',
      life: TOAST_LIFE_MEDIUM,
    } as ToastMessage,
  },

  vote: {
    removed: {
      severity: 'success',
      summary: 'Vote Removed',
      detail: 'Your vote was removed successfully.',
      life: TOAST_LIFE_SHORT,
    } as ToastMessage,

    cleared: {
      severity: 'info',
      summary: 'Votes Cleared',
      detail: 'All votes were cleared.',
      life: TOAST_LIFE_SHORT,
    } as ToastMessage
  },

  player: {
    nameChanged: {
      severity: 'success',
      summary: 'Name Changed',
      detail: 'Your name has been updated successfully.',
      life: TOAST_LIFE_MEDIUM,
    } as ToastMessage
  },

  cleanup: {
    success: {
      severity: 'success',
      summary: 'Cleanup Complete!',
      detail: 'All rooms and players were deleted successfully.',
      life: TOAST_LIFE_LONG,
    } as ToastMessage,

    failure: {
      severity: 'error',
      summary: 'Cleanup Failed!',
      detail: 'An error occurred while deleting rooms and players.',
      life: TOAST_LIFE_ERROR,
    } as ToastMessage
  }
};
