import { RABBITMQ_EXCHANGE_NAME, RABBITMQ_QUEUE_NAME } from '@config';
import { type Channel } from 'amqplib';

export async function setupDLQ(channel: Channel) {
  await channel.assertExchange(RABBITMQ_EXCHANGE_NAME, 'topic', { durable: true });
  await channel.assertExchange('evse.dlx', 'topic', { durable: true });

  await channel.assertQueue(RABBITMQ_QUEUE_NAME, {
    durable: true,
    deadLetterExchange: 'evse.dlx',
    deadLetterRoutingKey: 'dlq',
  }); // automatic dlq setup
  await channel.bindQueue(RABBITMQ_QUEUE_NAME, RABBITMQ_EXCHANGE_NAME, 'evse.*');

  await channel.assertQueue('evse.dlq', { durable: true });
  await channel.bindQueue('evse.dlq', 'evse.dlx', 'dlq');
}
