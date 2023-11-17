import { prisma } from '@server/prisma';
import { verifySignature } from '@server/utils/verifyErgoSignature';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { verificationId } = req.query;
  const { signedMessage, proof } = req.body;

  if (!verificationId || !signedMessage || !proof) {
    return res.status(400).json({ error: 'Bad Request: Missing required fields.' });
  }

  try {
    const proofInDb = await prisma.ergoProof.findFirst({
      where: { verificationId: verificationId.toString() },
    });

    if (proofInDb?.defaultAddress) {
      const verify = verifySignature(proofInDb?.defaultAddress, signedMessage, proof, 'mobile')

      if (verify) {
        const update = await prisma.ergoProof.update({
          where: {
            verificationId: verificationId.toString(),
          },
          data: {
            status: 'VERIFIED',
            signedMessage,
            proof
          }
        })

        if (update) return res.status(200).json({
          status: 'VERIFIED',
          signedMessage,
          proof
        });
        else throw Error
      }
    }
  } catch (error) {
    console.error('Error updating login request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}