import { startServer } from './app';
import { logger } from './utils/logger';

startServer().catch((error) => {
  logger.error('Failed to start server', {
    message: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});
