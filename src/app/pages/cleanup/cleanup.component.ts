import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseApp } from '@angular/fire/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

@Component({
  selector: 'app-cleanup',
  standalone: true,
  templateUrl: './cleanup.component.html',
  styleUrl: './cleanup.component.scss'
})
export class CleanupComponent implements OnInit {
  private router = inject(Router);
  private app = inject(FirebaseApp);
  private firestore = getFirestore(this.app);

  async ngOnInit() {
    this.router.navigate(['/']);

    try {
      const roomsCol = collection(this.firestore, 'rooms');
      const roomSnapshots = await getDocs(roomsCol);

      for (const roomDoc of roomSnapshots.docs) {
        const roomId = roomDoc.id;

        // Delete all players in the room
        const playersCol = collection(this.firestore, `rooms/${roomId}/players`);
        const playersSnap = await getDocs(playersCol);

        for (const playerDoc of playersSnap.docs) {
          await deleteDoc(playerDoc.ref);
        }

        // Delete the room document
        await deleteDoc(doc(this.firestore, `rooms/${roomId}`));
      }

      alert('✅ All rooms and players deleted successfully.');
    } catch (error) {
      console.error('Error while deleting rooms:', error);
      alert('❌ Failed to delete some or all rooms. Check console for details.');
    }
  }
}
