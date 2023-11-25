import React, { ChangeEvent, FC, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Paper,
  Grid
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import AdminMenu from '@components/admin/AdminMenu';
import { useAlert } from '@contexts/AlertContext';
import SelectWhitelist from './SelectWhitelist';

type AddContributionRoundProps = {
  projectList: TProjectBase[] | undefined;
  selectedProject: string | null;
}

const AddContributionRound: FC<AddContributionRoundProps> = ({ projectList, selectedProject }) => {
  const { addAlert } = useAlert();
  const [formRound, setFormRound] = useState<TContributionRoundForm>({
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
  });
  const [isLoading, setLoading] = useState(false);
  const [selectedWhitelist, setSelectedWhitelist] = useState<string | null>(null)
  const { data: whitelistData } = trpc.whitelist.listProjectWhitelists.useQuery({ projectSlug: selectedProject || '' })
  const addContributionRoundMutation = trpc.contributions.addContributionRound.useMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormRound(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const project = projectList?.find(project => selectedProject === project.slug)

    if (project && selectedWhitelist) {
      const submissionData = {
        ...formRound,
        whitelistSlug: selectedWhitelist,
        tokenTarget: Number(formRound.tokenTarget),
        price: Number(formRound.price),
        startDate: new Date(formRound.startDate),
        endDate: new Date(formRound.endDate),
        projectName: project.name,
        projectSlug: project.slug
      };

      try {
        await addContributionRoundMutation.mutateAsync(submissionData);
        addAlert('success', 'Contribution round added successfully!');
      } catch (error) {
        addAlert('error', error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      if (!project) addAlert('error', 'Please choose a project first');
      else if (!selectedWhitelist) addAlert('error', 'Please choose a whitelist to connect to');
      else addAlert('error', 'An unknown error occured');
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Add Contribution Round
      </Typography>
      <Box sx={{ mb: 2 }}>
        <SelectWhitelist selectedWhitelist={selectedWhitelist} setSelectedWhitelist={setSelectedWhitelist} whitelistData={whitelistData} />
      </Box>
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
      <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default AddContributionRound;
