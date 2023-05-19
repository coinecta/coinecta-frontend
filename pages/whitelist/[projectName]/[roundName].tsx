import { useState, useEffect, forwardRef } from 'react';
import { useRouter } from 'next/router';
import {
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  Container,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
  FilledInput,
  FormHelperText,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TelegramIcon from '@mui/icons-material/Telegram';
import DiscordIcon from '@components/svgs/DiscordIcon';
import MarkdownRender from '@components/MarkdownRender';
import axios from 'axios';

// states
const NOT_STARTED = 'NOT_STARTED';
const PUBLIC = 'PUBLIC';
const ROUND_END = 'ROUND_END';

const initialFormData = {
  email: '',
  ergoAddress: '',
  sigValue: 0,
}

const initialFormErrors = {
  email: false,
  ergoAddress: false,
  sigValue: false,
}

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const emailRegex = /\S+@\S+\.\S+/;

const Whitelist = () => {
  // routing
  const router = useRouter();
  const { projectName, roundName } = router.query;
  // whitelist data
  const [whitelistData, setWhitelistData] = useState<any>(null);
  const [whitelistState, setWhitelistState] = useState<string>(NOT_STARTED);
  const [whitelistLoading, setWhitelistLoading] = useState<boolean>(true);
  const [checkboxState, setCheckboxState] = useState<any>([]);
  // set true to disable submit button
  const [buttonDisabled, setbuttonDisabled] = useState(true);
  // form data
  const [formErrors, setFormErrors] = useState<any>(initialFormErrors);
  const [formData, updateFormData] = useState<any>(initialFormData);
  // loading spinner for submit button
  const [isLoading, setLoading] = useState(false);
  // open success modal
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Saved');
  // change error message for error snackbar
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    'Please eliminate form errors and try again'
  );
  // total staked
  const [totalStaked, setTotalStaked] = useState(0);
  // brings wallet data from AddWallet modal component. Will load from localStorage if wallet is set

  useEffect(() => {
    

    const getWhitelistData = async () => {
      setWhitelistLoading(true);
      try {
        const res = await axios.get(
          `${process.env.API_URL}/whitelist/events/${projectName}/${roundName}?format=adjust_early_bird`
        );
        setWhitelistData(res.data);
        setCheckboxState(
          res.data.checkBoxes.checkBoxText.map((text: string) => {
            return { text: text, check: false };
          })
        );
        const startTime = Date.parse(res.data.start_dtz);
        const endTime = Date.parse(res.data.end_dtz);
        if (Date.now() < startTime) {
          setWhitelistState(NOT_STARTED);
        } else if (Date.now() > endTime) {
          setWhitelistState(ROUND_END);
        } else {
          setWhitelistState(PUBLIC);
        }
      } catch (e) {
        console.log(e);
      }
      setWhitelistLoading(false);
    };

    if (projectName && roundName) getWhitelistData();
  }, [projectName, roundName]);

  // useEffect(() => {
  //   const getErgoPadStaked = async () => {
  //     try {
  //       const res = await axios.post(
  //         `${process.env.API_URL}/staking/staked/`,
  //         {
  //           addresses: [wallet],
  //         },
  //         defaultOptions
  //       );
  //       setTotalStaked(Math.round(res.data.totalStaked * 100) / 100);
  //     } catch (e) {
  //       setTotalStaked(0);
  //       console.log(e);
  //     }
  //   };

  //   updateFormData({
  //     ...initialFormData,
  //     ergoAddress: wallet,
  //   });
  //   if (wallet) {
  //     // get ergopad staked from address
  //     getErgoPadStaked();
  //     setFormErrors({
  //       ...initialFormErrors,
  //       ergoAddress: false,
  //     });
  //   } else {
  //     setTotalStaked(0);
  //     setFormErrors({
  //       ...initialFormErrors,
  //       ergoAddress: true,
  //     });
  //   }
  // }, [wallet]);

  useEffect(() => {
    if (isLoading) {
      setbuttonDisabled(true);
    } else {
      setbuttonDisabled(false);
    }
  }, [isLoading]);

  const checkboxError =
    checkboxState.filter((checkBoxes: any) => !checkBoxes.check).length !== 0;

  useEffect(() => {
    if (!checkboxError && whitelistState === PUBLIC) {
      setbuttonDisabled(false);
    } else {
      setbuttonDisabled(true);
    }
  }, [checkboxError, whitelistState]);

  const handleChange = (e: any) => {
    if (e.target.value == '' && e.target.name !== 'email') {
      setFormErrors({
        ...formErrors,
        [e.target.name]: true,
      });
    } else {
      setFormErrors({
        ...formErrors,
        [e.target.name]: false,
      });
    }

    if (e.target.name === 'email') {
      if (emailRegex.test(e.target.value) || e.target.value === '') {
        setFormErrors({
          ...formErrors,
          email: false,
        });
      } else {
        setFormErrors({
          ...formErrors,
          email: true,
        });
      }
    }

    if (e.target.name === 'sigValue') {
      if (e.target.value === '[max]' && whitelistData?.additionalDetails?.staker_snapshot_whitelist) {
        setFormErrors({
          ...formErrors,
          sigValue: false,
        });
      }
      else {
        const sigNumber = Number(e.target.value);
        if (sigNumber <= whitelistData.individualCap && sigNumber > 0) {
          setFormErrors({
            ...formErrors,
            sigValue: false,
          });
        } else {
          setFormErrors({
            ...formErrors,
            sigValue: true,
          });
        }
      }
    }

    updateFormData({
      ...formData,

      // Trimming any whitespace
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleChecked = (e: any) => {
    setCheckboxState(
      checkboxState.map((checkbox: any, index: number) => {
        if (index == e.target.name) {
          return {
            ...checkbox,
            check: e.target.checked,
          };
        }
        return checkbox;
      })
    );
  };

  // snackbar for error reporting
  const handleCloseError = (reason: any) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenError(false);
  };

  // modal for success message
  const handleCloseSuccess = () => {
    setOpenSuccess(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const emptyCheck =
      formData.ergoAddress !== '' &&
      formData.sigValue !== 0;
    const errorCheck = Object.values(formErrors).every((v) => v === false);

    const form = {
      name: '__anon_ergonaut',
      email: formData.email,
      sigValue: formData.sigValue === '[max]' ? 1 : formData.sigValue,
      ergoAddress: formData.ergoAddress,
      event: whitelistData.eventName,
    };

    if (errorCheck && emptyCheck) {
      try {
        const res = await axios.post(
          `${process.env.API_URL}/whitelist/signup`,
          { ...form }
        );
        // modal for success message
        setSuccessMessage(
          whitelistData.additionalDetails.staker_snapshot_whitelist
            ? 'Saved'
            : `Saved: ${res.data.detail}`
        );
        setOpenSuccess(true);
      } catch (err: any) {
        // snackbar for error message
        setErrorMessage(
          'Error: ' + err.response.status + ' - ' + err.response.data
        );
        setOpenError(true);
      }
    } else {
      let updateErrors = {};
      Object.entries(formData).forEach((entry: [string, any]) => {
        const [key, value] = entry;
        // special patch for email regex
        if (!['email', 'sigValue'].includes(key) && value == '') {
          // default
          let newEntry = { [key]: true };
          updateErrors = { ...updateErrors, ...newEntry };
        } else if (
          key === 'email' &&
          !(emailRegex.test(value) || value === '')
        ) {
          // email check
          let newEntry = { [key]: true };
          updateErrors = { ...updateErrors, ...newEntry };
        } else if (
          key === 'sigValue' &&
          value === 0
        ) {
          // handle sigValue case
          let newEntry = { [key]: true };
          updateErrors = { ...updateErrors, ...newEntry };
        }
      });

      setFormErrors({
        ...formErrors,
        ...updateErrors,
      });

      // snackbar for error message
      setErrorMessage('Please eliminate form errors and try again');
      setOpenError(true);
    }
    // turn off loading spinner for submit button
    setLoading(false);
  };

  const theme = useTheme()

  return (
    <>
      {whitelistLoading ? (
        <>
          <Container sx={{ mb: '3rem' }}>
            <CircularProgress
              size={24}
              sx={{
                position: 'relative',
                left: '50%',
                marginLeft: '-12px',
                marginTop: '120px',
              }}
            />
          </Container>
        </>
      ) : (
        <>
          {whitelistData ? (
            <>
              <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
                Title
              </Container>
              <Grid
                container
                maxWidth="lg"
                sx={{
                  mx: 'auto',
                  flexDirection: 'row-reverse',
                  px: { xs: 2, md: 3 },
                }}
              >
                <Grid item md={4} sx={{ pl: { md: 4, xs: 0 } }}>
                  <Box sx={{ mt: { md: 0, xs: 4 } }}>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: '700', lineHeight: '1.2' }}
                    >
                      Join the discussion
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1rem', mb: 3 }}>
                      Stay updated on the latest ErgoPad annoucements and
                      upcoming events.
                    </Typography>
                    <Box>
                      <a
                        href="https://t.me/ergopad_chat"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          startIcon={<TelegramIcon />}
                          variant="contained"
                        >
                          Telegram
                        </Button>
                      </a>
                      <a
                        href="https://discord.gg/E8cHp6ThuZ"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          startIcon={<DiscordIcon />}
                          variant="contained"
                        >
                          Discord
                        </Button>
                      </a>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: '700', lineHeight: '1.2', mt: 6 }}
                  >
                    Details
                  </Typography>
                  <MarkdownRender description={whitelistData.details} />
                </Grid>
                <Grid item md={8}>
                  <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: '700' }}>
                      Application Form
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      {whitelistData.additionalDetails.min_stake != 0
                        ? `You must have at least ${whitelistData.additionalDetails.min_stake} ErgoPad staked from the signup
                      address to get early access. `
                        : null}
                      You have {totalStaked} ergopad tokens staked from this
                      address.
                    </Typography>
                    <Grid container spacing={2}>
                      {/* <Grid item xs={12}>
                        <TextField
                          sx={{ mt: 1 }}
                          InputProps={{ disableUnderline: true }}
                          fullWidth
                          name="email"
                          label="Your Email"
                          error={formErrors.email}
                          id="email"
                          variant="filled"
                          helperText={
                            formErrors.email &&
                            'Please enter a valid email address'
                          }
                          onChange={handleChange}
                        />
                      </Grid> */}
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={3}
                        alignItems="stretch"
                      >
                        <Grid item sx={{ mb: -3 }}>
                          <Typography color="text.secondary">
                            Enter how much in SigUSD you&apos;d like to invest.
                            You can send ergo or SigUSD on the sale date.
                            {
                              whitelistData?.additionalDetails
                                ?.staker_snapshot_whitelist &&
                                " If you wish to obtain fewer whitelist tokens than you are allocated for, please fill out the field below with the maximum sigUSD amount of tokens you wish to acquire."
                            }
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={whitelistData?.additionalDetails?.staker_snapshot_whitelist ? 10 : 12}
                        >
                          <TextField
                            value={formData.sigValue}
                            sx={{ mt: 1 }}
                            InputProps={{ disableUnderline: true }}
                            required
                            fullWidth
                            id="sigValue"
                            label="How much would you like to invest in SigUSD value"
                            name="sigValue"
                            variant="filled"
                            helperText={
                              formErrors.sigValue &&
                              (whitelistData?.additionalDetails
                                ?.staker_snapshot_whitelist
                                ? `Please enter a positive value`
                                : `Please enter between 1 and ${whitelistData.individualCap} sigUSD`)
                            }
                            onChange={handleChange}
                            error={formErrors.sigValue}
                          />
                        </Grid>
                        {whitelistData?.additionalDetails?.staker_snapshot_whitelist && <Grid item xs={2}>
                          <Button
                            variant="contained"
                            sx={{ my: 2, mx: 1 }}
                            onClick={() => {
                              handleChange({
                                target: {
                                  name: 'sigValue',
                                  value: '[max]',
                                }
                              });
                            }}
                          >
                            Max
                          </Button>
                        </Grid>}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography color="text.secondary">
                          Select your primary wallet address for whitelisting.
                        </Typography>
                        <FormControl
                          sx={{ mt: 1 }}
                          variant="filled"
                          fullWidth
                          required
                          error={formErrors.ergoAddress}
                        >
                          <InputLabel
                            htmlFor="ergoAddress"
                            sx={{
                              '&.Mui-focused': { color: 'text.secondary' },
                            }}
                          >
                            Ergo Wallet Address
                          </InputLabel>
                          <FilledInput
                            id="ergoAddress"
                            
                            
                            
                            disableUnderline={true}
                            name="ergoAddress"
                            sx={{
                              width: '100%',
                              border: '1px solid rgba(82,82,90,1)',
                              borderRadius: '4px',
                            }}
                          />
                          <FormHelperText>
                            Your address will be pre-approved on the whitelist
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <FormControl required error={checkboxError}>
                      <FormGroup sx={{ mt: 2 }}>
                        {checkboxState.map((checkbox: any, index: number) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={checkbox.check}
                                onChange={handleChecked}
                                name={index.toString()}
                              />
                            }
                            label={checkbox.text}
                            sx={{
                              color: theme.palette.text.secondary,
                              mb: 2,
                            }}
                          />
                        ))}
                        <FormHelperText>
                          {checkboxError &&
                            'Please accept the terms before submitting'}
                        </FormHelperText>
                      </FormGroup>
                    </FormControl>
                    <Box sx={{ position: 'relative' }}>
                      <Button
                        type="submit"
                        fullWidth
                        disabled={buttonDisabled}
                        // disabled={true}
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Submit
                      </Button>
                      {isLoading && (
                        <CircularProgress
                          size={24}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-9px',
                            marginLeft: '-12px',
                          }}
                        />
                      )}
                    </Box>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {whitelistState === ROUND_END &&
                        'We apologize for the inconvenience, the round is sold out.'}
                    </Typography>
                    <Typography sx={{ color: theme.palette.text.secondary }}>
                      {whitelistState === NOT_STARTED &&
                        'This form is not yet active. The round will start at ' +
                          new Date(
                            Date.parse(whitelistData.start_dtz)
                          ).toLocaleString(navigator.language, {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour12: true,
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZoneName: 'long',
                          })}
                    </Typography>
                    <Snackbar
                      open={openError}
                      autoHideDuration={6000}
                      onClose={handleCloseError}
                    >
                      <Alert
                        onClose={handleCloseError}
                        severity="error"
                        sx={{ width: '100%' }}
                      >
                        {errorMessage}
                      </Alert>
                    </Snackbar>
                    <Snackbar
                      open={openSuccess}
                      autoHideDuration={6000}
                      onClose={handleCloseSuccess}
                    >
                      <Alert
                        onClose={handleCloseSuccess}
                        severity="success"
                        sx={{ width: '100%' }}
                      >
                        {successMessage}
                      </Alert>
                    </Snackbar>
                  </Box>
                </Grid>
              </Grid>
            </>
          ) : (
            <Typography>Looks like the whitelist event you are looking for doesn&apos;t exist.</Typography>
          )}
        </>
      )}
    </>
  );
};

export default Whitelist;
