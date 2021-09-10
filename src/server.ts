import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { Resolver, Query, buildSchema } from 'type-graphql'
import { PrismaClient } from '@prisma/client'
import { Container, Service } from 'typedi'

import { User } from './schemas/User'
import { UserResolver } from './resolvers/UserResolver'

const prismaClient = new PrismaClient()

Container.set({ id: "PRISMA_CLIENT", factory: () => prismaClient })

const bootstrap = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    container: Container
  })

  const server = new ApolloServer({ schema })
  server.listen({ port: 4000 })
  console.log(`Listening to port 4000`)
}

bootstrap()
