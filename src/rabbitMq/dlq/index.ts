import { RABBITMQ_EXCHANGE_NAME, RABBITMQ_QUEUE_NAME } from '@config';
import { type Channel } from 'amqplib';

export async function setupDLQ(channel: Channel) {
  // Main exchange
  await channel.assertExchange(RABBITMQ_EXCHANGE_NAME, 'topic', { durable: true });

  // Dead-letter exchange
  await channel.assertExchange('evse.dlx', 'topic', { durable: true });

  // Main queue
  await channel.assertQueue(RABBITMQ_QUEUE_NAME, {
    durable: true,
    // Optionally you can set deadLetterExchange here if you want auto DLX on nack without retries
  });
  await channel.bindQueue(RABBITMQ_QUEUE_NAME, RABBITMQ_EXCHANGE_NAME, 'evse.*');

  // Dead-letter queue
  await channel.assertQueue('evse.dlq', { durable: true });
  await channel.bindQueue('evse.dlq', 'evse.dlx', 'dlq');
}
