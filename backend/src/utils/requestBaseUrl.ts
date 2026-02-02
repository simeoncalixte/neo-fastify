import type { FastifyRequest } from 'fastify';

export function getRequestBaseUrl(request: FastifyRequest): string {
  const protoHeader = request.headers['x-forwarded-proto'];
  const hostHeader = request.headers['x-forwarded-host'] ?? request.headers['host'];

  const proto = Array.isArray(protoHeader)
    ? protoHeader[0]
    : (protoHeader ? String(protoHeader) : (request.protocol || 'http'));

  const host = Array.isArray(hostHeader) ? hostHeader[0] : (hostHeader ? String(hostHeader) : request.hostname);

  return `${proto}://${host}`.replace(/\/$/, '');
}
