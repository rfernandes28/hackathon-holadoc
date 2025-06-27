import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'waiting-action',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="waiting-action">
      <div class="waiting-action-info">
        <strong>{{ title }}</strong>
        <p>{{ description }}</p>
        <button mat-stroked-button color="primary" (click)="buttonClick.emit()">{{ buttonText }}</button>
      </div>
      <img [src]="image" [alt]="title" class="waiting-action-img">
    </div>
  `,
  styleUrls: ['./waiting-room.component.scss']
})
export class WaitingActionComponent {
  @Input() title!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() buttonText!: string;
  @Output() buttonClick = new EventEmitter<void>();
}
