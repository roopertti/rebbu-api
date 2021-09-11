import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { PrismaClient } from '@prisma/client'
import { Container } from 'typedi'
import express from 'express'

import { UserResolver } from './resolvers/UserResolver'
import googleOAuthRoutes from './auth/googleOAuth'

const app = express()

app.use('/auth', googleOAuthRoutes)

// Create Prisma client, register it as a dependency
const prismaClient = new PrismaClient()
Container.set({ id: 'PRISMA_CLIENT', factory: () => prismaClient })

const bootstrap = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    container: Container
  })

  const server = new ApolloServer({ schema })
  await server.start()
  server.applyMiddleware({ app })

  app.listen({ port: 4000 })
  console.log(`Listening to port 4000`)
}

bootstrap()
