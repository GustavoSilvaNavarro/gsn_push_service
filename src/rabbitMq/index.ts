import { logger } from '@adapters';
import type { Connection } from 'rabbitmq-client';

import { EvseListener } from './consumers/evse';

export const startRabbitMqListeners = (rbtmqc: Connection) => {
  const evseList = new EvseListener(rbtmqc);
  evseList.subscribing();

  logger.info('🚀 RabbitMQs listener has started.');
  return evseList;
};
