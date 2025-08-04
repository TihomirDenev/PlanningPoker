import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';

import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

import { COLLECTIONS, ROOM_EXPIRATION_MS } from 'src/app/shared/constants/constants';
import { RoomSettings } from 'src/app/shared/models/room-settings.model';

@Injectable({ providedIn: 'root' })
export class RoomLifecycleService {
  readonly app = inject(FirebaseApp);
  readonly firestore = getFirestore(this.app);

  async getAllRooms(): Promise<(RoomSettings & { roomName: string })[]> {
    const roomsCol = collection(this.firestore, COLLECTIONS.rooms);
    const snapshot = await getDocs(roomsCol);

    return snapshot.docs.map(docSnap => ({
      ...(docSnap.data() as RoomSettings),
      roomName: docSnap.id
    }));
  }

  async deleteRoomByName(roomName: string): Promise<void> {
    await deleteDoc(doc(this.firestore, `${COLLECTIONS.rooms}/${roomName}`));
  }

  async deleteRoomsOlderThan(olderThanMs: number): Promise<void> {
    const now = Date.now();
    const rooms = await this.getAllRooms();

    for (const room of rooms) {
      if (room.timestamp && room.timestamp < now - olderThanMs) {
        await this.deleteRoomByName(room.roomName);
      }
    }
  }

  async runStartupCleanup(): Promise<void> {
    try {
      await this.deleteRoomsOlderThan(ROOM_EXPIRATION_MS);
    } catch (error) {
      console.error('Room cleanup failed during app initialization', error);
    }
  }
}
