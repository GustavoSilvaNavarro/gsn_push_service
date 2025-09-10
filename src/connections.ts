import { logger } from '@adapters';
import { connectDb } from '@adapters/db';
import type { PrismaClient } from '@prisma/client';
import amqplib, { type ChannelModel } from 'amqplib';

// import { Connection } from 'rabbitmq-client';
import { RABBITMQ_URL } from './config';
import { startRabbitMqListeners } from './rabbitMq';
import type { EvseListener } from './rabbitMq/consumers/amqp/evseListener';

type Connections = {
  // rbtmqc: Connection; // modern rabbitMQ
  rbtmqc: ChannelModel;
  evseSub: EvseListener;
  db: PrismaClient;
};

// let rbtmqc = new Connection(RABBITMQ_URL);

// ? Ned RabbitMQ
// export const startRabbitMqConnection = () => {
//   rbtmqc = new Connection(RABBITMQ_URL);

//   return rbtmqc;
// };

export const connectToToRabbitMQ = async () => {
  const rbtmqc = await amqplib.connect(RABBITMQ_URL);
  return rbtmqc;
};

export const createConnections = async (): Promise<Connections> => {
  // startRabbitMqConnection();
  const rbtConn = await connectToToRabbitMQ();
  const evseSub = await startRabbitMqListeners(rbtConn);
  const db = await connectDb();

  return { rbtmqc: rbtConn, evseSub, db };
};

export const closeConnections = async ({ evseSub, db }: Connections) => {
  logger.warn('😩 Closing RabbitMQ connection');
  await evseSub.shutdown();
  await db.$disconnect();
};
