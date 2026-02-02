import { FastifyReply, FastifyRequest } from 'fastify';

export function asyncHandler(fn: (request: FastifyRequest, reply: FastifyReply) => Promise<any>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      return await fn(request, reply);
    } catch (err: any) {
      const message = err?.message || 'Internal server error';
      reply.status(500).send({ success: false, error: message });
    }
  };
}
