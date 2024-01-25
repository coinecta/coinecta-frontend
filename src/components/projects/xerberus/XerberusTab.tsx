

import React, { FC, useEffect, useState } from 'react';
import { Alert, Collapse, Box, Typography } from '@mui/material';
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
    <>
      <Box sx={{ mb: "2rem" }}>
        <XerberusCharts token={project.tokenomics.tokenTicker} />
      </Box>
    </>
  );
};

export default XerberusTab;
