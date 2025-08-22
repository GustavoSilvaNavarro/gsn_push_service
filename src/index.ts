import '@dotenvx/dotenvx/config';

import { logger } from '@adapters';
import { NAME } from '@config';
import { startServer } from '@server';
import { onExit } from 'signal-exit';

// Handle process errors
process.on('uncaughtException', (err) => {
  logger.error(err, 'uncaughtException');
  throw err;
});
process.on('unhandledRejection', (err) => logger.error(err, 'unhandledRejection'));

void (async () => {
  await startServer();

  logger.info(`${NAME} Service started and running`);

  onExit(() => {
    logger.error(`${NAME} Service is shutting down, closing connections...`);
  });
})();
