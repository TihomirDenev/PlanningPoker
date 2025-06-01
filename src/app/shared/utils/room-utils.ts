import { MessageService, Message } from 'primeng/api';

import { Player } from 'src/app/shared/models/player.model';
import { STORAGE_KEYS } from 'src/app/shared/constants/constants';

export function calculateAverageVote(players: Player[]): number | null {
  const numericVotes = players
    .map((p) => parseFloat(p.vote || ''))
    .filter((v) => !isNaN(v));

  if (!numericVotes.length) return null;

  const sum = numericVotes.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / numericVotes.length).toFixed(2));
}

export function isPlayerActive(player: Player, timeout = 10000): boolean {
  return Date.now() - player.lastActive < timeout;
}

export function hasPlayerVoted(player: Player): boolean {
  return player.vote !== null;
}

export function getLocalPlayerInfo(): { id: string; name: string } {
  let id = localStorage.getItem(STORAGE_KEYS.playerId);
  let name = localStorage.getItem(STORAGE_KEYS.userName);

  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEYS.playerId, id);
  }

  return { id, name: name || '' };
}

export function showToast( messageService: MessageService, options: {
    severity?: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail?: string,
    life?: number,
    styleClass?: string
  }
) {
  messageService.add({
    severity: options.severity || 'info',
    summary: options.summary,
    detail: options.detail || '',
    life: options.life || 2000,
    styleClass: 'my-custom-toast'
  } as Message);
}