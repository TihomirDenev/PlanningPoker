import { inject, Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  Firestore,
} from 'firebase/firestore';

import { RoomSettings } from 'src/app/shared/models/room-settings.model';
import { COLLECTIONS } from 'src/app/shared/constants/constants';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private app = inject(FirebaseApp);
  private firestore = getFirestore(this.app);

  // Existing methods
  async roomExists(roomCode: string): Promise<boolean> {
    const roomDoc = doc(this.firestore, `${COLLECTIONS.rooms}/${roomCode}`);
    const snapshot = await getDoc(roomDoc);
    const data = snapshot.data();

    return (
      snapshot.exists() &&
      Array.isArray(data?.['voteValues']) &&
      typeof data?.['showVotes'] === 'boolean'
    );
  }

  async updateRoom(roomCode: string, settings: RoomSettings): Promise<void> {
    const roomDoc = doc(this.firestore, `${COLLECTIONS.rooms}/${roomCode}`);
    await setDoc(roomDoc, settings, { merge: true });
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  getRoomDoc(roomId: string) {
    return doc(this.firestore, `${COLLECTIONS.rooms}/${roomId}`);
  }

  getPlayersCollection(roomId: string) {
    return collection(
      this.firestore,
      `${COLLECTIONS.rooms}/${roomId}/${COLLECTIONS.players}`
    );
  }

  getPlayerDoc(roomId: string, userName: string) {
    return doc(
      this.firestore,
      `${COLLECTIONS.rooms}/${roomId}/${COLLECTIONS.players}/${userName}`
    );
  }

  async createPlayer(roomId: string, player: Player): Promise<void> {
    const playerRef = this.getPlayerDoc(roomId, player.id);
    await setDoc(playerRef, player);
  }

  async resetPlayerVotes(roomId: string): Promise<void> {
    const playersRef = this.getPlayersCollection(roomId);
    const snapshot = await getDocs(playersRef);

    for (const docSnap of snapshot.docs) {
      const playerRef = this.getPlayerDoc(roomId, docSnap.id);
      await updateDoc(playerRef, { vote: null });
    }

    const roomDoc = this.getRoomDoc(roomId);
    await updateDoc(roomDoc, { showVotes: false });
  }

  async deletePlayer(roomId: string, userName: string): Promise<void> {
    const playerRef = this.getPlayerDoc(roomId, userName);
    await deleteDoc(playerRef);
  }

  async closeRoomIfEmpty(roomId: string): Promise<void> {
    const playersRef = this.getPlayersCollection(roomId);
    const snapshot = await getDocs(playersRef);

    if (snapshot.empty) {
      const roomDoc = this.getRoomDoc(roomId);
      await updateDoc(roomDoc, { roomClosedAt: Date.now() });
    }
  }

  async deleteAllRoomsAndPlayers(): Promise<void> {
    const roomsCol = collection(this.firestore, COLLECTIONS.rooms);
    const roomSnapshots = await getDocs(roomsCol);

    for (const roomDoc of roomSnapshots.docs) {
      const roomId = roomDoc.id;

      const playersCol = collection(
        this.firestore,
        `${COLLECTIONS.rooms}/${roomId}/${COLLECTIONS.players}`
      );
      const playersSnap = await getDocs(playersCol);

      for (const playerDoc of playersSnap.docs) {
        await deleteDoc(playerDoc.ref);
      }

      await deleteDoc(doc(this.firestore, `${COLLECTIONS.rooms}/${roomId}`));
    }
  }
}
