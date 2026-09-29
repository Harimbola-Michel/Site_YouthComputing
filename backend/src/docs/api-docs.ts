import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '@config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Youth Computing API',
      version: '1.0.0',
      description: 'API pour la plateforme Youth Computing',
      contact: {
        name: 'Youth Computing',
        email: 'contact@youthcomputing.mg',
      },
      license: {
        name: 'Private',
        url: 'https://youthcomputing.mg',
      },
    },
    servers: [
      {
        url: `${env.BACKEND_URL || 'http://localhost:8000'}/api`,
        description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;