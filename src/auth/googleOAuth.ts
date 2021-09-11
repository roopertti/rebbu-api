import { Router } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { URL } from 'url'
import { Container } from 'typedi'
import { PrismaClient, User } from '@prisma/client'
import differenceInSeconds from 'date-fns/differenceInSeconds'

import { GooglePersonResource } from '../types'
import { generateJWT } from './jwt'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

const router = Router()

const getGoogleAuthClient = () =>
  new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)

const getAuthorizedUrl = (client: OAuth2Client) =>
  client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  })

router.get('/google', (req, res) => {
  const authClient = getGoogleAuthClient()
  const authUrl = getAuthorizedUrl(authClient)
  res.redirect(authUrl)
})

router.get('/google/callback', async (req, res) => {
  try {
    // Retrieve code from callback URL code param
    const authClient = getGoogleAuthClient()
    const params = new URL(req.url, 'http://localhost:4000').searchParams
    const code = params.get('code')

    if (!code) {
      throw new Error('no code received from google auth')
    }

    // Fetch tokens
    const tokenResponse = await authClient.getToken(code)
    authClient.setCredentials(tokenResponse.tokens)
    const tokenInfo = await authClient.getTokenInfo(
      authClient.credentials.access_token!
    )

    // Fetch current user's profile data and extract id, name and email
    const { data } = await authClient.request<GooglePersonResource>({
      url: 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses'
    })
    const { sub: googleId } = tokenInfo
    const name = data.names[0].displayName
    const email = data.emailAddresses[0].value

    // Check user existence
    const prismaClient = Container.get<PrismaClient>('PRISMA_CLIENT')
    const existing = await prismaClient.user.findUnique({ where: { googleId } })

    let user: User

    if (existing) {
      user = await prismaClient.user.update({
        where: { googleId },
        data: {
          name,
          email
        }
      })
    } else {
      user = await prismaClient.user.create({
        data: {
          name,
          email,
          googleId: googleId!
        }
      })
    }

    const expiresIn = Math.abs(
      differenceInSeconds(new Date(tokenInfo.expiry_date), new Date())
    )
    const jwt = generateJWT(String(user.id), `${expiresIn}s`)
    console.log(jwt)

    res.send(jwt)
  } catch (e) {
    console.error(e)
    console.error('no code reveiced from google auth')
  }
})

router.get('/logout', (req, res) => {})

export default router
