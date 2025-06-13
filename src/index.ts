import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import fs from 'fs';
import path from 'path';
import { resolvers } from './graphql/resolvers';

const typeDefs = fs.readFileSync(path.join(__dirname, 'graphql', 'schema.graphql'), 'utf-8');

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
  console.log(`🚀 Server ready at ${url}`);
}

startServer();
