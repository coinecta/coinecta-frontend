import { checkSignature, generateNonce } from "@meshsdk/core";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from '@server/prisma';
import { getCookie, setCookie } from 'cookies-next';
import { nanoid } from 'nanoid';
import {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import NextAuth, { NextAuthOptions, Session, User, getServerSession } from 'next-auth';
import {
  JWT,
  JWTDecodeParams,
  JWTEncodeParams,
  decode,
  encode
} from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

type Credentials = {
  nonce: string;
  userId: string;
  signature: string;
  wallet: string;
}

type ParsedWallet = {
  type: string;
  changeAddress: string;
  rewardAddress: string;
  usedAddresses: string[];
  unusedAddresses: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await NextAuth(req, res, authOptions(req, res))
}

export const authOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions => {

  function resMessage(status: number, message: string) {
    return res.status(status).json({
      statusText: message,
    })
  }

  function nextAuthInclude(include: string) {
    return req.query.nextauth?.includes(include)
  }

  async function signUser(user: User, credentials: Credentials): Promise<User | null> {
    const walletParse: ParsedWallet = JSON.parse(credentials.wallet)
    const signatureParse = JSON.parse(credentials.signature)

    // console.log('\x1b[32m', 'Nonce: ', '\x1b[0m', nonce);

    if (!user.nonce) {
      console.error(`No nonce available`)
      throw new Error(`No nonce available`)
    }

    const result = checkSignature(user.nonce, walletParse.rewardAddress, signatureParse);

    if (result) {
      // set a new nonce for the user to make sure an attacker can't reuse this one
      const newNonce = generateNonce()
      prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          nonce: newNonce
        }
      })
      const newUser = { ...user, walletType: walletParse.type }
      return newUser
    }
    return null
  }

  async function createNewUser(user: User, credentials: Credentials): Promise<User | null> {
    const { nonce, userId, signature, wallet } = credentials;
    const walletParse: ParsedWallet = JSON.parse(wallet);
    const signatureParse = JSON.parse(signature);

    // const signedMessageSplit = signatureParse.signedMessage.split(";");
    // const nonce = signedMessageSplit[0];
    // const url = signedMessageSplit[1];
    console.log('\x1b[32m', 'Nonce: ', '\x1b[0m', nonce);
    // if (nonce !== user.nonce) {
    //   console.error(`Nonce doesn't match`)
    //   throw new Error(`Nonce doesn't match`)
    // }
    if (!user.nonce) {
      console.error(`No nonce available`)
      throw new Error(`No nonce available`)
    }

    const result = checkSignature(user.nonce, walletParse.rewardAddress, signatureParse);

    try {
      if (!result) {
        await prisma.user.delete({ where: { id: userId } });
        throw new Error("Verification failed.");  // Throw error if verification fails
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: walletParse.changeAddress,
          defaultAddress: walletParse.changeAddress,
          rewardAddress: walletParse.rewardAddress,
          walletType: walletParse.type,
          nonce,
          wallets: {
            create: [
              {
                type: walletParse.type,
                rewardAddress: walletParse.rewardAddress,
                changeAddress: walletParse.changeAddress,
                unusedAddresses: walletParse.unusedAddresses,
                usedAddresses: walletParse.usedAddresses
              }
            ]
          }
        }
      });

      if (!user) {
        await prisma.user.delete({ where: { id: userId } });
        throw new Error("User update failed.");  // Throw error if user update fails
      }

      const account = await prisma.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: walletParse.changeAddress,
        }
      });

      if (user && account && result) {
        const newNonce = generateNonce()
        await prisma.user.update({
          where: { id: user.id },
          data: {
            nonce: newNonce,
            status: 'active',
          }
        });
        return user;
      } else {
        await prisma.user.delete({ where: { id: userId } });
        throw new Error("Failed to create account or update nonce.");  // Throw error if account creation or nonce update fails
      }
    } catch (error) {
      console.error("Error creating new user: ", error);
      await prisma.user.delete({ where: { id: userId } });
      return null;
    }
  }

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          nonce: {
            label: "Nonce",
            type: "text",
            placeholder: "",
          },
          userId: {
            label: "User Id",
            type: "text",
            placeholder: "",
          },
          signature: {
            label: "Signature",
            type: "text",
            placeholder: "",
          },
          wallet: {
            label: "Wallet",
            type: "text",
            placeholder: "",
          }
        },
        async authorize(credentials, req): Promise<User | null> {
          try {
            if (req.method !== 'POST') {
              res.setHeader('Allow', ['POST'])
              return null
            }

            const { nonce, userId, signature, wallet } =
              credentials as Credentials

            if (!nonce || !userId || !signature || !wallet) {
              return null
            }

            // NOTE THAT WE CREATED A USER WHEN GENERATING A NONCE
            // Even if this is a new user, we will already have a database entry
            const user = await prisma.user.findFirst({
              where: {
                id: userId,
              },
              include: {
                wallets: true
              }
            });

            if (user && user.wallets.length > 0) {
              return signUser(user, credentials as Credentials)
            } else if (user && user.wallets.length === 0
            ) {
              return createNewUser(user, credentials as Credentials)
            } else throw new Error('Unable to verify user')
          } catch (error) {
            console.error(error)
            return null
          }
        },
      }),
    ],
    callbacks: {
      async signIn({ user, account, email }: any) {
        if (nextAuthInclude('callback') && nextAuthInclude('credentials')) {
          if (!user) return true

          const sessionToken = nanoid()
          const sessionMaxAge = 60 * 60 * 24 * 30
          const sessionExpiry = new Date(Date.now() + sessionMaxAge * 1000)

          await prisma.session.create({
            data: {
              sessionToken: sessionToken,
              userId: user.id,
              expires: sessionExpiry,
              walletType: user.walletType
            },
          })

          setCookie(`next-auth.session-token`, sessionToken, {
            expires: sessionExpiry,
            req: req,
            res: res,
          })

          return true
        }

        // Check first if there is no user in the database. Then we can create new user with these OAuth credentials.
        const profileExists = await prisma.user.findFirst({
          where: {
            email: user.email,
          },
        })
        if (!profileExists) return true

        // Check if there is an existing account in the database. Then we can log in with this account.
        const accountExists = await prisma.account.findFirst({
          where: {
            AND: [{ provider: account.provider }, { userId: profileExists.id }],
          },
        })
        if (accountExists) return true

        // If there is no account in the database, we create a new account with these OAuth credentials.
        await prisma.account.create({
          data: {
            userId: profileExists.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          },
        })

        // Since a user is already in the database we can update user information.
        await prisma.user.update({
          where: { id: profileExists.id },
          data: { name: user.name },
        })
        return user
      },
      async jwt({ token, user }: any) {
        if (user) {
          token.user = user;
        }
        return token
      },
      async session({
        session,
        user
      }: {
        session: Session;
        token: JWT;
        user: any;
      }) {
        // console.log('\x1b[32m', 'Get auth session', '\x1b[0m', {
        //   url: req.url,
        //   method: req.method,
        // });
        // we have to get the cookie to get the session ID because 
        // it doesn't seem possible to pass it along the auth flow
        const cookie = getCookie(`next-auth.session-token`, {
          req: req,
        })
        let dbSession
        if (typeof cookie === 'string') {
          dbSession = await prisma.session.findFirst({
            where: {
              sessionToken: cookie
            },
          })
        }
        if (user) {
          session.user = {
            id: user.id,
            name: user.name,
            address: user.defaultAddress,
            walletType: dbSession?.walletType!,
            image: user.image,
            isAdmin: user.isAdmin
          }
        }
        return session
      },
    },
    jwt: {
      encode: async ({
        token,
        secret,
        maxAge,
      }: JWTEncodeParams): Promise<any> => {
        if (
          nextAuthInclude('callback') &&
          nextAuthInclude('credentials') &&
          req.method === 'POST'
        ) {
          const cookie = getCookie(`next-auth.session-token`, {
            req: req,
          })

          if (cookie) {
            // console.log(cookie)
            return cookie
          }
          else return ''
        }

        return encode({ token, secret, maxAge })
      },
      decode: async ({ token, secret }: JWTDecodeParams) => {
        if (
          nextAuthInclude('callback') &&
          nextAuthInclude('credentials') &&
          req.method === 'POST'
        ) {
          return null
        }

        return decode({ token, secret })
      },
    },
  }
}

export const getServerAuthSession = (req: any, res: any) => {
  return getServerSession(req, res, authOptions(req, res))
}