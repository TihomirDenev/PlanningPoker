import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { JoinRoomComponent } from 'src/app/pages/join-room/join-room.component';
import { RoomComponent } from 'src/app/pages/room/room.component';
import { CleanupComponent } from 'src/app/pages/cleanup/cleanup.component';
import { NotFoundComponent } from 'src/app/pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: JoinRoomComponent },
  { path: 'room/:roomId', component: RoomComponent },
  { path: 'delete', component: CleanupComponent },
  { path: '**', component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
