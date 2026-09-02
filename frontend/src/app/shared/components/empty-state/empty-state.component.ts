import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <p>{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .empty-state {
        padding: 3rem 1rem;
        text-align: center;
        color: #666;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() message = 'Nothing to show here yet.';
}
