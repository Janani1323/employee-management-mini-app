import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-wrap" role="status" aria-live="polite">
      <div class="spinner"></div>
      <span>Loading…</span>
    </div>
  `,
  styles: [
    `
      .spinner-wrap {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 2rem;
        color: #555;
        justify-content: center;
      }
      .spinner {
        width: 20px;
        height: 20px;
        border: 3px solid #ddd;
        border-top-color: #3f51b5;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {}
