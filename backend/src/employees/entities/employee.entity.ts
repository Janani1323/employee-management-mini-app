import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeStatus } from '../enums/employee-status.enum';

// Additional indexes (name/trgm search, joining_date DESC + id ASC pagination order) are
// defined as raw SQL in the migration — TypeORM's @Index decorator can't express GIN/trgm
// indexes or per-column sort direction, and we rely on hand-written migrations, not sync.
@Entity({ name: 'employees' })
@Index('idx_employees_dept_status', ['department', 'status'])
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'varchar', length: 100 })
  designation: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  salary: string;

  @Column({ type: 'date', name: 'joining_date' })
  joiningDate: string;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    enumName: 'employee_status_enum',
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
