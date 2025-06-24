import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
