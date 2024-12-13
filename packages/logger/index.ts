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

type LoggerOptions = {
  package?: string;
  component?: string;
};

const createBaseLogger = (opts: LoggerOptions = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  const monorepoRoot = findMonorepoRoot();
  const logPath = path.join(monorepoRoot, 'packages', 'logger', 'logs');

  const baseConfig = {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label: string) => ({ level: label })
    },
    base: {
      env: process.env.NODE_ENV,
      ...(opts.package ? { package: opts.package } : {}),
      ...(opts.component ? { component: opts.component } : {})},
    ...opts
  };

  if (isTest || !isDevelopment) {
    const logFile = path.join(logPath, `${new Date().toISOString().split('T')[0]}.log`);
    
    return pino(
      baseConfig,
      pino.destination({
        dest: logFile,
        sync: false,
        mkdir: true,
        append: true,
        minLength: 4096,
        maxLength: 16384,
        periodicFlush: 10000,
        mode: 0o644,
        contentMode: 'utf8',
        retryEAGAIN: (err, writeBufferLen) => writeBufferLen < 16384
      })
    );
  }

  return pino({
    ...baseConfig,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  });
};

export const createAppLogger = (component: string) => createBaseLogger({ package: 'app', component });
export const logger = createBaseLogger();
export default logger;