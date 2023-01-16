import { generateOpenApiDocument } from 'trpc-openapi';

import { appRouter } from './api/root';

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Open API for T3 Todo List',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  baseUrl: '/api',
});