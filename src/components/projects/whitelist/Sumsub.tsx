import { trpc } from '@lib/utils/trpc';
import React, { FC, useEffect, useState } from 'react';
import { useWalletContext } from '@contexts/WalletContext';
import SumsubWebSdk from '@sumsub/websdk-react';
import { Box, Collapse, Typography, useTheme } from '@mui/material';

interface SumsubProps {
  setSumsubStatus: React.Dispatch<React.SetStateAction<string | undefined>>
}

const Sumsub: FC<SumsubProps> = ({ setSumsubStatus }) => {
  const theme = useTheme()
  const [sumsubId, setSumsubId] = useState<string | undefined | null>(undefined)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState('')
  const { sessionStatus, sessionData } = useWalletContext()
  const checkVerificationResult = trpc.user.getSumsubResult.useQuery()

  useEffect(() => {
    if (sessionStatus === 'authenticated' && sessionData?.user.id) {
      const id = sessionData.user.id
      setUserId(id)
      // console.log(id)
      // Fetch the access token from your API when the component mounts
      fetch(`/api/sumsub/getAccessToken?userId=${id}`)
        .then(response => response.json())
        .then(data => setAccessToken(data.token))
        .catch(error => console.error('Error fetching access token:', error));
    }
  }, [sessionStatus]);

  const expirationHandler = async () => {
    // Fetch a new access token from your API when the current token has expired
    const response = await fetch(`/api/sumsub/getAccessToken?userId=${userId}`);
    const data = await response.json();
    setAccessToken(data.token);
    return data.token;
  }

  const config = {
    // Configuration settings for the SDK
  };

  const options = {
    // Options for the SDK
  };

  const messageHandler = (message: any) => {
    if (message.includes('applicantReviewComplete')) {
      checkVerificationResult.refetch()
        .then((response) => {
          setSumsubStatus(response.data?.sumsubResult?.reviewAnswer)
          setSumsubId(response.data?.sumsubId)
        })
        .catch((error: any) => {
          console.error(error);
        });
    }
    console.log("Received message from SDK:", message);
  }

  const errorHandler = (error: any) => {
    // Handle errors from the SDK
    console.error("Received error from SDK:", error);
  }


  return (
    <>
      <Typography>
        Please note, residents of the following countries will not be permitted to whitelist: Canada, Cuba, Iran, Iraq, Jordan, Lebanon, Myanmar, North Korea, Russia, Syria, Turkey. Thank you for your understanding.
      </Typography>
      {accessToken ? (
        <Box sx={{
          p: 4,
          pb: 0,
          background: '#ffffff',
          borderRadius: '16px',
          minHeight: { xs: '457px', md: '570px' }
        }}>
          <SumsubWebSdk
            accessToken={accessToken}
            expirationHandler={expirationHandler}
            config={config}
            options={options}
            onMessage={messageHandler}
            onError={errorHandler}
          />
        </Box>
      ) : sessionStatus === 'authenticated' && sessionData?.user.id
        ? (
          <Box sx={{
            p: 4,
            background: '#ffffff',
            borderRadius: '16px',
            height: { xs: '457px', md: '570px' },
            position: 'relative'
          }}
          >
            <Typography
              sx={{
                color: theme.palette.background.default,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%,-50%)'
              }}
            >
              Loading Sumsub access token...
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            p: 4,
            background: '#ffffff',
            borderRadius: '16px',
            height: { xs: '457px', md: '570px' },
            position: 'relative'
          }}
          >
            <Typography
              sx={{
                color: theme.palette.background.default,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%,-50%)'
              }}
            >
              No KYC access token, please sign in. If you are signed in and seeing this message, please contact support.
            </Typography>
          </Box>
        )}
    </>
  );
};

export default Sumsub;