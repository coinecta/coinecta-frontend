import React, { FC, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useAlert } from '@contexts/AlertContext';
import SelectContributionRound from './SelectContributionRound';
import { useDialog } from '@contexts/DialogContext';

interface IDeleteContributionRoundProps {
  selectedProject: string | null;
}

const DeleteContributionRound: FC<IDeleteContributionRoundProps> = ({ selectedProject }) => {
  const { addAlert } = useAlert();
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const deleteRoundMutation = trpc.contributions.deleteContributionRound.useMutation();
  const roundQuery = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: selectedProject || '' },
    { enabled: !!selectedProject }
  );

  const { showDialog, hideDialog } = useDialog();
  const handleDeleteConfirm = () => {
    showDialog({
      title: "Confirm delete",
      description: `Are you sure you want to do delete ${roundQuery.data?.find((item) => item.id === Number(selectedRound))?.name}?`,
      buttons: [
        { text: "Cancel", onClick: hideDialog },
        {
          text: "Confirm", onClick: () => {
            handleDelete();
            hideDialog();
          }
        },
      ],
    });
  };

  const handleDelete = async () => {
    try {
      await deleteRoundMutation.mutateAsync({ id: Number(selectedRound) });
      addAlert('success', 'Contribution round deleted successfully!');
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1 }}>Delete Contribution Round</Typography>
      <Box sx={{ maxWidth: '350px' }}>
        <SelectContributionRound roundData={roundQuery.data} selectedRound={selectedRound} setSelectedRound={setSelectedRound} />
      </Box>
      <Button variant="contained" onClick={handleDeleteConfirm}>Delete Round</Button>
    </>
  );
};

export default DeleteContributionRound;