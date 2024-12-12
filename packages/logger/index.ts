import pino from 'pino';
import path from 'path';

const findMonorepoRoot = () => {
  let currentPath = process.cwd();
  
  while (currentPath !== '/') {
    if (currentPath.endsWith('/packages')) {
      return path.dirname(currentPath);
    }
    if (path.basename(currentPath) === 'app' || path.basename(currentPath) === 'database') {
      return path.dirname(path.dirname(currentPath));
    }
    currentPath = path.dirname(currentPath);
  }
  
  return process.cwd();
};

const createBaseLogger = (opts: {package?: string, component?: string } = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest || !isDevelopment) {
    return pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label })
      },
      base: {
        env: process.env.NODE_ENV,
        package: opts.package || 'unknown'
      },
      ...opts
    });
  }

  return pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label })
      },
      base: {
        env: process.env.NODE_ENV,
        package: opts.package || 'unknown'
      },
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      },
      ...opts
    }
  );
};

export const createAppLogger = (component: string) => createBaseLogger({ package: 'app', component });
// export const createDatabaseLogger = (component: string) => createBaseLogger({ package: 'database', component });
export const logger = createBaseLogger();
export default logger;