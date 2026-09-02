import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employees/employee-list/employee-list.component';

export const routes: Routes = [
  { path: '', component: EmployeeListComponent },
  {
    path: 'employees/new',
    loadComponent: () =>
      import('./employees/employee-form/employee-form.component').then(
        (m) => m.EmployeeFormComponent,
      ),
  },
  {
    path: 'employees/:id/edit',
    loadComponent: () =>
      import('./employees/employee-form/employee-form.component').then(
        (m) => m.EmployeeFormComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
