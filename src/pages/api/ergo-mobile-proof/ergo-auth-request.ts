import { ErgoAddress, ErgoTree } from '@fleet-sdk/core';
import { prisma } from '@server/prisma';
import { deleteEmptyUser } from '@server/utils/deleteEmptyUser';
import { NextApiRequest, NextApiResponse } from 'next';

interface ErgoAuthRequest {
  address: string;
  signingMessage: string;
  sigmaBoolean: string;
  userMessage: string;
  messageSeverity: "INFORMATION" | "WARNING";
  replyTo: string;
}

export default async function ergoauthVerifyMobile(req: NextApiRequest, res: NextApiResponse) {
  const { verificationId, address } = req.query;
  const addressString = address?.toString()

  // console.log('\x1b[32m', 'verificationID: ', '\x1b[0m', verificationId);
  // console.log('\x1b[32m', 'addressString: ', '\x1b[0m', addressString);

  // Fetch the login request using the verificationId
  const proofRequest = await prisma.ergoProof.findUnique({
    where: { verificationId: verificationId as string },
  });

  if (!proofRequest) {
    return res.status(422).json({ error: 'Invalid login request' });
  }

  const user = await prisma.user.findUnique({
    where: { id: proofRequest.user_id },
  });

  if (!user) {
    return res.status(422).json({ error: 'User not found' });
  }

  if (!addressString) {
    if (user.status === 'pending') deleteEmptyUser(user.id)
    return res.status(422).json({ error: 'No address provided' });
  }

  if (!user.nonce) {
    if (user.status === 'pending') deleteEmptyUser(user.id)
    return res.status(422).json({ error: 'Signing message was not generated, please try again' });
  }

  const originalUrl = process.env.NEXTAUTH_URL || 'https://coinecta.fi';
  const parsedUrl = new URL(originalUrl);

  // Construct the base URL
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}`;

  try {
    const replyTo = `${baseUrl}/api/ergo-mobile-proof/verify?verificationId=${verificationId}`;

    const addr = ErgoAddress.fromBase58(addressString);
    const tree = new ErgoTree(addr.ergoTree);
    const treeBytes = Array.from(tree.toBytes());
    treeBytes.shift();
    treeBytes.shift();
    const sigmaBoolean = Buffer.from(treeBytes).toString("base64");

    const ergoAuthRequest: ErgoAuthRequest = {
      address: addressString,
      signingMessage: user.nonce,
      sigmaBoolean: sigmaBoolean,
      userMessage: 'Sign the message to verify ownership of your Ergo wallet on Coinecta.\n\nThis does not give us access to any funds.\n\nIMPORTANT: Make sure you select the same address that you chose before. ',
      messageSeverity: 'INFORMATION',
      replyTo,
    };
    // console.log('\x1b[32m', 'Ergo auth request: ', '\x1b[0m', ergoAuthRequest);
    res.status(200).json(ergoAuthRequest);
  } catch (e: any) {
    if (user.status === 'pending') deleteEmptyUser(user.id)
    res.status(500).json({ error: `ERR::login::${e.message}` });
  }
}