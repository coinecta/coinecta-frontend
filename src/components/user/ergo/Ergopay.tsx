import React, { FC, useEffect, useState } from 'react';
import { useAlert } from '@contexts/AlertContext';
import { trpc } from '@lib/utils/trpc';
import {
  Typography,
  Box,
  CircularProgress,
  IconButton,
} from '@mui/material';
import Link from '@components/Link';
import QRCode from 'react-qr-code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface IErgopayProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  walletType: 'mobile' | 'satergo',
  messageSigning: boolean;
  callback: (success: boolean, address: string, verification: string) => void;
}

const Ergopay: FC<IErgopayProps> = ({ open, setOpen, walletType, messageSigning, callback }) => {
  const { addAlert } = useAlert()
  const baseUrl = `${window.location.host}`;
  const ergopayDomain = `ergopay://${baseUrl}`;
  const [verificationId, setVerificationId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  trpc.ergo.checkProofStatus.useQuery(
    // @ts-ignore
    { verificationId },
    {
      enabled: !!verificationId,
      refetchInterval: (data: { status: 'INITIATED' | 'PENDING'; defaultAddress: string, addresses: string[] } | undefined) => {
        // If the status is 'SIGNED', stop polling
        if (data?.status === 'PENDING') {
          return false;
        }
        // Otherwise, continue polling every 2 seconds
        return 2000;
      },
      refetchIntervalInBackground: true,
      onSuccess: (data: { status: string; defaultAddress: string; }) => {
        if (data?.status === 'PENDING') {
          callback(true, data.defaultAddress, verificationId!)
        }
      }
    }
  );

  useEffect(() => {
    if (open) {
      setLoading(true)
      connectErgopay(walletType, messageSigning)
    }
  }, [open])

  const initVerificationErgopay = trpc.ergo.initVerificationErgopay.useMutation();

  const connectErgopay = async (walletType: 'mobile' | 'satergo', messageSigning: boolean) => {
    try {
      const init = await initializeVerificationErgopay(walletType)
      if (init?.verificationId) {
        setVerificationId(init?.verificationId)
        setLoading(false)
      } else {
        setError(true)
      }
    } catch (error: any) {
      console.error(error)
      handleError(error);
    }
  };

  const initializeVerificationErgopay = async (walletType: 'mobile' | 'satergo') => {
    try {
      const initVerify = await initVerificationErgopay.mutateAsync({ walletType });
      return initVerify;
    } catch (error) {
      console.error('Error in verification process:', error);
      throw error;
    }
  };

  const handleError = (error: any) => {
    addAlert('error', `Error: ${error.message}`);
  };

  const link = `${ergopayDomain}/api/ergo-mobile-proof/p2pk?verificationId=${verificationId}&p2pkAddress=#P2PK_ADDRESS#`

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
      {error
        ? <Typography>Unable to initiate wallet scan request</Typography>
        : loading || !verificationId
          ? <CircularProgress />
          : <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
      }
    </Box>
  );
};

export default Ergopay;