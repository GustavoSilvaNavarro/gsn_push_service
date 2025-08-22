import { logger } from '@adapters';
import type { PrismaClient } from '@prisma/client';
import { Connection } from 'rabbitmq-client';

import { RABBITMQ_URL } from './config';
import { startRabbitMqListeners } from './rabbitMq';
import type { EvseListener } from './rabbitMq/consumers/evse';

type Connections = {
  rbtmqc: Connection;
  evseSub: EvseListener;
  db: PrismaClient;
};

let rbtmqc = new Connection(RABBITMQ_URL);

export const startRabbitMqConnection = () => {
  rbtmqc = new Connection(RABBITMQ_URL);

  return rbtmqc;
};

export const createConnections = (): Connections => {
  startRabbitMqConnection(); // Nats connection
  const evseSub = startRabbitMqListeners(rbtmqc);

  return { rbtmqc, evseSub };
};

export const closeConnections = async ({ evseSub }: Connections) => {
  logger.warn('😩 Closing RabbitMQ connection');
  await evseSub.shutdown();
  await rbtmqc.close();
};
