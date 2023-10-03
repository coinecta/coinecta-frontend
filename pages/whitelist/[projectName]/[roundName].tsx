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
import SumsubWebSdk from '@sumsub/websdk-react';
import { v4 as uuidv4 } from 'uuid';

// states
const NOT_STARTED = 'NOT_STARTED';
const PUBLIC = 'PUBLIC';
const ROUND_END = 'ROUND_END';

const initialFormData = {
  name: '',
  email: '',
  adaAddresses: [''],
  usdValue: 0,
}

const initialFormErrors = {
  email: false,
  adaAddresses: false,
  usdValue: false,
}

const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

interface AdditionalDetails {
  min_stake: number;
  add_to_footer: boolean;
  staker_snapshot_whitelist: boolean;
  early_bird: null | any;
}

interface CheckBoxes {
  checkBoxText: string[];
}

interface CoinectaEvent {
  additionalDetails: AdditionalDetails;
  buffer_sigusd: number;
  checkBoxes: CheckBoxes;
  details: string;
  end_dtz: string;
  eventId: number;
  eventName: string;
  id: number;
  individualCap: number;
  projectName: string;
  roundName: string;
  start_dtz: string;
  subtitle: string;
  title: string;
  total_sigusd: number;
}

const emailRegex = /\S+@\S+\.\S+/;

const Whitelist = () => {
  // routing
  const router = useRouter();
  const { projectName, roundName } = router.query;
  // whitelist data
  const [whitelistData, setWhitelistData] = useState<CoinectaEvent | undefined>(undefined);
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
          `${process.env.API_URL}/whitelist/events/coinecta-wl-${projectName}/${roundName}?format=adjust_early_bird`
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
  //     adaAddresses: wallet,
  //   });
  //   if (wallet) {
  //     // get ergopad staked from address
  //     getErgoPadStaked();
  //     setFormErrors({
  //       ...initialFormErrors,
  //       adaAddresses: false,
  //     });
  //   } else {
  //     setTotalStaked(0);
  //     setFormErrors({
  //       ...initialFormErrors,
  //       adaAddresses: true,
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

    if (e.target.name === 'usdValue') {
      if (e.target.value === '[max]' && whitelistData?.additionalDetails?.staker_snapshot_whitelist) {
        setFormErrors({
          ...formErrors,
          usdValue: false,
        });
      }
      else {
        const sigNumber = Number(e.target.value);
        if (whitelistData?.individualCap && sigNumber <= whitelistData.individualCap && sigNumber >= 100) {
          setFormErrors({
            ...formErrors,
            usdValue: false,
          });
        } else {
          setFormErrors({
            ...formErrors,
            usdValue: true,
          });
        }
      }
    }

    if (e.target.name === 'adaAddresses') {
      updateFormData({
        ...formData,
        // Trimming any whitespace
        [e.target.name]: [e.target.value.trim()],
      });
    }
    else {
      updateFormData({
        ...formData,

        // Trimming any whitespace
        [e.target.name]: e.target.value.trim(),
      });
    }
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
      formData.adaAddresses !== '' &&
      formData.usdValue !== 0;
    const errorCheck = Object.values(formErrors).every((v) => v === false);

    const form = {
      name: formData.name,
      email: formData.email,
      usdValue: formData.usdValue,
      adaAddresses: formData.adaAddresses,
      event: whitelistData?.eventName,
      kycApproval: false,
      tpe: 'cardano'
    };

    if (errorCheck && emptyCheck) {
      console.log(form)
      try {
        const res = await axios.post(
          `${process.env.API_URL}/whitelist/signup`,
          { ...form }
        );
        // modal for success message
        setSuccessMessage(
          whitelistData?.additionalDetails.staker_snapshot_whitelist
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
        if (!['email', 'usdValue'].includes(key) && value == '') {
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
          key === 'usdValue' &&
          value === 0
        ) {
          // handle usdValue case
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


  // SUMSUB STUFF
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const userId = '1234abcd'

  useEffect(() => {
    // Fetch the access token from your API when the component mounts
    fetch(`/api/getAccessToken?userId=${userId}`) // Replace 'yourUserId' with the actual user ID
      .then(response => response.json())
      .then(data => setAccessToken(data.token))
      .catch(error => console.error('Error fetching access token:', error));
  }, []);

  const expirationHandler = async () => {
    // Fetch a new access token from your API when the current token has expired
    const response = await fetch(`/api/getAccessToken?userId=${userId}`); // Replace 'yourUserId' with the actual user ID
    const data = await response.json();
    setAccessToken(data.token);
    return data.token;
  }

  const config = {
    // Configuration settings for the SDK
  };

  const options = {
    // Options for the SDK
  };

  const messageHandler = (message: any) => {
    // Handle messages from the SDK
    console.log("Received message from SDK:", message);
  }

  const errorHandler = (error: any) => {
    // Handle errors from the SDK
    console.error("Received error from SDK:", error);
  }

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
          <Container maxWidth="md" sx={{ py: 12 }}>
            {whitelistData !== undefined ? (
              <>
                <Typography variant="h3" component="h1" sx={{ fontWeight: '600' }}>
                  {whitelistData.title} Whitelist Form
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                  {whitelistData.subtitle}
                </Typography>



                <Box component="form" noValidate onSubmit={handleSubmit}>
                  {/* <Typography sx={{ mb: 3 }}>
                    {whitelistData.additionalDetails.min_stake != 0 && `You must have at least ${whitelistData.additionalDetails.min_stake} $CNCT tokens staked from the signup address to get early access. `}
                    You have {totalStaked} $CNCT tokens staked from this address.
                  </Typography> */}

                  <Grid container spacing={2} sx={{ mb: '50px' }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        sx={{ mt: 1 }}
                        InputProps={{ disableUnderline: true }}
                        fullWidth
                        name="name"
                        label="Your Full Name"
                        error={formErrors.name}
                        id="name"
                        variant="filled"
                        helperText={
                          formErrors.name &&
                          'Please enter your full name'
                        }
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      spacing={3}
                      alignItems="stretch"
                    >
                      <Typography>
                        Enter the maximum, in USD value, you would like to invest. There is no guarantee you will be eligible for this amount.
                      </Typography>
                      <TextField
                        value={formData.usdValue}
                        sx={{ mt: 1 }}
                        InputProps={{ disableUnderline: true }}
                        required
                        fullWidth
                        id="usdValue"
                        label="How much would you like to invest in USD value"
                        name="usdValue"
                        variant="filled"
                        helperText={
                          formErrors.usdValue &&
                          (whitelistData?.additionalDetails
                            ?.staker_snapshot_whitelist
                            ? `Please enter a positive value`
                            : `Please enter between 100 and ${whitelistData.individualCap} USD`)
                        }
                        onChange={handleChange}
                        error={formErrors.usdValue}
                      />
                      {whitelistData?.additionalDetails?.staker_snapshot_whitelist && <Grid item xs={2}>
                        <Button
                          variant="contained"
                          sx={{ my: 2, mx: 1 }}
                          onClick={() => {
                            handleChange({
                              target: {
                                name: 'usdValue',
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
                      <Typography>
                        Select your primary wallet address for whitelisting.
                      </Typography>
                      <FormControl
                        sx={{ mt: 1 }}
                        variant="filled"
                        fullWidth
                        required

                        error={formErrors.adaAddresses}
                      >
                        <InputLabel
                          htmlFor="adaAddresses"
                        >
                          Ada Wallet Address
                        </InputLabel>
                        <FilledInput
                          id="adaAddresses"
                          disableUnderline={true}
                          name="adaAddresses"
                          onChange={handleChange}
                          sx={{
                            width: '100%',
                            // border: '1px solid rgba(82,82,90,1)',
                            // borderRadius: '4px',
                          }}
                        />
                        <FormHelperText>
                          Your address will be pre-approved on the whitelist. You will not be able to change it later.
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {accessToken ? (
                    <Box sx={{}}>
                      <Typography variant="h4">
                        KYC Approval
                      </Typography>
                      <SumsubWebSdk
                        accessToken={accessToken}
                        expirationHandler={expirationHandler}
                        config={config}
                        options={options}
                        onMessage={messageHandler}
                        onError={errorHandler}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ mb: 3 }}>No access token</Box>
                  )}
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
                      sx={{ mb: 2 }}
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
                      'We apologize for the inconvenience, the signup form has closed.'}
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

              </>
            ) : (
              <Typography>Looks like the whitelist event you are looking for doesn&apos;t exist.</Typography>
            )}
          </Container>
        </>
      )}
    </>
  );
};

export default Whitelist;
