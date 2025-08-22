import { logger } from '@adapters/logger';
import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const prisma = new PrismaClient();

const prismaPluginSetup = async (fastify: FastifyInstance, _opts: unknown) => {
  try {
    await prisma.$connect();

    fastify.decorate('prisma', prisma);
    fastify.log.info('🔥 Prisma - Connection to db has been established successfully.');

    fastify.addHook('onClose', async (instance) => {
      fastify.log.error('Disconnecting Prisma client...');
      await instance.prisma.$disconnect();
    });
  } catch (err) {
    logger.error(err, 'Connection to DB has failed 😭');
    throw err;
  }
};

export const prismaPlugin = fp(prismaPluginSetup, { name: 'prisma-plugin' });
