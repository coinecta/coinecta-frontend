import { ChangeEvent, FC, use, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAlert } from '@contexts/AlertContext';
import Grid from '@mui/system/Unstable_Grid/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { BLOCKCHAINS } from '@lib/currencies';
import { getShorterAddress } from '@lib/utils/general';

interface Props {
  contributionRound: TContributionRoundForm;
  setForm: React.Dispatch<React.SetStateAction<TContributionRoundForm>>;
  setRefetchBool: React.Dispatch<React.SetStateAction<boolean>>;
}

const AcceptedCurrencies: FC<Props> = ({ contributionRound, setForm, setRefetchBool }) => {
  const { addAlert } = useAlert();
  const [newCurrency, setNewCurrency] = useState<Omit<TAcceptedCurrency, 'id' | 'contributionRoundId'>>({
    receiveAddress: '',
    currency: '',
    blockchain: '',
  });
  const [editingCurrency, setEditingCurrency] = useState<TAcceptedCurrency | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewCurrency(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlockchainChange = (e: SelectChangeEvent) => {
    setNewCurrency(prev => ({ ...prev, blockchain: e.target.value, currency: '' }));
  };

  const handleCurrencyChange = (e: SelectChangeEvent) => {
    setNewCurrency(prev => ({ ...prev, currency: e.target.value }));
  };

  const handleAddCurrency = () => {
    if (newCurrency.currency && newCurrency.blockchain && newCurrency.receiveAddress) {
      const newAcceptedCurrency: TAcceptedCurrency = {
        ...newCurrency,
        id: Date.now().toString(),
        contributionRoundId: contributionRound.id || 0,
      };

      setForm(prev => ({
        ...prev,
        acceptedCurrencies: [...prev.acceptedCurrencies, newAcceptedCurrency]
      }));

      setNewCurrency({ receiveAddress: '', currency: '', blockchain: '' });
      addAlert('success', 'Currency added successfully');
    } else {
      addAlert('error', 'Please fill in all fields');
    }
  };

  const handleDelete = (id: string) => {
    setForm(prev => ({
      ...prev,
      acceptedCurrencies: prev.acceptedCurrencies.filter(item => item.id !== id)
    }));
    addAlert('success', 'Currency removed successfully');
    setRefetchBool(prev => !prev);
  };

  const handleEdit = (currency: TAcceptedCurrency) => {
    setEditingCurrency(currency);
  };

  const handleCancelEdit = () => {
    setEditingCurrency(null);
  };

  const handleSaveEdit = () => {
    if (editingCurrency) {
      setForm(prev => ({
        ...prev,
        acceptedCurrencies: prev.acceptedCurrencies.map(item =>
          item.id === editingCurrency.id ? editingCurrency : item
        )
      }));
      setEditingCurrency(null);
      addAlert('success', 'Currency updated successfully');
      setRefetchBool(prev => !prev);
    }
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (editingCurrency) {
      setEditingCurrency(prev => ({ ...prev!, [e.target.name]: e.target.value }));
    }
  };

  const handleEditBlockchainChange = (e: SelectChangeEvent) => {
    if (editingCurrency) {
      setEditingCurrency(prev => ({ ...prev!, blockchain: e.target.value, currency: '' }));
    }
  };

  const handleEditCurrencyChange = (e: SelectChangeEvent) => {
    if (editingCurrency) {
      setEditingCurrency(prev => ({ ...prev!, currency: e.target.value }));
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: '700' }}>
        Accepted Currencies
      </Typography>


      <List sx={{ mb: 4 }}>
        {contributionRound.acceptedCurrencies.length === 0 && '...None added yet'}
        {contributionRound.acceptedCurrencies.map((item) => (
          <ListItem
            key={item.id}
            disableGutters
            sx={{ display: 'block', mb: 2 }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box flexGrow={1} mr={2}>
                {editingCurrency?.id === item.id ? (
                  <Grid container spacing={2}>
                    <Grid xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id={`edit-blockchain-select-label-${item.id}`}>Blockchain</InputLabel>
                        <Select
                          labelId={`edit-blockchain-select-label-${item.id}`}
                          id={`edit-blockchain-select-${item.id}`}
                          value={editingCurrency?.blockchain}
                          label="Blockchain"
                          onChange={handleEditBlockchainChange}
                        >
                          {BLOCKCHAINS.map((blockchain) => (
                            <MenuItem key={blockchain.symbol} value={blockchain.symbol}>
                              {blockchain.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id={`edit-currency-select-label-${item.id}`}>Currency</InputLabel>
                        <Select
                          labelId={`edit-currency-select-label-${item.id}`}
                          id={`edit-currency-select-${item.id}`}
                          value={editingCurrency?.currency}
                          label="Currency"
                          onChange={handleEditCurrencyChange}
                          disabled={!editingCurrency?.blockchain}
                        >
                          {BLOCKCHAINS.find(b => b.symbol === editingCurrency?.blockchain)?.tokens.map((token) => (
                            <MenuItem key={token.symbol} value={token.symbol}>
                              {token.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={12}>
                      <TextField
                        fullWidth
                        name="receiveAddress"
                        label="Receive Address"
                        variant="outlined"
                        value={editingCurrency?.receiveAddress}
                        onChange={handleEditChange}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Tooltip title={item.receiveAddress}>
                    <ListItemText
                      primary={`${item.currency} on ${item.blockchain}`}
                      secondary={`Receive Address: ${item.receiveAddress.length > 44 ? getShorterAddress(item.receiveAddress, 22) : item.receiveAddress}`}
                    />
                  </Tooltip>
                )}
              </Box>
              <Box>
                {editingCurrency?.id === item.id ? (
                  <>
                    <IconButton aria-label="save" onClick={handleSaveEdit}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton aria-label="cancel" onClick={handleCancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton aria-label="edit" onClick={() => handleEdit(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => handleDelete(item.id!)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Add an accepted currency
      </Typography>
      <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="blockchain-select-label">Blockchain</InputLabel>
            <Select
              labelId="blockchain-select-label"
              id="blockchain-select"
              value={newCurrency.blockchain}
              label="Blockchain"
              onChange={handleBlockchainChange}
            >
              {BLOCKCHAINS.map((blockchain) => (
                <MenuItem key={blockchain.symbol} value={blockchain.symbol}>
                  {blockchain.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="currency-select-label">Currency</InputLabel>
            <Select
              labelId="currency-select-label"
              id="currency-select"
              value={newCurrency.currency}
              label="Currency"
              onChange={handleCurrencyChange}
              disabled={!newCurrency.blockchain}
            >
              {BLOCKCHAINS.find(b => b.symbol === newCurrency.blockchain)?.tokens.map((token) => (
                <MenuItem key={token.symbol} value={token.symbol}>
                  {token.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            fullWidth

            name="receiveAddress"
            label="Receive Address"
            variant="outlined"
            value={newCurrency.receiveAddress}
            onChange={handleChange}
          />
        </Grid>
        <Grid xs={12}>
          <Button onClick={handleAddCurrency} variant="contained">
            Add Currency
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcceptedCurrencies;