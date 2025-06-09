import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AllRoomsService } from 'src/app/shared/services/all-rooms.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-all-rooms',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './all-rooms.component.html',
  styleUrl: './all-rooms.component.scss'
})
export class AllRoomsComponent implements OnInit {
  rooms$!: Observable<{ roomId: string; data: any; playerCount: number }[]>;

  constructor(public allRoomsService: AllRoomsService) {}

  ngOnInit(): void {
    this.rooms$ = this.allRoomsService.getAllRoomsLive();
  }
}