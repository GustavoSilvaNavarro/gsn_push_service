import { logger } from '@adapters';
import { RABBITMQ_EXCHANGE_NAME, RABBITMQ_QUEUE_NAME } from '@config';
import type { OcppMessagesEvent } from '@interfaces';
import { insertNewMsg } from '@services';
import type { Connection, Consumer } from 'rabbitmq-client';

export class EvseListener {
  readonly rbtmqc: Connection;
  private sub?: Consumer;

  constructor(rbtmqc: Connection) {
    this.rbtmqc = rbtmqc;
  }

  subscribing() {
    this.sub = this.rbtmqc.createConsumer(
      {
        queue: RABBITMQ_QUEUE_NAME,
        queueOptions: { durable: true },
        qos: { prefetchCount: 2 },
        exchanges: [{ exchange: RABBITMQ_EXCHANGE_NAME, type: 'topic' }],
        queueBindings: [{ exchange: RABBITMQ_EXCHANGE_NAME, routingKey: 'evse.*' }],
      },
      async (msg) => {
        const newMsg = msg.body as OcppMessagesEvent;
        const newEvent = await insertNewMsg(newMsg, msg.routingKey);
        console.log(newEvent);
      },
    );

    this.sub.on('error', (err) => {
      logger.error(`consumer error (evse) => ${err}`);
    });
  }

  async shutdown() {
    if (this.sub) {
      console.log('Closing EVSE consumer…');
      await this.sub.close();
    }
  }
}
