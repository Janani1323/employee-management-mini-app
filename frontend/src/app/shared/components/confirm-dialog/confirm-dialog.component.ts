import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div class="backdrop" (click)="cancel.emit()">
        <div class="dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
          <p>{{ message }}</p>
          <div class="actions">
            <button type="button" class="secondary" (click)="cancel.emit()">Cancel</button>
            <button type="button" class="danger" (click)="confirm.emit()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .dialog {
        background: #fff;
        border-radius: 8px;
        padding: 1.5rem;
        max-width: 360px;
        width: 90%;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.25rem;
      }
      button {
        border: none;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
      }
      .secondary {
        background: #eee;
        color: #333;
      }
      .danger {
        background: #c62828;
        color: #fff;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Delete';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
