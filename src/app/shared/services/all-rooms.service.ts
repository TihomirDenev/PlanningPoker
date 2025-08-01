import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';

import { Observable, combineLatest, switchMap, map, of } from 'rxjs';

import {
  getFirestore,
  collection,
  Firestore,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
} from 'firebase/firestore';

import { COLLECTIONS } from 'src/app/shared/constants/constants';
import { RoomOverview } from 'src/app/shared/models/room-overview.model';

@Injectable({ providedIn: 'root' })
export class AllRoomsService {
  readonly app = inject(FirebaseApp);
  readonly firestore: Firestore = getFirestore(this.app);

  observeLiveRoomOverviews(): Observable<RoomOverview[]> {
    const roomsCollectionRef = this.getRoomsCollectionRef();

    return this.observeCollectionSnapshots(roomsCollectionRef).pipe(
      switchMap((roomDocSnapshots) => {
        if (!roomDocSnapshots.length) return of([]);

        const roomOverviewStreams = roomDocSnapshots.map((roomDocSnapshot) =>
          this.getRoomOverviewStream(roomDocSnapshot)
        );

        return combineLatest(roomOverviewStreams);
      })
    );
  }

  private observeCollectionSnapshots<T = DocumentData>(
    collectionRef: CollectionReference<T>
  ): Observable<QueryDocumentSnapshot<T>[]> {
    return new Observable((observer) => {
      const unsubscribe = 
        onSnapshot(collectionRef, (snapshot: QuerySnapshot<T>) => {
          observer.next(snapshot.docs);
        });

      return () => unsubscribe();
    });
  }

  private getRoomsCollectionRef(): CollectionReference<DocumentData> {
    return collection(this.firestore, COLLECTIONS.rooms);
  }

  private getPlayersCollectionRef(roomId: string): CollectionReference<DocumentData> {
    return collection(this.firestore, `${COLLECTIONS.rooms}/${roomId}/${COLLECTIONS.players}`);
  }

  private getRoomOverviewStream(roomDocSnapshot: QueryDocumentSnapshot<DocumentData>): Observable<RoomOverview> {
    const roomId = roomDocSnapshot.id;
    const roomData = roomDocSnapshot.data();
    const playersCollectionRef = this.getPlayersCollectionRef(roomId);

    return this.observeCollectionSnapshots(playersCollectionRef).pipe(
      map((playerDocSnapshots) => ({
        roomId,
        data: roomData,
        playerCount: playerDocSnapshots.length,
      }))
    );
  }
}
