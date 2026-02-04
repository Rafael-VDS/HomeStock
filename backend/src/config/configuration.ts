export interface DatabaseConfig {
  url: string;
}

export interface AppConfig {
  port: number;
  jwtSecret: string;
  nodeEnv: string;
}

export const getDatabaseConfig = (): DatabaseConfig => ({
  url: process.env.DATABASE_URL || '',
});

export const getAppConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
});
