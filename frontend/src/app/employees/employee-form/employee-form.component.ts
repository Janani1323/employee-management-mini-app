import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { EmployeeStatus } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';
import { ErrorMessageService } from '../../core/services/error-message.service';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { DEPARTMENTS } from '../employee-list/employee-list.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ErrorBannerComponent, LoadingSpinnerComponent],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly departments = DEPARTMENTS;
  readonly employeeId = signal<string | null>(null);
  readonly loadingEmployee = signal(false);
  readonly loadError = signal('');
  readonly submitting = signal(false);
  readonly submitError = signal('');

  get isEditMode(): boolean {
    return this.employeeId() !== null;
  }

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    department: ['', [Validators.required]],
    designation: ['', [Validators.required, Validators.maxLength(100)]],
    salary: [0, [Validators.required, Validators.min(0.01)]],
    joiningDate: ['', [Validators.required]],
    status: ['Active' as EmployeeStatus, [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }
    this.employeeId.set(id);
    this.loadingEmployee.set(true);
    this.employeeService.getOne(id).subscribe({
      next: (employee) => {
        this.form.patchValue({
          name: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          salary: employee.salary,
          joiningDate: employee.joiningDate,
          status: employee.status,
        });
        this.loadingEmployee.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loadError.set(this.errorMessageService.toUserMessage(error));
        this.loadingEmployee.set(false);
      },
    });
  }

  submit(): void {
    // Guards against duplicate submissions from a double-click or repeated
    // Enter while a request is already in flight.
    if (this.submitting() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');
    const dto = this.form.getRawValue();

    const request$ = this.isEditMode
      ? this.employeeService.update(this.employeeId()!, dto)
      : this.employeeService.create(dto);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error: HttpErrorResponse) => {
        // Never reset the form here — the user's valid input stays in place
        // so they can retry without retyping anything.
        this.submitError.set(this.errorMessageService.toUserMessage(error));
      },
    });
  }
}
