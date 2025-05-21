import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { RoomService } from 'src/app/shared/services/room.service';
import { CLEANUP_MESSAGES } from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-cleanup',
  standalone: true,
  templateUrl: './cleanup.component.html',
  styleUrls: ['./cleanup.component.scss']
})
export class CleanupComponent implements OnInit {
  private router = inject(Router);
  private roomService = inject(RoomService);

  async ngOnInit(): Promise<void> {
    this.router.navigate(['/']);

    try {
      await this.roomService.deleteAllRoomsAndPlayers();
      alert(CLEANUP_MESSAGES.success);
    } catch (error) {
      console.error('Error while deleting rooms:', error);
      alert(CLEANUP_MESSAGES.failure);
    }
  }
}
