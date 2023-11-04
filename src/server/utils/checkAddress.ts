import { prisma } from '@server/prisma';

export async function checkAddressAvailability(address: string) {
  const [userWithAddress, walletWithChangeAddress, walletWithAddressInArrays] = await prisma.$transaction([
    prisma.user.findUnique({
      where: {
        defaultAddress: address
      },
      select: { id: true }
    }),
    prisma.wallet.findUnique({
      where: {
        changeAddress: address
      },
      select: { id: true }
    }),
    prisma.wallet.findFirst({
      where: {
        OR: [
          { unusedAddresses: { has: address } },
          { usedAddresses: { has: address } }
        ]
      },
      select: { id: true }
    })
  ]);

  if (userWithAddress || walletWithChangeAddress || walletWithAddressInArrays) {
    return { status: "unavailable" };
  }
  return { status: "available" };
}

export async function getUserIdByAddress(address: string) {
  const [walletWithChangeAddress, walletWithAddressInArrays] = await prisma.$transaction([
    prisma.wallet.findUnique({
      where: {
        changeAddress: address
      },
      select: { user_id: true }
    }),
    prisma.wallet.findFirst({
      where: {
        OR: [
          { unusedAddresses: { has: address } },
          { usedAddresses: { has: address } }
        ]
      },
      select: { user_id: true }
    })
  ]);

  // If the address is a change address in a wallet or exists in the arrays of a wallet, 
  // return the user ID associated with that wallet
  if (walletWithChangeAddress) {
    return walletWithChangeAddress.user_id;
  }

  if (walletWithAddressInArrays) {
    return walletWithAddressInArrays.user_id;
  }

  // If none of the above conditions match, the address is not associated with any user
  return null;
}

export const getUserIdByRewardAddress = async (address: string) => {
  const [userWithRewardAddress, walletWithRewardAddress] = await prisma.$transaction([
    prisma.user.findUnique({
      where: {
        rewardAddress: address
      },
      select: { id: true }
    }),
    prisma.wallet.findUnique({
      where: {
        rewardAddress: address
      },
      select: { id: true }
    })
  ]);

  if (userWithRewardAddress || walletWithRewardAddress) {
    return { status: "unavailable" };
  }
  return { status: "available" };
}