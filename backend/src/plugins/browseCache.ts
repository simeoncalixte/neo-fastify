import { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    browseCache: Map<string, any>;
  }
}

const browseCache: FastifyPluginAsync = async (fastify) => {
  // Simple in-memory cache keyed by the `links.self` URL returned from NASA browse responses
  fastify.decorate('browseCache', new Map<string, any>());
};

export default browseCache;
