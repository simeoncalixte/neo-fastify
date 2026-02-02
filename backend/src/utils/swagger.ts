import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import swaggerPlugin from '@fastify/swagger';
import swaggerUiPlugin from '@fastify/swagger-ui';

export async function registerSwagger(fastify: FastifyInstance): Promise<void> {
  try {
    // Use static imports for swagger plugins in containerized builds
    // (removed inline/dynamic imports)

    // Register OpenAPI generator
    await fastify.register(swaggerPlugin, {
     mode: "dynamic",
      openapi: {
        info: {
          title: "ShueApp API",
          description: "Fastify API for ShueApp — auto-generated OpenAPI spec",
          version: "1.0.0",
        },
      },
    });

    // Register Swagger UI
    await fastify.register(swaggerUiPlugin, {
      routePrefix: "/documentation",
      uiConfig: {
        docExpansion: "none", // collapse all endpoints
        defaultModelsExpandDepth: -1, // hide schemas
        defaultModelExpandDepth: 2,
        displayRequestDuration: true,
        filter: true,
        deepLinking: false,
      },
      uiHooks: {
        onRequest: (request: FastifyRequest, reply: FastifyReply, next: (err?: Error) => void) => {
          next();
        },
        preHandler: (request: FastifyRequest, reply: FastifyReply, next: (err?: Error) => void) => {
          next();
        },
      },
      staticCSP: true,
      transformStaticCSP: (header: string) => header,
      transformSpecification: (
        swaggerObject: any,
        request: any,
        reply: any
      ) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });
  } catch (e) {
    fastify.log.warn(`Swagger plugins not registered: ${String(e)}`);
  }

  return;
}
