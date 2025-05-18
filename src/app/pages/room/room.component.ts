import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FirebaseApp } from '@angular/fire/app';

import { collection, doc, getFirestore, onSnapshot, setDoc, updateDoc, deleteDoc, Firestore, getDoc, getDocs } from 'firebase/firestore';

interface Player { id: string; name: string; vote: string | null; joinedAt: any; lastActive: number; }

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
  voteValues: string[] = ['1', '2', '3', '5', '8'];
  showVotes = false;
  selectedVote: string | null = null;

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

    // Set initial player 
    setDoc(playerDoc, {
      name: this.userName,
      joinedAt: new Date(),
      vote: null,
      lastActive: Date.now()
    });

    // Initialize room if it doesn't exist
    getDoc(roomDoc).then((docSnap) => {
      if (!docSnap.exists()) {
        setDoc(roomDoc, { showVotes: false });
      }
    });

    // Real-time room voting state
    this.unsubscribeRoom = onSnapshot(roomDoc, (docSnap) => {
      const data = docSnap.data();
      if (data && typeof data['showVotes'] === 'boolean') {
        this.showVotes = data['showVotes'];
      }
    });

    // Real-time players
    this.unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      this.players = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Player))
        .filter(player => Date.now() - player.lastActive < 10000);
    });

    // Real-time listener for current user's vote
    onSnapshot(playerDoc, (docSnap) => {
      const data = docSnap.data();
      if (data) {
        this.selectedVote = data['vote'];
      }
    });

    // Heartbeat
    this.heartbeatInterval = setInterval(() => {
      updateDoc(playerDoc, { lastActive: Date.now() });
    }, 5000);

    window.addEventListener('beforeunload', this.handleLeave);
  }

  selectVote(value: string) {
    this.selectedVote = value;
    const voteRef = doc(this.firestore, `rooms/${this.roomId}/players/${this.userName}`);
    updateDoc(voteRef, { vote: value });
  }

  async resetVotes() {
    const playersRef = collection(this.firestore, `rooms/${this.roomId}/players`);
    const snapshot = await getDocs(playersRef);

    snapshot.forEach((docSnap) => {
      const playerRef = doc(this.firestore, `rooms/${this.roomId}/players/${docSnap.id}`);
      updateDoc(playerRef, { vote: null });
    });

    const roomDoc = doc(this.firestore, `rooms/${this.roomId}`);
    await updateDoc(roomDoc, { showVotes: false });

    this.selectedVote = null;
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
      await deleteDoc(roomDoc);
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
