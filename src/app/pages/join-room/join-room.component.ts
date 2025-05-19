import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { FirebaseApp } from '@angular/fire/app';

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.scss']
})
export class JoinRoomComponent {
  name = '';
  roomCode = '';
  customVotes = '';

  private router = inject(Router);
  private app = inject(FirebaseApp);

  async joinRoom() {
    if (!this.name || !this.roomCode) return;

    localStorage.setItem('userName', this.name);

    const firestore = getFirestore(this.app);
    const roomDoc = doc(firestore, `rooms/${this.roomCode}`);

    const parsedVotes = this.customVotes
      .split(',')
      .map(v => v.trim())
      .filter(v => v !== '');

    const voteValues = parsedVotes.length ? parsedVotes : ['1', '2', '3', '5', '8'];
    voteValues.sort((a,b) => +a - +b);
    
    await setDoc(roomDoc, {
      showVotes: false,
      voteValues
    }, { merge: true });

    this.router.navigate(['/room', this.roomCode]);
  }

  generateRoomCode() {
    this.roomCode = Math.floor(100000 + Math.random() * 900000).toString();
  }
}
