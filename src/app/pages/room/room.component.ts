import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { onSnapshot, getDocs, updateDoc } from 'firebase/firestore';

import { RoomService } from 'src/app/shared/services/room.service';
import { Player } from 'src/app/shared/models/player.model';
import { STORAGE_KEYS, MESSAGES, FIRESTORE_FIELDS, PLAYER_TIMEOUT_MS, HEARTBEAT_INTERVAL_MS } from 'src/app/shared/constants/constants';
import {
  calculateAverageVote,
  generateUniqueName,
  hasPlayerVoted,
  isPlayerActive
} from 'src/app/shared/utils/room-utils';

@Component({
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {
  roomId!: string;
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

    this.userName = await this.initializeUserName();
    await this.roomService.createPlayer(this.roomId, this.userName);

    this.subscribeToRoom();
    this.subscribeToPlayers();
    this.subscribeToMyVote();

    this.heartbeatInterval = setInterval(() => {
      const playerRef = this.roomService.getPlayerDoc(this.roomId, this.userName);
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

  selectVote(value: string): void {
    this.selectedVote = value;
    const playerRef = this.roomService.getPlayerDoc(this.roomId, this.userName);
    updateDoc(playerRef, { vote: value });
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

  private async initializeUserName(): Promise<string> {
    let baseName = localStorage.getItem(STORAGE_KEYS.userName) ?? '';

    if (!baseName) {
      const enteredName = prompt(MESSAGES.enterName);
      if (!enteredName) {
        this.router.navigate(['/']);
        return '';
      }
      baseName = enteredName.trim();
    }

    return await this.ensureUniqueName(baseName);
  }

  private async ensureUniqueName(baseName: string): Promise<string> {
    const playersRef = this.roomService.getPlayersCollection(this.roomId);
    const snapshot = await getDocs(playersRef);
    const existingNames = snapshot.docs.map(doc => doc.id);

    const finalName = generateUniqueName(baseName, existingNames);
    localStorage.setItem(STORAGE_KEYS.userName, finalName);
    return finalName;
  }

  private subscribeToRoom(): void {
    const roomDoc = this.roomService.getRoomDoc(this.roomId);
    this.unsubscribeRoom = onSnapshot(roomDoc, (docSnap: any) => {
      const data = docSnap.data();
      if (!data) return;

      this.showVotes = !!data[FIRESTORE_FIELDS.showVotes];
      this.voteValues = Array.isArray(data[FIRESTORE_FIELDS.voteValues]) ? data[FIRESTORE_FIELDS.voteValues] : [];

      this.showVotes ? this.calculateAverage() : this.averageVote = null;
    });
  }

  private subscribeToPlayers(): void {
    const playersRef = this.roomService.getPlayersCollection(this.roomId);
    this.unsubscribePlayers = onSnapshot(playersRef, (snapshot: any) => {
      this.players = snapshot.docs
        .map((doc: any) => ({ id: doc.id, ...doc.data() } as Player))
        .filter((player: Player) => isPlayerActive(player, PLAYER_TIMEOUT_MS));

      if (this.showVotes) this.calculateAverage();
    });
  }

  private subscribeToMyVote(): void {
    const playerDoc = this.roomService.getPlayerDoc(this.roomId, this.userName);
    onSnapshot(playerDoc, (docSnap: any) => {
      const data = docSnap.data();
      if (data) this.selectedVote = data[FIRESTORE_FIELDS.vote];
    });
  }

  private calculateAverage(): void {
    this.averageVote = calculateAverageVote(this.players);
  }

  handleLeave = async () => {
    await this.roomService.deletePlayer(this.roomId, this.userName);
    await this.roomService.closeRoomIfEmpty(this.roomId);
  };
}
