import React, { FC, useEffect } from 'react';
import { useAlert } from '@contexts/AlertContext';
import { trpc } from '@lib/utils/trpc';
import {
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import Link from '@components/Link';
import QRCode from 'react-qr-code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface IErgoauthProps {
  defaultAddress: string;
  verificationId: string;
  walletType: 'mobile';
  callback: (success: boolean, signedMessage: string, proof: string) => void;
}

const Ergoauth: FC<IErgoauthProps> = ({ defaultAddress, walletType, verificationId, callback }) => {
  const { addAlert } = useAlert()
  const baseUrl = `${window.location.host}`;
  const ergoauthDomain = `ergoauth://${baseUrl}`;

  const { data, refetch } = trpc.ergo.checkProofStatus.useQuery(
    { verificationId },
    {
      enabled: !!verificationId,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!verificationId) return;

    const interval = setInterval(() => {
      refetch();
    }, 2000);

    if (data?.status === 'VERIFIED' && data.signedMessage && data.proof) {
      clearInterval(interval);
      callback(true, data.signedMessage, data.proof);
    }

    return () => clearInterval(interval);
  }, [verificationId, data, refetch, callback]);

  const link = `${ergoauthDomain}/api/ergo-mobile-proof/ergo-auth-request?verificationId=${verificationId}&address=${defaultAddress}`

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      addAlert('success', 'Copied to clipboard')
      console.log('Link copied to clipboard!');
    }).catch(err => {
      addAlert('error', 'Unable to copy link')
      console.error('Failed to copy link: ', err);
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <Typography>
            Scan the QR code or follow <Link href={link}>this link</Link>
            <IconButton onClick={() => copyToClipboard(link)}>
              <ContentCopyIcon sx={{ height: '18px', width: '18px' }} />
            </IconButton>
          </Typography>
        </Box>
        <Box sx={{ background: '#fff', p: 3, mb: 2, borderRadius: '12px' }}>
          <QRCode
            size={180}
            value={link}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Ergoauth;