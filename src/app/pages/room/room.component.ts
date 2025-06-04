import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { onSnapshot, updateDoc } from 'firebase/firestore';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RoomService } from 'src/app/shared/services/room.service';
import { Player } from 'src/app/shared/models/player.model';
import { BIN, FIRESTORE_FIELDS, HEARTBEAT_INTERVAL_MS, STORAGE_KEYS } from 'src/app/shared/constants/constants';
import { calculateAverageVote, getLocalPlayerInfo, hasPlayerVoted, showToast } from 'src/app/shared/utils/room-utils';
import { TOAST_MESSAGES } from 'src/app/shared/constants/toast.constants';

@Component({
  standalone: true,
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  imports: [
    CommonModule, NgFor, NgIf, DialogModule, ButtonModule, InputTextModule, FormsModule, ToastModule
  ],
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

  showNameDialog = false;
  tempName = '';
  nameDialogTitle = '';
  nameDialogCallback: ((name: string | null) => void) | null = null;

  private heartbeatInterval!: ReturnType<typeof setInterval>;
  private unsubscribePlayers: () => void = () => {};
  private unsubscribeRoom: () => void = () => {};

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);
  private messageService = inject(MessageService);

  async ngOnInit(): Promise<void> {
    await this.loadRoom();
    await this.setupUser();
    await this.joinRoom();

    this.subscribeToRoom();
    this.subscribeToPlayers();
    this.subscribeToMyVote();

    this.startHeartbeat();
    this.listenForUnload();
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
        .filter(player => player.vote !== null && player.vote !== undefined && player.vote !== '')
        .sort((a, b) => Number(a.vote) - Number(b.vote))
        .concat(this.players.filter(player => !player.vote));
    }
    return this.players;
  }

async selectVote(value: string): Promise<void> {
  const playerRef = this.roomService.getPlayerDoc(this.roomId, this.playerId);

  if (value === BIN || value === this.selectedVote) {
    this.selectedVote = null;
    await updateDoc(playerRef, { vote: null });
    showToast(this.messageService, TOAST_MESSAGES.vote.removed);

    const othersVoted = this.players
      .filter(player => player.id !== this.playerId)
      .some(hasPlayerVoted);

    if (!othersVoted) {
      const roomRef = this.roomService.getRoomDoc(this.roomId);
      await updateDoc(roomRef, { showVotes: false });
      this.showVotes = false;
    }

    return;
  }

  this.selectedVote = value;
  await updateDoc(playerRef, { vote: value });
}

  async renamePlayer(): Promise<void> {
    this.openNameDialog('Enter your new name', '', async (newName) => {
      if (!newName || newName === this.userName) return;

      const trimmed = newName.trim();
      if (!trimmed) return;

      const playerRef = this.roomService.getPlayerDoc(this.roomId, this.playerId);
      await updateDoc(playerRef, { name: trimmed });
      this.userName = trimmed;
      localStorage.setItem(STORAGE_KEYS.userName, trimmed);

      showToast(this.messageService, TOAST_MESSAGES.player.nameChanged);
    });
  }

  async resetVotes(): Promise<void> {
    await this.roomService.resetPlayerVotes(this.roomId);
    this.selectedVote = null;
    this.averageVote = null;

    showToast(this.messageService, TOAST_MESSAGES.vote.cleared);
  }

  toggleReveal(): void {
    const roomRef = this.roomService.getRoomDoc(this.roomId);
    updateDoc(roomRef, { showVotes: !this.showVotes });
  }

  openNameDialog(title: string, initialValue: string, callback: (name: string | null) => void): void {
    this.tempName = initialValue;
    this.nameDialogTitle = title;
    this.nameDialogCallback = callback;
    this.showNameDialog = true;
  }

  onDialogConfirm(): void {
    if (this.nameDialogCallback) {
      this.nameDialogCallback(this.tempName ? this.tempName.trim() : null);
    }
    this.showNameDialog = false;
  }

  onDialogCancel(): void {
    if (this.nameDialogCallback) {
      this.nameDialogCallback(null);
    }
    this.showNameDialog = false;
  }

  private async loadRoom(): Promise<void> {
    this.roomId = this.route.snapshot.paramMap.get('roomId')!;
    const roomExists = await this.roomService.roomExists(this.roomId);
    if (!roomExists) {
      this.router.navigate(['/NotFound']);
      throw new Error('Room not found');
    }
  }

  private async setupUser(): Promise<void> {
    const { id, name } = await this.initializeUser();
    this.playerId = id;
    this.userName = name;
  }

  private async joinRoom(): Promise<void> {
    await this.roomService.createPlayer(this.roomId, {
      id: this.playerId,
      name: this.userName,
      joinedAt: new Date(),
      vote: null,
      lastActive: Date.now(),
    });
  }

  private startHeartbeat(): void {
    const playerRef = this.roomService.getPlayerDoc(this.roomId, this.playerId);
    this.heartbeatInterval = setInterval(() => {
      updateDoc(playerRef, { lastActive: Date.now() });
    }, HEARTBEAT_INTERVAL_MS);
  }

  private listenForUnload(): void {
    window.addEventListener('beforeunload', this.handleLeave);
  }

  private async initializeUser(): Promise<{ id: string; name: string }> {
    const { id, name: localName } = getLocalPlayerInfo();
    let name = localName;

    if (!name) {
      const inputName = await new Promise<string | null>((resolve) => {
        this.openNameDialog('Enter your name', '', resolve);
      });
      if (!inputName) {
        this.router.navigate(['/']);
        return { id, name: '' };
      }
      name = inputName.trim();
      localStorage.setItem(STORAGE_KEYS.userName, name);
    }

    return { id, name };
  }

  private subscribeToRoom(): void {
    const roomDoc = this.roomService.getRoomDoc(this.roomId);
    this.unsubscribeRoom = onSnapshot(roomDoc, (docSnap: any) => {
      const data = docSnap.data();
      if (!data) return;
      this.showVotes = !!data[FIRESTORE_FIELDS.showVotes];
      this.voteValues = Array.isArray(data[FIRESTORE_FIELDS.voteValues]) ? data[FIRESTORE_FIELDS.voteValues] : [];
      this.showVotes ? this.calculateAverage() : (this.averageVote = null);
    });
  }

  private subscribeToPlayers(): void {
    const playersRef = this.roomService.getPlayersCollection(this.roomId);
    this.unsubscribePlayers = onSnapshot(playersRef, (snapshot: any) => {
      this.players = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Player));
      if (this.votedCount === 0) {
        this.showVotes = false;
      }
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
  };
}
