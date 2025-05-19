import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FirebaseApp } from '@angular/fire/app';

import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  getDoc,
  getDocs,
} from 'firebase/firestore';

interface Player {
  id: string;
  name: string;
  vote: string | null;
  joinedAt: any;
  lastActive: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {
  roomId!: string;
  userName!: string;
  players: Player[] = [];
  voteValues: string[] = [];
  showVotes = false;
  selectedVote: string | null = null;
  averageVote: number | null = null;

  private firestore!: Firestore;
  private unsubscribePlayers: () => void = () => {};
  private unsubscribeRoom: () => void = () => {};
  private heartbeatInterval!: ReturnType<typeof setInterval>;

  private app = inject(FirebaseApp);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.firestore = getFirestore(this.app);
    this.roomId = this.route.snapshot.paramMap.get('roomId')!;
    this.userName = localStorage.getItem('userName') ?? '';

    if (!this.userName) {
      const enteredName = prompt('Enter your name to join the room:');
      if (!enteredName) {
        this.router.navigate(['/']);
        return;
      }
      this.userName = enteredName.trim();
      localStorage.setItem('userName', this.userName);
    }

    const playersRef = collection(this.firestore, `rooms/${this.roomId}/players`);
    const playerDoc = doc(playersRef, this.userName);
    const roomDoc = doc(this.firestore, `rooms/${this.roomId}`);

    setDoc(playerDoc, {
      name: this.userName,
      joinedAt: new Date(),
      vote: null,
      lastActive: Date.now()
    });

    getDoc(roomDoc).then((docSnap) => {
      if (!docSnap.exists()) {
        setDoc(roomDoc, { showVotes: false });
      }
    });

    this.unsubscribeRoom = onSnapshot(roomDoc, (docSnap: any) => {
      const data = docSnap.data();
      if (data) {
        if (typeof data['showVotes'] === 'boolean') {
          this.showVotes = data['showVotes'];
          if (this.showVotes) {
            this.calculateAverage();
          } else {
            this.averageVote = null;
          }
        }
        if (Array.isArray(data['voteValues'])) {
          this.voteValues = data['voteValues'];
        }
      }
    });

    this.unsubscribePlayers = onSnapshot(playersRef, (snapshot: any) => {
      this.players = snapshot.docs
        .map((doc: any) => ({ id: doc.id, ...doc.data() } as Player))
        .filter((player: Player) => Date.now() - player.lastActive < 10000);
      if (this.showVotes) {
        this.calculateAverage();
      }
    });

    onSnapshot(playerDoc, (docSnap: any) => {
      const data = docSnap.data();
      if (data) {
        this.selectedVote = data['vote'];
      }
    });

    this.heartbeatInterval = setInterval(() => {
      updateDoc(playerDoc, { lastActive: Date.now() });
    }, 5000);

    window.addEventListener('beforeunload', this.handleLeave);
  }

  get votedCount(): number {
    return this.players.filter(p => p.vote !== null).length;
  }

  get totalPlayers(): number {
    return this.players.length;
  }

  calculateAverage(): void {
    const numericVotes = this.players
      .map((p) => parseFloat(p.vote || ''))
      .filter((v) => !isNaN(v));

    if (numericVotes.length) {
      const sum = numericVotes.reduce((acc, val) => acc + val, 0);
      this.averageVote = parseFloat((sum / numericVotes.length).toFixed(2));
    } else {
      this.averageVote = null;
    }
  }

  selectVote(value: string) {
    this.selectedVote = value;
    const voteRef = doc(this.firestore, `rooms/${this.roomId}/players/${this.userName}`);
    updateDoc(voteRef, { vote: value });
  }

  async resetVotes() {
    const playersRef = collection(this.firestore, `rooms/${this.roomId}/players`);
    const snapshot = await getDocs(playersRef);

    snapshot.forEach((docSnap: any) => {
      const playerRef = doc(this.firestore, `rooms/${this.roomId}/players/${docSnap.id}`);
      updateDoc(playerRef, { vote: null });
    });

    const roomDoc = doc(this.firestore, `rooms/${this.roomId}`);
    await updateDoc(roomDoc, { showVotes: false });

    this.selectedVote = null;
    this.averageVote = null;
  }

  toggleReveal() {
    const roomDoc = doc(this.firestore, `rooms/${this.roomId}`);
    updateDoc(roomDoc, { showVotes: !this.showVotes });
  }

  handleLeave = async () => {
    const playerRef = doc(this.firestore, `rooms/${this.roomId}/players/${this.userName}`);
    await deleteDoc(playerRef);

    const playersRef = collection(this.firestore, `rooms/${this.roomId}/players`);
    const snapshot = await getDocs(playersRef);

    if (snapshot.empty) {
      const roomDoc = doc(this.firestore, `rooms/${this.roomId}`);
      await updateDoc(roomDoc, {
        roomClosedAt: Date.now(),
      });
    }
  };

  ngOnDestroy(): void {
    this.unsubscribePlayers();
    this.unsubscribeRoom();
    clearInterval(this.heartbeatInterval);
    this.handleLeave();
    window.removeEventListener('beforeunload', this.handleLeave);
  }
}
