import { prisma } from '@server/prisma';
import { checkExistingProofs } from '@server/utils/ergoProofs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { p2pkAddress, verificationId } = req.query;

  if (!verificationId || typeof verificationId !== 'string' ||
    !p2pkAddress || typeof p2pkAddress !== 'string') {
    return res.status(400).json({ error: 'Missing verification ID or Address' });
  }

  if (p2pkAddress.includes('multiple')) {
    return res.status(400).json({ error: 'Requires a single address' });
  }

  try {
    const exists = await checkExistingProofs(p2pkAddress)

    if (exists) {
      return res.status(409).json({
        error: "Address already attached to an account. ",
        message: "Address already attached to an account. "
      })
    }

    const updatedProof = await prisma.ergoProof.update({
      where: {
        verificationId: verificationId,
        status: 'INITIATED'
      },
      data: {
        status: 'PENDING',
        defaultAddress: p2pkAddress,
        addresses: [p2pkAddress]
      }
    })

    if (updatedProof) {
      return res.status(200).json({
        message: "Address received, please scan the next QR code to sign the message and verify ownership of this wallet",
        messageSeverity: "INFORMATION"
      })
    } else {
      return res.status(404).json({ error: 'No matching request' });
    }
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}