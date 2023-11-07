import { generateNonce } from "@meshsdk/core";
import { prisma } from '@server/prisma';

export async function generateNonceForLogin(rewardAddress: string) {
  // First, check if a user exists with the given rewardAddress.
  let user = await prisma.user.findUnique({
    where: { rewardAddress },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        rewardAddress,
        status: 'pending'
      },
    });
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