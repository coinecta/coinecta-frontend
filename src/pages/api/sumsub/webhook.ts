import { prisma } from '@server/prisma';
import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const customHeaderName = process.env.SUMSUB_WEBHOOK_HEADER_NAME;
  const webhookSecretKey = process.env.SUMSUB_WEBHOOK_SECRET_KEY;
  const hmacSecretKey = process.env.SUMSUB_HMAC_SECRET_KEY;

  // Check if environment variables are defined
  if (!customHeaderName || !webhookSecretKey || !hmacSecretKey) {
    console.error('Environment variables are not properly set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (req.method === 'POST') {
    try {
      // 1. Check the custom header for the secret key
      const customHeaderValue = req.headers[customHeaderName.toLowerCase() as keyof typeof req.headers];

      if (customHeaderValue !== webhookSecretKey) {
        return res.status(403).json({ error: 'Invalid signature' });
      }

      // 2. Verify the HMAC digest
      let rawBody = '';
      req.on('data', chunk => {
        rawBody += chunk;
      });

      req.on('end', () => {
        const receivedSignature = req.headers['x-payload-digest'];

        const digestAlgorithmHeader = req.headers['x-payload-digest-alg'] as string;
        const algorithms: { [key: string]: string } = {
          'HMAC_SHA1_HEX': 'sha1',
          'HMAC_SHA256_HEX': 'sha256',
          'HMAC_SHA512_HEX': 'sha512',
        };
        // console.log(`Digest algorithm header: ${digestAlgorithmHeader}`)

        const algo = algorithms[digestAlgorithmHeader];
        if (!algo) {
          throw new Error('Unsupported algorithm');
        }

        const hmac = crypto.createHmac(algo, hmacSecretKey);
        hmac.update(rawBody);
        const computedSignature = hmac.digest('hex');

        if (receivedSignature !== computedSignature) {
          console.error('HMAC validation failed. Signatures do not match.');
          return res.status(403).json({ error: 'Invalid digest' });
        }
        const parsedData = JSON.parse(rawBody)
        res.status(200).json({ status: 'Payload received and validated' });
        processWebhookData(parsedData)
      });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Failed to handle webhook' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function processWebhookData(data: any) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: data.externalUserId,
      },
      data: {
        sumsubId: data.applicantId,
        sumsubType: data.applicantType,
        sumsubResult: data.reviewResult,
        sumsubStatus: data.reviewStatus,
      },
    });

    // console.log('User updated:', updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}