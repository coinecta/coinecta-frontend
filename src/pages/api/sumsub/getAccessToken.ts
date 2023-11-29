import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = req.query.userId as string;
  const levelName = 'basic-kyc-level';
  const appToken = process.env.SUMSUB_TOKEN!;
  const secretKey = process.env.SUMSUB_SECRET_KEY!;

  try {
    // Generate the signature
    const requestUrl = 'https://api.sumsub.com'
    const requestPath = `/resources/accessTokens?userId=${userId}&levelName=${levelName}`;
    const requestMethod = 'POST';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(timestamp + requestMethod.toUpperCase() + requestPath);
    const signature = hmac.digest('hex');

    // Make the API request
    const apiUrl = requestUrl + requestPath;
    const requestOptions = {
      method: requestMethod,
      headers: {
        'Accept': 'application/json',
        'X-App-Token': appToken,
        'X-App-Access-Sig': signature,
        'X-App-Access-Ts': timestamp,
      },
      // Add any request payload here (if applicable)
      // body: JSON.stringify({}),
    };

    const response = await fetch(apiUrl, requestOptions);

    // console.log('Status code:', response.status);

    const data = await response.json();
    // console.log('Response body:', data);

    if (!response.ok) {
      throw new Error('Response not OK');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating access token:', error);
    res.status(500).json({ error: 'Error generating access token' });
  }
}

export default handler;