import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LobbyComponent } from './pages/lobby/lobby.component';
import { CreateRoomComponent } from './pages/create-room/create-room.component';
import { JoinRoomComponent } from './pages/join-room/join-room.component';
import { RoomComponent } from 'src/app/pages/room/room.component';
import { CleanupComponent } from 'src/app/pages/cleanup/cleanup.component';
import { NotFoundComponent } from 'src/app/pages/not-found/not-found.component';
import { AllRoomsComponent } from './pages/all-rooms/all-rooms.component';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'create-room', component: CreateRoomComponent },
  { path: 'join-room', component: JoinRoomComponent },
  { path: 'room/:roomId', component: RoomComponent },
  { path: 'list-rooms', component: AllRoomsComponent},
  { path: 'delete', component: CleanupComponent },
  { path: '**', component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
