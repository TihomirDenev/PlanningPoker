import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { onSnapshot, updateDoc } from 'firebase/firestore';

import { RoomService } from 'src/app/shared/services/room.service';
import { Player } from 'src/app/shared/models/player.model';
import {
  MESSAGES,
  FIRESTORE_FIELDS,
  HEARTBEAT_INTERVAL_MS,
} from 'src/app/shared/constants/constants';
import {
  calculateAverageVote,
  getLocalPlayerInfo,
  hasPlayerVoted,
} from 'src/app/shared/utils/room-utils';

@Component({
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy {
  roomId!: string;
  playerId!: string;
  userName!: string;
  players: Player[] = [];
  voteValues: string[] = [];

  showVotes = false;
  selectedVote: string | null = null;
  averageVote: number | null = null;

  private heartbeatInterval!: ReturnType<typeof setInterval>;
  private unsubscribePlayers: () => void = () => {};
  private unsubscribeRoom: () => void = () => {};

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);

  async ngOnInit(): Promise<void> {
    this.roomId = this.route.snapshot.paramMap.get('roomId')!;

    const roomExists = await this.roomService.roomExists(this.roomId);
    if (!roomExists) {
      this.router.navigate(['/404']);
      return;
    }

    // Get or create player ID and name
    const { id, name } = await this.initializeUser();
    this.playerId = id;
    this.userName = name;

    // Create or update player in Firestore
    await this.roomService.createPlayer(this.roomId, {
      id: this.playerId,
      name: this.userName,
      joinedAt: new Date(),
      vote: null,
      lastActive: Date.now(),
    });

    this.subscribeToRoom();
    this.subscribeToPlayers();
    this.subscribeToMyVote();

    this.heartbeatInterval = setInterval(() => {
      const playerRef = this.roomService.getPlayerDoc(
        this.roomId,
        this.playerId
      );
      updateDoc(playerRef, { lastActive: Date.now() });
    }, HEARTBEAT_INTERVAL_MS);

    window.addEventListener('beforeunload', this.handleLeave);
  }

  ngOnDestroy(): void {
    this.unsubscribeRoom();
    this.unsubscribePlayers();
    clearInterval(this.heartbeatInterval);
    this.handleLeave();
    window.removeEventListener('beforeunload', this.handleLeave);
  }

  get votedCount(): number {
    return this.players.filter(hasPlayerVoted).length;
  }

  get totalPlayers(): number {
    return this.players.length;
  }

  get sortedPlayers(): Player[] {
    if (this.showVotes) {
      return [...this.players]
        .filter(
          (player) =>
            player.vote !== null &&
            player.vote !== undefined &&
            player.vote !== ''
        )
        .sort((a, b) => Number(a.vote) - Number(b.vote))
        .concat(this.players.filter((player) => !player.vote));
    }
    return this.players;
  }

  selectVote(value: string): void {
    if (value === 'bin') {
      this.selectedVote = null;
      const playerRef = this.roomService.getPlayerDoc(
        this.roomId,
        this.playerId
      );
      updateDoc(playerRef, { vote: null });
      return;
    }
    this.selectedVote = value;
    const playerRef = this.roomService.getPlayerDoc(this.roomId, this.playerId);
    updateDoc(playerRef, { vote: value });
  }

  async renamePlayer(): Promise<void> {
    const newName = prompt('Enter your new name:', this.userName);
    if (!newName) return;

    const trimmed = newName.trim();
    if (!trimmed || trimmed === this.userName) return;

    const playerRef = this.roomService.getPlayerDoc(this.roomId, this.playerId);
    await updateDoc(playerRef, { name: trimmed });

    this.userName = trimmed;
    localStorage.setItem('userName', trimmed);
  }

  async resetVotes(): Promise<void> {
    await this.roomService.resetPlayerVotes(this.roomId);
    this.selectedVote = null;
    this.averageVote = null;
  }

  toggleReveal(): void {
    const roomRef = this.roomService.getRoomDoc(this.roomId);
    updateDoc(roomRef, { showVotes: !this.showVotes });
  }

  private async initializeUser(): Promise<{ id: string; name: string }> {
    const { id, name: localName } = getLocalPlayerInfo();
    let name = localName;

    if (!name) {
      const enteredName = prompt(MESSAGES.enterName);

      if (!enteredName) {
        this.router.navigate(['/']);
        return { id, name: '' };
      }
      name = enteredName.trim();
      localStorage.setItem('userName', name);
    }
    return { id, name };
  }

  private subscribeToRoom(): void {
    const roomDoc = this.roomService.getRoomDoc(this.roomId);
    this.unsubscribeRoom = onSnapshot(roomDoc, (docSnap: any) => {
      const data = docSnap.data();
      if (!data) return;
      this.showVotes = !!data[FIRESTORE_FIELDS.showVotes];
      this.voteValues = Array.isArray(data[FIRESTORE_FIELDS.voteValues])
        ? data[FIRESTORE_FIELDS.voteValues]
        : [];
      this.showVotes ? this.calculateAverage() : (this.averageVote = null);
    });
  }

  private subscribeToPlayers(): void {
    const playersRef = this.roomService.getPlayersCollection(this.roomId);
    this.unsubscribePlayers = onSnapshot(playersRef, (snapshot: any) => {
      this.players = snapshot.docs.map(
        (doc: any) => ({ id: doc.id, ...doc.data() } as Player)
      );
      if (this.showVotes) this.calculateAverage();
    });
  }

  private subscribeToMyVote(): void {
    const playerDoc = this.roomService.getPlayerDoc(this.roomId, this.playerId);
    onSnapshot(playerDoc, (docSnap: any) => {
      const data = docSnap.data();
      if (data) this.selectedVote = data[FIRESTORE_FIELDS.vote];
    });
  }

  private calculateAverage(): void {
    this.averageVote = calculateAverageVote(this.players);
  }

  handleLeave = async () => {
    await this.roomService.deletePlayer(this.roomId, this.playerId);
    await this.roomService.closeRoomIfEmpty(this.roomId);
  };
}
