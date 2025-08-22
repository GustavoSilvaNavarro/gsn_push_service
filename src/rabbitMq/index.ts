import { logger } from '@adapters';
import type { Connection } from 'rabbitmq-client';

import { EvseListener } from './consumers/evse';

export const startRabbitMqListeners = (rbtmqc: Connection) => {
  new EvseListener(rbtmqc).subscribing();

  logger.info('🚀 RabbitMQs listener has started.');
};
