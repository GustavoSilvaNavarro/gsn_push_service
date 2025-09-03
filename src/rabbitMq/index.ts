import { logger } from '@adapters';
import type { ChannelModel } from 'amqplib';

import { EvseListener } from './consumers/evseListener';
import { setupDLQ } from './dlq';
// import type { Connection } from 'rabbitmq-client';

// import { EvseListener } from './consumers/evse';

// ? Modern rabbitMQ client
// export const startRabbitMqListeners = (rbtmqc: Connection) => {
//   const evseList = new EvseListener(rbtmqc);
//   evseList.subscribing();

//   logger.info('🚀 RabbitMQs listener has started.');
//   return evseList;
// };

// NOTE: Connection using amqplib library
export const startRabbitMqListeners = async (rbtmqc: ChannelModel) => {
  const dlqChannel = await rbtmqc.createChannel();
  await setupDLQ(dlqChannel);

  const evseList = new EvseListener(rbtmqc);
  await evseList.subscribing();

  logger.info('🚀 RabbitMQs listener has started.');
  return evseList;
};
