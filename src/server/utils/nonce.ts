import { generateNonce } from "@meshsdk/core";
import { prisma } from '@server/prisma';

export async function generateNonceForLogin(rewardAddress: string) {
  // First, check if a user exists with the given rewardAddress.
  let user = await prisma.user.findUnique({
    where: { rewardAddress },
  });

  // If no user exists with the rewardAddress, then check using the getUserIdByAddress function
  if (!user) {
    const wallet = await prisma.wallet.findUnique({
      where: {
        rewardAddress
      },
      select: { id: true, user_id: true }
    })
    if (wallet) {
      user = await prisma.user.findUnique({
        where: { id: wallet.user_id },
      });
    } else {
      user = await prisma.user.create({
        data: {
          rewardAddress,
          status: 'pending'
        },
      });
    }
  }

  if (!user) {
    throw new Error('Database error')
  }

  const nonce = generateNonce();

  // Update the user's nonce in the database
  await prisma.user.update({
    where: { id: user.id },
    data: { nonce },
  });

  return { nonce, userId: user.id };
}

export async function generateNonceForAddWallet(userId: string) {
  const nonce = generateNonce();

  // Update the user's nonce in the database
  const user = await prisma.user.update({
    where: { id: userId },
    data: { nonce },
  });

  if (!user) {
    throw new Error("User doesn't exist")
  }

  return nonce;
}