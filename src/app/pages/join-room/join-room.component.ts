import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  joinRoom() {
    if (!this.name || !this.roomCode) return;

    localStorage.setItem('userName', this.name);
    this.router.navigate(['/room', this.roomCode]);
  }

  generateRoomCode() {
    this.roomCode = Math.floor(100000 + Math.random() * 900000).toString();
  }
}
