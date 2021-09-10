import { Resolver, Query } from 'type-graphql'
import { PrismaClient } from '@prisma/client'
import { Inject, Service } from 'typedi'

import { User } from '../schemas/User'

@Service()
@Resolver(of => User)
export class UserResolver {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prismaClient: PrismaClient
  ) {}
  
  @Query((returns) => [User])
  async allUsers() {
    return this.prismaClient.user.findMany()
  }
}
