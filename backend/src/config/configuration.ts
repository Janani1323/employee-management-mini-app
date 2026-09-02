export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendOrigin: string;
  simulateCreateFailures: boolean;
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.BACKEND_PORT ?? '3000', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200',
  simulateCreateFailures: process.env.SIMULATE_CREATE_FAILURES === 'true',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'employee_management',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
  },
});
