import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LobbyComponent } from './pages/lobby/lobby.component';
import { RoomComponent } from 'src/app/pages/room/room.component';
import { CleanupComponent } from 'src/app/pages/cleanup/cleanup.component';
import { NotFoundComponent } from 'src/app/pages/not-found/not-found.component';
import { JoinRoomComponent } from './pages/join-room/join-room.component';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'joinRoom', component: JoinRoomComponent },
  { path: 'room/:roomId', component: RoomComponent },
  { path: 'delete', component: CleanupComponent },
  { path: '**', component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
