import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap } from 'rxjs';

import { Employee, EmployeeStatus } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';
import { ErrorMessageService } from '../../core/services/error-message.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

// Kept in sync with the values the seed script generates (backend/src/database/seed).
// A larger app would fetch this list from the API instead of hardcoding it.
export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
  'Legal',
];

type ViewState = 'loading' | 'loaded' | 'empty' | 'error';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly departments = DEPARTMENTS;

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly departmentControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl<'' | EmployeeStatus>('', { nonNullable: true });

  readonly employees = signal<Employee[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = PAGE_SIZE;
  readonly viewState = signal<ViewState>('loading');
  readonly errorMessage = signal('');
  readonly deleteTargetId = signal<string | null>(null);
  readonly deleteError = signal('');

  private readonly refresh$ = new Subject<void>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.resetToFirstPageAndReload());

    this.departmentControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resetToFirstPageAndReload());

    this.statusControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resetToFirstPageAndReload());

    this.refresh$
      .pipe(
        startWith(void 0),
        switchMap(() => {
          this.viewState.set('loading');
          return this.employeeService.list(this.buildQuery()).pipe(
            catchError((error: HttpErrorResponse) => {
              this.errorMessage.set(this.errorMessageService.toUserMessage(error));
              this.viewState.set('error');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.employees.set(result.items);
        this.total.set(result.total);
        this.viewState.set(result.items.length === 0 ? 'empty' : 'loaded');
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.refresh$.next();
  }

  retry(): void {
    this.refresh$.next();
  }

  requestDelete(id: string): void {
    this.deleteError.set('');
    this.deleteTargetId.set(id);
  }

  cancelDelete(): void {
    this.deleteTargetId.set(null);
  }

  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (!id) {
      return;
    }
    this.employeeService.delete(id).subscribe({
      next: () => {
        this.deleteTargetId.set(null);
        // If we just deleted the last row on a page beyond page 1, step back a page.
        if (this.employees().length === 1 && this.page() > 1) {
          this.page.set(this.page() - 1);
        }
        this.refresh$.next();
      },
      error: (error: HttpErrorResponse) => {
        this.deleteError.set(this.errorMessageService.toUserMessage(error));
      },
    });
  }

  private resetToFirstPageAndReload(): void {
    this.page.set(1);
    this.refresh$.next();
  }

  private buildQuery() {
    return {
      page: this.page(),
      pageSize: this.pageSize,
      search: this.searchControl.value || undefined,
      department: this.departmentControl.value || undefined,
      status: (this.statusControl.value || undefined) as EmployeeStatus | undefined,
    };
  }
}
