import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'

const ALGORITHM = 'HS256'

export const generateJWT = (userId: string, expiresIn: string) => {
  return jwt.sign(userId, process.env.JSON_WEB_TOKEN_SECRET!, {
    algorithm: ALGORITHM
  })
}

export const authorizeToken = expressJwt({
  secret: process.env.JSON_WEB_TOKEN_SECRET!,
  algorithms: [ALGORITHM],
  credentialsRequired: false
})
