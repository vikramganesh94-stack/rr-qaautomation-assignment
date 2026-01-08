import pino from 'pino';

const transport = pino.transport({
  targets: [
    {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname' },
      level: 'info',
    },
    {
      target: 'pino/file',
      options: { destination: 'logs/tests.log', mkdir: true },
      level: 'debug',
    },
  ],
});

export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' }, transport);

// Export as both 'logger' and 'log' for convenience
export const log = logger;

export const step = async (message: string, fn: () => Promise<void> | void) => {
  logger.info(message);
  await fn();
};
