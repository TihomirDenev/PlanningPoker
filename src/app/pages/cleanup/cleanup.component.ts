import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { RoomService } from 'src/app/shared/services/room.service';
import { MESSAGES } from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-cleanup',
  standalone: true,
  templateUrl: './cleanup.component.html',
  styleUrls: ['./cleanup.component.scss'],
  imports: [ToastModule, ProgressSpinnerModule]
})
export class CleanupComponent implements OnInit {
  private router = inject(Router);
  private roomService = inject(RoomService);
  private messageService = inject(MessageService);

  async ngOnInit(): Promise<void> {
    try {
      await this.roomService.deleteAllRoomsAndPlayers();
      this.messageService.add({
        severity: 'success',
        summary: 'Cleanup Complete!',
        detail: MESSAGES.success,
        life: 2500,
        styleClass: 'my-custom-toast'
      });
    } catch (error) {
      console.error('Error while deleting rooms:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Cleanup Failed!',
        detail: MESSAGES.failure,
        life: 3000,
        styleClass: 'my-custom-toast'
      });
    }

    setTimeout(() => this.router.navigate(['/']), 2700);
  }
}