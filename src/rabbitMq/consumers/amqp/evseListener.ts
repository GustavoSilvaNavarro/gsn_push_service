// NOTE: This is the same listener as evse.ts, but using amqplib to work with rabbitMq
import { logger } from '@adapters';
import { RABBITMQ_EXCHANGE_NAME, RABBITMQ_QUEUE_NAME } from '@config';
import type { OcppMessagesEvent } from '@interfaces';
import { insertNewMsg } from '@services';
import { type Channel, type ChannelModel, type ConsumeMessage } from 'amqplib';

export class EvseListener {
  private rbtconn: ChannelModel;
  private channel: Channel;

  constructor(rbtmqc: ChannelModel) {
    this.rbtconn = rbtmqc;
  }

  async subscribing() {
    this.channel = await this.rbtconn.createChannel();

    await this.channel.assertExchange(RABBITMQ_EXCHANGE_NAME, 'topic', { durable: true });
    await this.channel.assertQueue(RABBITMQ_QUEUE_NAME, {
      durable: true,
      deadLetterExchange: 'evse.dlx',
      deadLetterRoutingKey: 'dlq',
    }); // configuring automatic dlq
    await this.channel.bindQueue(RABBITMQ_QUEUE_NAME, RABBITMQ_EXCHANGE_NAME, 'evse.*');

    await this.channel.prefetch(2);

    await this.channel.consume(
      RABBITMQ_QUEUE_NAME,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const body = JSON.parse(msg.content.toString()) as OcppMessagesEvent;
          const newEvent = await insertNewMsg(body, msg.fields.routingKey);
          logger.info(newEvent);

          this.channel.ack(msg);
        } catch (err) {
          logger.error(err, 'Consumer error');
          const retries = (msg.properties?.headers?.['x-retry'] as number | undefined) ?? 0;

          if (retries < 5) {
            logger.warn(`Retrying message (attempt ${retries + 1})`);

            // Re-publish the message to the same exchange/queue
            this.channel.publish(msg.fields.exchange, msg.fields.routingKey, msg.content, {
              headers: { ...msg.properties.headers, 'x-retry': retries + 1 },
              persistent: true,
            });

            this.channel.ack(msg);
          } else {
            logger.warn('Message failed after 5 retries, sending to DLQ');
            this.channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false },
    );
  }

  async shutdown() {
    logger.info('🔥 Closing EVSE consumer...');
    if (this.channel) await this.channel.close();
    if (this.rbtconn) await this.rbtconn.close();
  }
}
