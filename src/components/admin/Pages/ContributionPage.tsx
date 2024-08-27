import React, { ChangeEvent, FC, useState } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper,
  useTheme
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import AdminMenu from '@components/admin/AdminMenu';
import { useAlert } from '@contexts/AlertContext';
import AddContributionRound from '../contribution/AddContributionRound';
import EditContributionRound from '../contribution/EditContributionRound';
import DeleteContributionRound from '../contribution/DeleteContributionRound';
import SelectProject from '../SelectProject';

const ContributionRoundPage: FC = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const theme = useTheme()

  return (
    <AdminMenu>
      <Typography variant="h2" sx={{ mt: 10, mb: 4, fontWeight: '700' }}>
        Create Contribution Round
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Select a project
        </Typography>
        <Box sx={{ maxWidth: '350px' }}>
          <SelectProject selectedProject={selectedProject} setSelectedProject={setSelectedProject} projectList={projectList} />
        </Box>
      </Box>
      <Box sx={{ mb: 4, p: 3, background: theme.palette.background.paper }}>
        <AddContributionRound selectedProject={selectedProject} projectList={projectList} />
      </Box>
      <Box sx={{ mb: 4, p: 3, background: theme.palette.background.paper }}>
        <EditContributionRound selectedProject={selectedProject} projectList={projectList} />
      </Box>
      <Box sx={{ mb: 4, p: 3, background: theme.palette.background.paper }}>
        <DeleteContributionRound selectedProject={selectedProject} />
      </Box>
    </AdminMenu>
  );
};

export default ContributionRoundPage;
