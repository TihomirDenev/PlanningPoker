import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { showToast } from 'src/app/shared/utils/room-utils';
import { RoomService } from 'src/app/shared/services/room.service';
import { TOAST_MESSAGES } from 'src/app/shared/constants/toast.constants';
import { STORAGE_KEYS, ROUTE_ROOM_BASE } from 'src/app/shared/constants/constants';

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

  private router = inject(Router);
  private roomService = inject(RoomService);
  private messageService = inject(MessageService);

  async joinRoom(): Promise<void> {
    if (!this.name || !this.roomCode) {
      return;
    }

    const roomExists = await this.roomService.roomExists(this.roomCode);
    if (!roomExists) {
      showToast(this.messageService, TOAST_MESSAGES.room.notFound);
      this.roomCode = '';
      return;
    }

    localStorage.setItem(STORAGE_KEYS.userName, this.name);

    // Optionally, you might want to register the player here as well.

    this.router.navigate([ROUTE_ROOM_BASE, this.roomCode]);
  }

  backToLobby(): void {
    this.router.navigate(['/']);
  }
}
