import { prisma } from "@server/prisma";

export const deleteExpiredProofs = async () => {
  const twentyMinutesAgo = new Date();
  twentyMinutesAgo.setMinutes(twentyMinutesAgo.getMinutes() - 20);

  const deleted = await prisma.ergoProof.deleteMany({
    where: {
      status: {
        in: ['INITIATED', 'PENDING', 'SIGNED', 'EXPIRED'],
      },
      updated_at: {
        lt: twentyMinutesAgo,
      }
    }
  });

  if (deleted.count > 0) {
    console.log(`Deleted ${deleted.count} expired proofs`)
  }
}

export const checkExistingProofs = async (address: string): Promise<boolean> => {
  const proofs = await prisma.ergoProof.findMany({
    where: {
      status: 'VERIFIED',
      OR: [
        {
          addresses: {
            has: address,
          },
        },
        {
          defaultAddress: address,
        },
      ],
    },
  });

  return proofs.length > 0;
};