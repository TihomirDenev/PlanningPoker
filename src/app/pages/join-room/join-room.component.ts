import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { RoomService } from 'src/app/shared/services/room.service';
import {
  DEFAULT_VOTE_VALUES,
  ROOM_CODE_MIN,
  ROOM_CODE_MAX,
  STORAGE_USER_NAME_KEY,
  ROUTE_ROOM_BASE,
  ERROR_MESSAGES,
} from 'src/app/shared/constants/constants';

@Component({
  standalone: true,
  imports: [FormsModule],
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

  async joinRoom(): Promise<void> {
    if (!this.name || !this.roomCode) return;

    const roomAlreadyExists = await this.roomService.roomExists(this.roomCode);
    if (roomAlreadyExists) {
      alert(ERROR_MESSAGES.roomAlreadyExists);
      this.router.navigate(['/']);
      return;
    }

    localStorage.setItem(STORAGE_USER_NAME_KEY, this.name);
    const voteValues = this.getVoteValues();

    await this.roomService.updateRoom(this.roomCode, {
      showVotes: false,
      voteValues,
    });

    this.router.navigate([ROUTE_ROOM_BASE, this.roomCode]);
  }

  generateRoomCode(): void {
    this.roomCode = this.createRandomRoomCode();
  }

  private getVoteValues(): string[] {
    const parsedVotes = this.customVotes
      .split(',')
      .map((v) => v.split(' ').join(''))
      .map((v) => v.trim())
      .filter((v) => v && !isNaN(Number(v)));

    const votes = parsedVotes.length ? parsedVotes : [...DEFAULT_VOTE_VALUES];
    return votes.sort((a, b) => +a - +b);
  }

  private createRandomRoomCode(): string {
    const random =
      Math.floor(Math.random() * (ROOM_CODE_MAX - ROOM_CODE_MIN + 1)) +
      ROOM_CODE_MIN;
    return random.toString();
  }
}
