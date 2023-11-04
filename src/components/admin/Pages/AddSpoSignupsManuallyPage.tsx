import { FC } from 'react';
import {
  Box,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { useState } from 'react';
import { NextPage } from 'next';
import { trpc } from '@lib/utils/trpc';
import AdminMenu from '@components/AdminMenu';

const AddSpoSignupsManuallyPage: FC = () => {
  const [signups, setSignups] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedFiso, setSelectedFiso] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('An error occurred');

  const { data: projectList } = trpc.project.getProjectList.useQuery({});
  const { data: fisos } = trpc.fisos.getByProjectSlug.useQuery({ projectSlug: selectedProject || '' }, { enabled: !!selectedProject });

  const addSignupsMutation = trpc.fisos.addStakepoolSignupsManually.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignups(e.target.value);
  };

  const handleProjectChange = (e: SelectChangeEvent) => {
    setSelectedProject(e.target.value as string);
  };

  const handleFisoChange = (e: SelectChangeEvent) => {
    setSelectedFiso(e.target.value as string);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject || !selectedFiso) {
      setErrorMessage('Please select a project and a FISO');
      setOpenError(true);
      return;
    }

    setLoading(true);
    setOpenError(false);
    setOpenSuccess(false);

    const signupsArray = signups.split(',').map((signup) => signup.trim());

    try {
      await addSignupsMutation.mutateAsync({ fisoId: Number(selectedFiso), stakepoolIds: signupsArray });
      setOpenSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminMenu>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h2" sx={{ mt: 10, mb: 4, fontWeight: '700' }}>
          Edit Stakepool Signups
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="project-select-label">Project</InputLabel>
          <Select
            labelId="project-select-label"
            id="project-select"
            value={selectedProject || ''}
            label="Project"
            onChange={handleProjectChange}
          >
            {projectList?.map((project) => (
              <MenuItem key={project.slug} value={project.slug}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="fiso-select-label">FISO</InputLabel>
          <Select
            labelId="fiso-select-label"
            id="fiso-select"
            value={selectedFiso?.toString() || ''}
            label="FISO"
            onChange={handleFisoChange}
          >
            {fisos?.map((fiso, i) => (
              <MenuItem key={fiso.id} value={fiso.id}>
                Id: {fiso.id}, start: {fiso.startEpoch}, end: {fiso.endEpoch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Stakepool Signups"
          variant="filled"
          value={signups}
          onChange={handleChange}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          Submit
        </Button>
      </Box>
      <Snackbar open={openError} autoHideDuration={6000} onClose={() => setOpenError(false)}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Signups added successfully!
        </Alert>
      </Snackbar>
    </AdminMenu>
  );
};

export default AddSpoSignupsManuallyPage;
