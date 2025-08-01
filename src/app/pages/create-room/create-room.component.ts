import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { showToast } from 'src/app/shared/utils/room-utils';
import { RoomService } from 'src/app/shared/services/room.service';
import { TOAST_MESSAGES } from 'src/app/shared/constants/toast.constants';
import { DEFAULT_VOTE_VALUES, STORAGE_KEYS, ROUTE_ROOM_BASE, BIN, ROOM_NAMES } from 'src/app/shared/constants/constants';

@Component({
  standalone: true,
  imports: [FormsModule, ToastModule],
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss'],
})
export class CreateRoomComponent {
  name = '';
  roomCode = '';
  customVotes = '';

  readonly router = inject(Router);
  readonly roomService = inject(RoomService);
  readonly messageService = inject(MessageService);

  async createRoom(): Promise<void> {
    const roomAlreadyExists = await this.roomService.roomExists(this.roomCode);

    if (!this.name || !this.roomCode) {
      return
    };

    if (roomAlreadyExists) {
      showToast(this.messageService, TOAST_MESSAGES.room.alreadyExists);
      this.roomCode = '';

      return;
    }

    await this.handleRoomCreation();
  }

  generateRoomCode(): void {
    const room_name = ROOM_NAMES[Math.floor(Math.random() * ROOM_NAMES.length)];
    const number = Math.floor(100 + Math.random() * 900);

    this.roomCode = `${room_name}-${number}`;
  }

  navigateToLobby() {
    this.router.navigate(['/']);
  }

  private getVoteValues(): string[] {
    const parsedVotes = this.customVotes
      .split(',')
      .map((v) => v.split(' ').join(''))
      .map((v) => v.trim())
      .filter((v) => v && !isNaN(Number(v)));

    const votes = parsedVotes.length ? parsedVotes : [...DEFAULT_VOTE_VALUES];

    votes.push(BIN);
    return votes.sort((a, b) => {
      if (a === BIN) return 1;
      if (b === BIN) return -1;
      return +a - +b;
    });
  }

  private async handleRoomCreation(): Promise<void> {
    const voteValues = this.getVoteValues();

    localStorage.setItem(STORAGE_KEYS.userName, this.name);

    await this.roomService.updateRoom(this.roomCode, {
      showVotes: false,
      voteValues,
    });

    showToast(this.messageService, TOAST_MESSAGES.room.created(this.roomCode));

    this.router.navigate([ROUTE_ROOM_BASE, this.roomCode]);
  }
}
