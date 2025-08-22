import { logger } from '@adapters';
import { Connection } from 'rabbitmq-client';

import { RABBITMQ_URL } from './config';
import { startRabbitMqListeners } from './rabbitMq';

type Connections = {
  rbtmqc: Connection;
};

let rbtmqc = new Connection(RABBITMQ_URL);

export const startRabbitMqConnection = () => {
  rbtmqc = new Connection(RABBITMQ_URL);

  return rbtmqc;
};

export const createConnections = (): Connections => {
  startRabbitMqConnection(); // Nats connection
  startRabbitMqListeners(rbtmqc);

  return { rbtmqc };
};

export const closeConnections = async () => {
  logger.warn('😩 Closing RabbitMQ connection');
  await rbtmqc.close();
};
