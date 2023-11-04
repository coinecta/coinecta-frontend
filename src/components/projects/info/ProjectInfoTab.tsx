

import React, { FC, useState } from 'react';
import { Alert, Collapse, Box, Typography } from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useWalletContext } from '@contexts/WalletContext';
import MarkdownRender from '@components/MarkdownRender';
import Team from './Team';
import Roadmap from './Roadmap';

type ProjectInfoTabProps = {
  project: TProject
}

const ProjectInfoTab: FC<ProjectInfoTabProps> = ({ project }) => {
  const { providerLoading, setProviderLoading, sessionStatus, sessionData, fetchSessionData } = useWalletContext()
  const checkVerificationResult = trpc.user.getSumsubResult.useQuery()

  return (
    <>
      <Box sx={{ mb: "2rem" }}>
        <Typography variant="h4" fontWeight="700">
          Description
        </Typography>
        <MarkdownRender description={project.description} />
      </Box>
      {project.team.length > 0 &&
        <Box sx={{ mb: "2rem" }}>
          <Typography variant="h4" fontWeight="700">
            Team
          </Typography>
          <Team data={project.team} />
        </Box>
      }
      {project.roadmap.length > 0 && (
        <Box sx={{ mb: "2rem" }}>
          <Typography variant="h4" fontWeight="700">
            Project Roadmap
          </Typography>
          <Roadmap data={project?.roadmap} />
        </Box>
      )}
    </>
  );
};

export default ProjectInfoTab;
