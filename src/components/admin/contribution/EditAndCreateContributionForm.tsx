
import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useTheme
} from '@mui/material';
import { trpc } from '@lib/utils/trpc';
import { useAlert } from '@contexts/AlertContext';
import MultiSelectCountry from '@components/MultiSelectCountry';
import SelectWhitelist from './SelectWhitelist';
import DraggableList from '../hero-carousel/ItemReorder';
import SalesTermsReorder from './SaleTermsReorder';
import AcceptedCurrencies from './AcceptedCurrencies';
import { getAllSupportedTokens } from '@lib/currencies';

type EditAndCreateContributionFormProps = {
  mode: 'create' | 'edit';
  selectedRound?: number | null;  // Only for 'edit' mode
  project: TProjectBase;
};

const initForm = {
  id: 0,
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
  whitelistSlug: '',
  restrictedCountries: [],
  recipientAddress: '',
  saleTerms: '',
  acceptedCurrencies: []
};

const formatDateForDateTimeLocal = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth() returns 0-11
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const EditAndCreateContributionForm: FC<EditAndCreateContributionFormProps> = ({ mode, project, selectedRound }) => {
  const { addAlert } = useAlert();
  const [form, setForm] = useState<TContributionRoundForm>(initForm);
  const [isLoading, setLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedWhitelist, setSelectedWhitelist] = useState<string | null>(null)
  const [salesTerms, setSalesTerms] = useState<ISalesTerm[]>([]);
  const [newTerm, setNewTerm] = useState<ISalesTerm>({ header: '', bodyText: '' });
  const [refetchContributionRound, setRefetchContributionRounds] = useState(false)
  const theme = useTheme()

  const { data: whitelistData } = trpc.whitelist.listProjectWhitelists.useQuery({ projectSlug: project?.slug ?? '' })

  const roundQuery = trpc.contributions.getContributionRoundsByProjectSlug.useQuery(
    { projectSlug: project?.slug || '' },
    { enabled: !!project?.slug }
  );

  // Fetch round details for edit mode
  useEffect(() => {
    if (mode === 'edit' && selectedRound) {
      const fetchRound = async () => {
        try {
          const round = roundQuery.data?.find(round => round.id === Number(selectedRound))
          if (round) {
            const datesToString = {
              ...round,
              startDate: formatDateForDateTimeLocal(round.startDate),
              endDate: formatDateForDateTimeLocal(round.endDate),
            }
            // console.log(datesToString)
            setForm(datesToString);
            setSelectedCountries(round.restrictedCountries);
            if (round.saleTerms) setSalesTerms(JSON.parse(round.saleTerms))
          }
          else setForm(initForm)
        } catch (error) {
          addAlert('error', 'Failed to load round details');
        }
      };
      fetchRound();
    }
  }, [mode, selectedRound, refetchContributionRound]);

  const handleSalesTermChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTerm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSalesTerm = () => {
    if (newTerm.header && newTerm.bodyText) {
      setSalesTerms(prev => [...prev, newTerm]);
      setNewTerm({ header: '', bodyText: '' });
    }
  };

  const removeSalesTerm = (index: number) => {
    setSalesTerms(prev => prev.filter((_, i) => i !== index));
  };

  const handleReoderItems = (newOrder: ISalesTerm[]) => {
    setSalesTerms(newOrder);
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCurrencyChange = (event: SelectChangeEvent<string>) => {
    setForm(prev => ({ ...prev, currency: event.target.value }));
  };

  const allTokens = getAllSupportedTokens();

  const editContributionRoundMutation = trpc.contributions.updateContributionRound.useMutation();
  const addContributionRoundMutation = trpc.contributions.addContributionRound.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = {
      ...form,
      whitelistSlug: selectedWhitelist || undefined,
      tokenTarget: Number(form.tokenTarget),
      price: Number(form.price),
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      projectName: project.name,
      projectSlug: project.slug,
      restrictedCountries: selectedCountries,
      saleTerms: JSON.stringify(salesTerms)
    };

    try {
      if (mode === 'create') {
        await addContributionRoundMutation.mutateAsync(submissionData);
      }
      if (mode === 'edit' && selectedRound !== null && selectedRound !== undefined) {
        await editContributionRoundMutation.mutateAsync({ ...submissionData, id: selectedRound });
      }
      addAlert('success', `Contribution round ${mode === 'create' ? 'added' : 'updated'} successfully!`);
    } catch (error) {
      addAlert('error', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} maxWidth="md">
        <Grid item xs={12}>
          <SelectWhitelist selectedWhitelist={selectedWhitelist} setSelectedWhitelist={setSelectedWhitelist} whitelistData={whitelistData} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            name="name"
            label="Name"
            variant="filled"
            value={form.name}
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
            value={form.saleType}
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
            value={form.tokenTicker}
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
            value={form.tokenTarget}
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
            value={form.startDate}
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
            value={form.endDate}
            onChange={handleChange}
            type="datetime-local"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required variant="filled">
            <InputLabel id="currency-select-label">Exchange Currency</InputLabel>
            <Select
              labelId="currency-select-label"
              id="currency-select"
              value={form.currency}
              label="Exchange Currency"
              onChange={handleCurrencyChange}
            >
              {allTokens.map((token) => (
                <MenuItem key={`${token.symbol}-${token.parentBlockchainName}`} value={token.symbol}>
                  {`${token.name} (${token.symbol}) on ${token.parentBlockchainName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            required
            name="price"
            label="Price"
            variant="filled"
            value={form.price}
            onChange={handleChange}
            type="number"
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{
            background: 'rgba(155,155,155,0.1)',
            border: '1px solid rgba(155,155,155,0.5)',
            borderRadius: '12px',
            p: 2
          }}>
            <AcceptedCurrencies setRefetchBool={setRefetchContributionRounds} contributionRound={form} setForm={setForm} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <MultiSelectCountry selectedCountries={selectedCountries} setSelectedCountries={setSelectedCountries} />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Sales Terms</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  name="header"
                  label="Term Header"
                  variant="filled"
                  value={newTerm.header}
                  onChange={handleSalesTermChange}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  name="bodyText"
                  label="Term Body"
                  variant="filled"
                  value={newTerm.bodyText}
                  onChange={handleSalesTermChange}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" onClick={addSalesTerm} fullWidth>
                  Add Term
                </Button>
              </Grid>
            </Grid>

          </Box>
          {salesTerms && <SalesTermsReorder
            salesTerms={salesTerms}
            setNewOrder={handleReoderItems}
            removeSalesTerm={removeSalesTerm}
          />}
        </Grid>

        <Grid item xs={12}>
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ mt: 2 }}>
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditAndCreateContributionForm;
