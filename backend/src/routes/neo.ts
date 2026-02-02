import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';
import NeoService from '../services/neo.service';
import {
  NEOBrowseResponseSchema,
  NEOFeedResponseSchema,
  NEOSchema,
} from '../schema/neo.schemas';
import { withCache } from '../decorators/cache';

const ErrorSchema = Type.Object({ success: Type.Boolean(), message: Type.String() });

// Cache configuration: 5 minutes TTL for all routes
const feedCache = withCache({ ttl: 5 * 60 * 1000 });
const browseCache = withCache({ ttl: 5 * 60 * 1000 });
const lookupCache = withCache({ ttl: 5 * 60 * 1000 });

export default async function neoRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/feed',
    {
      schema: {
        response: {
          200: Type.Object({ success: Type.Boolean(), data: NEOFeedResponseSchema }),
          400: ErrorSchema,
        },
      },
    },
    feedCache(async (request: FastifyRequest, reply: FastifyReply) => {
      const qs = request.query as any;
      const { start_date, end_date } = qs;
      if (!start_date || !end_date) {
        return reply.status(400).send({ success: false, message: 'start_date and end_date are required' });
      }

      try {
        const data = await NeoService.NeoFeed(start_date, end_date);
        return { success: true, data };
      } catch (err: any) {
        request.log.error(err);
        return reply.status(502).send({ success: false, message: 'Failed to fetch NEO feed' });
      }
    })
  );

  fastify.get(
    '/browse',
    {
      schema: {
        response: {
          200: Type.Object({ success: Type.Boolean(), data: NEOBrowseResponseSchema }),
          502: ErrorSchema,
        },
      },
    },
    browseCache(async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const qs = request.query as any;
        const page = qs?.page !== undefined ? parseInt(qs.page, 10) : 0;
        const size = qs?.size !== undefined ? parseInt(qs.size, 10) : 20;

        const data = await NeoService.getNeoBrowse(page, size);
        return { success: true, data };
      } catch (err: any) {
        reply.status(502).send({ success: false, message: 'Failed to fetch NEO browse' });
      }
    })
  );

  fastify.get(
    '/lookup/:id',
    {
      schema: {
        response: {
          200: Type.Object({ success: Type.Boolean(), data: NEOSchema }),
          400: ErrorSchema,
          502: ErrorSchema,
        },
      },
    },
    lookupCache(async (request: FastifyRequest, reply: FastifyReply) => {
      const params = request.params as any;
      const id = parseInt(params.id, 10);
      if (Number.isNaN(id)) {
        return reply.status(400).send({ success: false, message: 'id must be a number' });
      }

      try {
        const data = await NeoService.getNeoLookUp(id);
        return { success: true, data };
      } catch (err: any) {
        request.log.error(err);
        return reply.status(502).send({ success: false, message: 'Failed to fetch NEO lookup' });
      }
    })
  );
}
