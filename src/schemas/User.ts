import { ObjectType, Field, ID } from 'type-graphql'

@ObjectType()
export class User {
  @Field((type) => ID)
  readonly id: number

  @Field((type) => String)
  name: string

  @Field((type) => String)
  email: string

  @Field((type) => String)
  googleId: string

  @Field()
  created: Date
}
