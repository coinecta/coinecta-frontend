import { ProviderType } from "next-auth/providers/index";

const SUPPORTED_WALLETS = [
  'begin', 'eternl', 'flint', 'lace', 'nami', 'nufi', 'gerowallet', 'typhoncip30', 'vespr'
];

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      address?: string;
      image?: string;
      walletType?: string;
      isAdmin?: boolean;
    };
  }
  interface User {
    id: string;
    created_at: Date; // assuming this gets converted to a JavaScript Date object when fetched
    updated_at: Date; // same assumption as created_at
    name: string | null;
    status: string | null;
    defaultAddress: string | null;
    nonce: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    sumsubId: string | null;
    sumsubType: string | null;
    sumsubResult: any | null; // 'any' used for JSON, consider defining a more specific interface if the JSON structure is known
    sumsubStatus: string | null;
    // accounts: Account[]; // assumes you have an 'Account' interface or type defined
    // sessions: Session[]; // assumes you have a 'Session' interface or type defined
    // wallets: Wallet[]; // assumes you have a 'Wallet' interface or type defined
    // transactions: Transaction[]; // assumes you have a 'Transaction' interface or type defined
    // whitelists: string[];
  }
  interface JWT {
    walletType?: string;
  }
  interface Account {
    id: string;
    userId?: string;
    type: ProviderType;
    provider: string;
    providerAccountId: string;
    refresh_token?: string | null;
    access_token?: string | null;
    expires_at?: number | null;
    token_type?: string | null;
    scope?: string | null;
    id_token?: string | null;
    session_state?: string | null;
    user: User;
  }
  interface Address {
    id: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    region?: string;
    district?: string;
    province?: string;
    postal_code: string;
    country: string;
    user_id: string;
  }
  interface Wallet {
    id: number;
    rewardAddress: string;
    changeAddress: string;
    user_id: string;
    user?: User;
  }
  interface Transaction {
    id: string;
    description: string;
    amount: string;
    currency: string;
    address: string;
    completed: boolean;
    created_at: string;
    user?: User;
  }
}

// /**
//  * Options for NextAuth.js used to configure adapters, providers, callbacks,
//  * etc.
//  *
//  * @see https://next-auth.js.org/configuration/options
//  **/
// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_CLIENT_ID!,
//       clientSecret: process.env.GITHUB_SECRET_ID!
//     }),
//     CredentialsProvider({
//       name: "z",
//       credentials: {
//         message: {
//           label: "Message",
//           type: "text",
//           placeholder: "0x0",
//         },
//         signature: {
//           label: "Signature",
//           type: "text",
//           placeholder: "0x0",
//         },
//       },
//       async authorize(credentials) {
//         try {
//           const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))
//           const domain = process.env.DOMAIN
//           if (siwe.domain !== domain) {
//             return null
//           }

//           if (siwe.nonce !== (await getCsrfToken({ req }))) {
//             return null
//           }

//           await siwe.validate(credentials?.signature || "")
//           return {
//             id: siwe.address,
//           }
//         } catch (e) {
//           return null
//         }
//       },
//     })
//   ],
//   callbacks: {
//     async session({ session, user }) {
//       // Include the user's ID in the session
//       return {
//         ...session,
//         user: {
//           ...session.user,
//           id: user.id,
//         },
//       };
//     },
//   },
//   jwt: {

//   }
// };

// /**
//  * Wrapper for `getServerSession` so that you don't need to import the
//  * `authOptions` in every file.
//  *
//  * @see https://next-auth.js.org/configuration/nextjs
//  **/
// export const getServerAuthSession = (ctx: {
//   req: GetServerSidePropsContext["req"];
//   res: GetServerSidePropsContext["res"];
// }) => {
//   return getServerSession(ctx.req, ctx.res, authOptions);
// };