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
  projectSlug: ''
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
  const { addAlert } = useAlert();
  const [formRound, setFormRound] = useState<TContributionRoundForm>(initForm);
  const [isLoading, setLoading] = useState(false);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const roundQuery = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: selectedProject || '' },
    { enabled: !!selectedProject }
  );

  useEffect(() => {
    const round = roundQuery.data?.find(round => round.id === Number(selectedRound))
    if (round) {
      const datesToString = {
        ...round,
        startDate: formatDateForDateTimeLocal(round.startDate),
        endDate: formatDateForDateTimeLocal(round.endDate),
      }
      setFormRound(datesToString)
    }
    else setFormRound(initForm)
  }, [selectedRound, roundQuery.data])

  const editContributionRoundMutation = trpc.contributions.updateContributionRound.useMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormRound(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const project = projectList?.find(project => selectedProject === project.slug)

    if (project) {
      const submissionData = {
        ...formRound,
        id: Number(selectedRound),
        tokenTarget: Number(formRound.tokenTarget),
        price: Number(formRound.price),
        startDate: new Date(formRound.startDate),
        endDate: new Date(formRound.endDate),
        projectName: project.name,
        projectSlug: project.slug
      };

      try {
        await editContributionRoundMutation.mutateAsync(submissionData);
        addAlert('success', 'Contribution round updated successfully!');
      } catch (error) {
        addAlert('error', error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      addAlert('error', 'Please choose a project first');
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Edit Contribution Round
      </Typography>
      <Box sx={{ mb: 1, maxWidth: '350px' }}>
        <SelectContributionRound roundData={roundQuery.data} selectedRound={selectedRound} setSelectedRound={setSelectedRound} />
      </Box>
      <Collapse in={!!selectedRound}>
        <Grid container spacing={2} maxWidth="md">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="name"
              label="Name"
              variant="filled"
              value={formRound.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              disabled
              name="saleType"
              label="Sale Type"
              variant="filled"
              value={formRound.saleType}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="tokenTicker"
              label="Token Ticker"
              variant="filled"
              value={formRound.tokenTicker}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="tokenTarget"
              label="Target number to sell"
              variant="filled"
              value={formRound.tokenTarget}
              onChange={handleChange}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="startDate"
              label="Start Date"
              variant="filled"
              value={formRound.startDate}
              onChange={handleChange}
              type="datetime-local"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="endDate"
              label="End Date"
              variant="filled"
              value={formRound.endDate}
              onChange={handleChange}
              type="datetime-local"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="currency"
              label="Exchange Currency"
              variant="filled"
              disabled
              value={formRound.currency}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              name="price"
              label="Price"
              variant="filled"
              value={formRound.price}
              onChange={handleChange}
              type="number"
            />
          </Grid>
        </Grid>
      </Collapse>
      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default EditContributionRound;