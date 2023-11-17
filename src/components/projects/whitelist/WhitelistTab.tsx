

import React, { ChangeEvent, FC, useState } from 'react';
import { Alert, Collapse, Box, Typography, Paper, TextField, FilledInput } from '@mui/material';
import Sumsub from './Sumsub';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';
import UnlabelledTextField from '@components/styled-components/UnlabelledTextField';
import TextFieldWithButton from '@components/styled-components/TextFieldWithButton';
import WhitelistCard from './WhitelistCard';

const oneWeekFromNow = new Date();
oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
const twoWeekFromNow = new Date();
twoWeekFromNow.setDate(oneWeekFromNow.getDate() + 14);

type WhitelistTabProps = {
  whitelists: TWhitelist[];
  projectSlug: string;
}

const WhitelistTab: FC<WhitelistTabProps> = ({ whitelists, projectSlug }) => {
  const { sessionStatus, sessionData } = useWalletContext()
  const [sumsubStatus, setSumsubStatus] = useState<string | undefined>(undefined)
  const checkVerificationResult = trpc.user.getSumsubResult.useQuery()

  return (
    <>
      <Box sx={{ mb: "2rem" }}>
        {sessionStatus === 'authenticated' ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Collapse in={checkVerificationResult.data?.sumsubStatus === 'completed'} mountOnEnter unmountOnExit>
                <Alert
                  variant="outlined"
                  severity={
                    !checkVerificationResult.data?.sumsubResult?.reviewAnswer
                      ? 'error'
                      : checkVerificationResult.data?.sumsubResult.reviewAnswer === 'GREEN'
                        ? 'success'
                        : 'error'
                  }
                  sx={{ mb: 2 }}
                >
                  KYC Status: {
                    !checkVerificationResult.data?.sumsubResult?.reviewAnswer ?
                      'Sumsub result not available, please contact support'
                      : checkVerificationResult.data?.sumsubResult?.reviewAnswer === 'GREEN'
                        ? 'Verified'
                        : 'Failed, contact support for more info'}
                </Alert>
                {whitelists.map((item, i) => {
                  return (
                    <WhitelistCard {...item} projectSlug={projectSlug} key={`whitelist-${i}`} />
                  )
                })}
              </Collapse>
              <Collapse in={checkVerificationResult.data?.sumsubStatus !== 'completed' || sessionData?.user.isAdmin} mountOnEnter unmountOnExit>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ mb: 0 }}>
                    KYC/AML
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Please complete KYC to whitelist for this project on Coinecta
                  </Typography>
                  <Sumsub setSumsubStatus={setSumsubStatus} />
                </Box>
                {whitelists.filter(item => item.externalLink).length > 0 &&
                  (
                    <Box sx={{ mb: 6 }}>
                      <Typography variant="h4" sx={{ mb: 0 }}>
                        External whitelists
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Follow the instructions on the external site to complete their whitelist process
                      </Typography>
                      {whitelists.filter(item => item.externalLink).map((item, i) => {
                        return (
                          <WhitelistCard {...item} projectSlug={projectSlug} key={`external-whitelist-${i}`} />
                        )
                      })}
                    </Box>
                  )}
              </Collapse>
              {/* <Typography>
                Check back soon for whitelist availability.
              </Typography> */}
            </Box>
          </>
        ) : (
          <Typography>
            Connect wallet to whitelist
          </Typography>
        )}
      </Box>
    </>
  );
};

export default WhitelistTab;
