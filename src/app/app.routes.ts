import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JoinRoomComponent } from './pages/join-room/join-room.component';
import { RoomComponent } from './pages/room/room.component';
import { CleanupComponent } from './pages/cleanup/cleanup.component';

export const routes: Routes = [
  { path: '', component: JoinRoomComponent },
  { path: 'room/:roomId', component: RoomComponent },
  { path: 'delete', component: CleanupComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
