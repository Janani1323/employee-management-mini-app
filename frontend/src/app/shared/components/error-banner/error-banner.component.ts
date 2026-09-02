import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  template: `
    <div class="error-banner" role="alert">
      <span>{{ message }}</span>
      @if (showRetry) {
        <button type="button" (click)="retry.emit()">Try again</button>
      }
    </div>
  `,
  styles: [
    `
      .error-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        background: #fdecea;
        color: #611a15;
        border: 1px solid #f5c6cb;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
      }
      button {
        background: #611a15;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 0.4rem 0.9rem;
        cursor: pointer;
        white-space: nowrap;
      }
      button:hover {
        opacity: 0.9;
      }
    `,
  ],
})
export class ErrorBannerComponent {
  @Input() message = 'Something went wrong. Please try again.';
  @Input() showRetry = true;
  @Output() retry = new EventEmitter<void>();
}
