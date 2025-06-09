import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';

import { Observable, combineLatest } from 'rxjs';

import { getFirestore, collection, onSnapshot, Firestore } from 'firebase/firestore';

import { COLLECTIONS } from 'src/app/shared/constants/constants';

@Injectable({ providedIn: 'root' })
export class AllRoomsService {
  private app = inject(FirebaseApp);
  private firestore: Firestore = getFirestore(this.app);

getAllRoomsLive(): Observable<{ roomId: string; data: any; playerCount: number }[]> {
  return new Observable(observer => {
    observer.next([]);
    const roomsCol = collection(this.firestore, COLLECTIONS.rooms);
    const unsubscribeRooms = onSnapshot(roomsCol, snapshot => {
      const roomDocs = snapshot.docs;
      if (roomDocs.length === 0) {
        observer.next([]);
        return;
      }
      const roomObservables = roomDocs.map(roomDoc => {
        const roomId = roomDoc.id;
        const data = roomDoc.data();
        const playersCol = collection(this.firestore, `${COLLECTIONS.rooms}/${roomId}/${COLLECTIONS.players}`);
        return new Observable<{ roomId: string; data: any; playerCount: number }>(playerObs => {
          const unsubscribePlayers = onSnapshot(playersCol, playerSnap => {
            playerObs.next({
              roomId,
              data,
              playerCount: playerSnap.size
            });
          });
          return () => unsubscribePlayers();
        });
      });
      const combined = combineLatest(roomObservables);
      const sub = combined.subscribe(roomsWithPlayers => {
        observer.next(Array.isArray(roomsWithPlayers) ? roomsWithPlayers : []);
      });
      return () => sub.unsubscribe();
    });
    return () => unsubscribeRooms();
  });
}

}
