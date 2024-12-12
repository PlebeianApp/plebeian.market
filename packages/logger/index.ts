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
  const monorepoRoot = findMonorepoRoot();
  const logPath = path.join(monorepoRoot, 'packages', 'logger', 'logs');

  if (process.env.NODE_ENV === 'test') {
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

  const streams = isDevelopment 
    ? [{ 
        stream: pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        })
      }]
    : [{ 
      stream: pino.transport({
        target: 'pino-roll',
        options: {
          mkdir: true,
          file: path.join(logPath, 'log'),
          size: '10m',
          frequency: 'daily',
          compress: true,
          dateFormat: 'yyyy-MM-dd'
        }
      })
    }];

  return pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label })
      },
      base: {
        ...(opts.package ? { package: opts.package } : {}),
        ...(opts.component ? { component: opts.component } : {})
      },
      ...opts
    }, 
    pino.multistream(streams)
  );
};

export const createAppLogger = (component: string) => createBaseLogger({ package: 'app', component });
// export const createDatabaseLogger = (component: string) => createBaseLogger({ package: 'database', component });
export const logger = createBaseLogger();
export default logger;