import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { WaitingActionComponent } from './waiting-action.component';

@Component({
  selector: 'waiting-room-component',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    WaitingActionComponent
  ],
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingRoomComponent {
  onViewServices() {
    window.open('/game', '_blank');
  }
  onGetSupport() {
    window.open('https://qa.library.sinapsis.holadoc.com', '_blank');
  }
  onManageAccount() {
    window.open('https://qa.register.sinapsis.holadoc.com/#/site/home', '_blank');
  }
  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
