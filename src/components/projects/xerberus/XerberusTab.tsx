

import React, { FC, useEffect, useState } from 'react';
import { Alert, Collapse, Box, Typography, Link } from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';
import MarkdownRender from '@components/MarkdownRender';
import axios from 'axios';
import XerberusCharts from './XerberusCharts';

type XerberusTabProps = {
  project: TProject
}

const XerberusTab: FC<XerberusTabProps> = ({ project }) => {

  return (
    <Box>
      <Typography variant="h4">
        Xerberus Risk Ratings
      </Typography>
      <Typography sx={{ mb: 2 }}>
        At Coinecta, our goal is to be as transparent as possible and provide as many tools as we can to help investors analyze tokens they intend to hold. Our partnership with Xerberus is just one of several methods provided to our community to assist with token research.
      </Typography>
      <Typography sx={{ mb: 2 }}>
        We encourage you to educate yourself on how Xerberus derives this data. A low Growth Score and Risk Rating may be a sign of an excellent investment opportunity, since newer tokens will have very little on-chain data to begin with. However, a low rating could also indicate something to be concerned about. The data presented below should never be used alone without further research; it is solely a representation of on-chain data.
      </Typography>
      <Typography sx={{ mb: 2 }}>
        You can read more details about Risk Ratings and how they're derived in the <Link component="span" href="https://documentation.xerberus.io/introduction/risk-ratings" target="_blank">Xerberus Documentation</Link>.
      </Typography>
      <XerberusCharts token={project.tokenomics.tokenTicker} />
    </Box>
  );
};

export default XerberusTab;
