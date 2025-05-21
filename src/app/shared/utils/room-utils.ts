import { Player } from '../models/player.model';

export function calculateAverageVote(players: Player[]): number | null {
  const numericVotes = players
    .map(p => parseFloat(p.vote || ''))
    .filter(v => !isNaN(v));

  if (!numericVotes.length) return null;

  const sum = numericVotes.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / numericVotes.length).toFixed(2));
}

export function generateUniqueName(baseName: string, existingNames: string[]): string {
  let finalName = baseName;
  let suffixCount = 1;

  while (existingNames.includes(finalName)) {
    finalName = baseName + ' ' + '|'.repeat(suffixCount);
    suffixCount++;
  }

  return finalName;
}

export function isPlayerActive(player: Player, timeout = 10000): boolean {
  return Date.now() - player.lastActive < timeout;
}

export function hasPlayerVoted(player: Player): boolean {
  return player.vote !== null;
}
