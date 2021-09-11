import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { PrismaClient } from '@prisma/client'
import { Container } from 'typedi'
import express from 'express'
import { createClient } from 'redis'

import { UserResolver } from './resolvers/UserResolver'
import googleOAuthRoutes from './auth/googleOAuth'
import { authorizeToken } from './auth/jwt'

const app = express()

app.use('/auth', googleOAuthRoutes)

// Create and register Prisma client
const prismaClient = new PrismaClient()
Container.set({ id: 'PRISMA_CLIENT', factory: () => prismaClient })

// Create and register Redis client
const initRedis = async () => {
  const client = createClient()
  client.on('error', (err) => console.error(`Redis error: ${err}`))
  await client.connect()
  Container.set({ id: 'REDIS_CLIENT', factory: () => client })
}

const bootstrap = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    container: Container
  })

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      const context = {
        req,
        user: req.user
      }
      return context
    }
  })

  app.use('/graphql', authorizeToken)

  app.get('/test', authorizeToken, (req, res) => {
    res.send({ message: 'Token is found!', user: req.user })
  })

  await server.start()
  server.applyMiddleware({ app })

  app.listen({ port: 4000 })
  console.log(`Listening to port 4000`)
}

const init = async () => {
  await initRedis()
  await bootstrap()
}

init()
