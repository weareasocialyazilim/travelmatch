import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';
import { resolvers } from './resolvers/index.js';
import { createDataLoaders } from './loaders/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load GraphQL schema
const typeDefs = readFileSync(
  join(__dirname, 'schema', 'schema.graphql'),
  'utf-8'
);

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Create Express app
const app = express();
const httpServer = http.createServer(app);

// Context interface
interface GraphQLContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  supabase: typeof supabase;
  loaders: ReturnType<typeof createDataLoaders>;
  req: express.Request;
}

// Create Apollo Server
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    
    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      return {
        message: error.message,
        code: error.extensions?.code,
      };
    }
    
    return error;
  },
});

// Start server
await server.start();

// Middleware
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      // Extract JWT token from Authorization header
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      let user;
      if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          user = {
            id: data.user.id,
            email: data.user.email!,
            role: data.user.user_metadata?.role || 'user',
          };
        }
      }
      
      // Create DataLoaders for this request
      const loaders = createDataLoaders(supabase);
      
      return {
        user,
        supabase,
        loaders,
        req,
      };
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Start HTTP server
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📊 Apollo Studio: http://localhost:${PORT}/graphql`);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await server.stop();
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
