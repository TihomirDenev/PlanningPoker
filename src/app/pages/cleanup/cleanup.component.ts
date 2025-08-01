import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { RoomService } from 'src/app/shared/services/room.service';
import { showToast } from 'src/app/shared/utils/room-utils';
import { TOAST_MESSAGES } from 'src/app/shared/constants/toast.constants';


@Component({
  selector: 'app-cleanup',
  standalone: true,
  templateUrl: './cleanup.component.html',
  styleUrls: ['./cleanup.component.scss'],
  imports: [ToastModule, ProgressSpinnerModule]
})
export class CleanupComponent implements OnInit {
  readonly router = inject(Router);
  readonly roomService = inject(RoomService);
  readonly messageService = inject(MessageService);

  ngOnInit(): void {
    this.cleanup();
  }

  private async cleanup(): Promise<void> {
    try {
      await this.roomService.deleteAllRoomsAndPlayers();
      showToast(this.messageService, TOAST_MESSAGES.cleanup.success);
    } catch (error) {
      console.error('Error while deleting rooms:', error);
      showToast(this.messageService, TOAST_MESSAGES.cleanup.failure);
    }
    setTimeout(() => this.router.navigate(['/']), 2700);
  }
}