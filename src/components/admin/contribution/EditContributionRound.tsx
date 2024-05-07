import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Collapse
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import AdminMenu from '@components/admin/AdminMenu';
import { useAlert } from '@contexts/AlertContext';
import SelectContributionRound from './SelectContributionRound';
import EditAndCreateContributionForm from './EditAndCreateContributionForm';

type EditContributionRoundProps = {
  projectList: TProjectBase[] | undefined;
  selectedProject: string | null;
}

const initForm = {
  name: '',
  saleType: 'pro-rata',
  startDate: '',
  endDate: '',
  tokenTicker: '',
  tokenTarget: 0,
  currency: 'ADA',
  price: 0,
  deposited: 0,
  projectName: '',
  projectSlug: '',
  whitelistSlug: ''
}

const formatDateForDateTimeLocal = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth() returns 0-11
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditContributionRound: FC<EditContributionRoundProps> = ({ projectList, selectedProject }) => {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [project, setProject] = useState<TProjectBase | undefined>(undefined)

  useEffect(() => {
    if (selectedProject) {
      setProject(projectList?.find(project => selectedProject === project.slug))
    } else setProject(undefined)
  }, [selectedProject])

  const roundQuery = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: selectedProject || '' },
    { enabled: !!selectedProject }
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Edit Contribution Round
      </Typography>
      <Box sx={{ mb: 1, maxWidth: '350px' }}>
        <SelectContributionRound roundData={roundQuery.data} selectedRound={selectedRound} setSelectedRound={setSelectedRound} />
      </Box>
      <Collapse in={!!selectedRound && project !== undefined}>
        <EditAndCreateContributionForm
          mode="edit"
          selectedRound={selectedRound}
          project={project!}
        />
      </Collapse>
    </Box>
  );
};

export default EditContributionRound;