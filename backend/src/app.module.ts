import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration, { AppConfig } from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { Employee } from './employees/entities/employee.entity';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<{ db: AppConfig['db'] }, true>) => {
        const db = configService.get('db', { infer: true });
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          entities: [Employee],
          synchronize: false,
          logging: ['error', 'warn'] as const,
        };
      },
    }),
    EmployeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
