import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { RoomService } from 'src/app/shared/services/room.service';
import { DEFAULT_VOTE_VALUES, ROOM_CODE_MIN, ROOM_CODE_MAX, STORAGE_KEYS, ROUTE_ROOM_BASE, MESSAGES, BIN } from 'src/app/shared/constants/constants';

@Component({
  standalone: true,
  imports: [FormsModule, ToastModule],
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.scss'],
})
export class JoinRoomComponent {
  name = '';
  roomCode = '';
  customVotes = '';

  private router = inject(Router);
  private roomService = inject(RoomService);
  private messageService = inject(MessageService);

  async joinRoom(): Promise<void> {
    if (!this.name || !this.roomCode) return;

    const roomAlreadyExists = await this.roomService.roomExists(this.roomCode);
    if (roomAlreadyExists) {
      this.messageService.add({
        severity: 'error',
        summary: 'Room Error',
        detail: MESSAGES.roomAlreadyExists,
        life: 2000,
        styleClass: 'my-custom-toast'
      });
      this.roomCode = '';

      return;
    }

    localStorage.setItem(STORAGE_KEYS.userName, this.name);
    const voteValues = this.getVoteValues();

    await this.roomService.updateRoom(this.roomCode, {
      showVotes: false,
      voteValues,
    });

    this.router.navigate([ROUTE_ROOM_BASE, this.roomCode]);
  }

  generateRoomCode(): void {
    const random =
      Math.floor(Math.random() * (ROOM_CODE_MAX - ROOM_CODE_MIN + 1)) +
      ROOM_CODE_MIN;

    this.roomCode = random.toString();
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
}
