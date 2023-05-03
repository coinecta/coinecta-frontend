import React, { FC, useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from '@components/Link';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Box,
  useTheme,
  useMediaQuery,
  InputLabel,
  MenuItem,
  FormControl,
  TextField,
  Avatar
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { v4 as uuidv4 } from 'uuid';
import Select, { SelectChangeEvent } from '@mui/material/Select';

// NOTES: 
// 
// - We are assuming the start time is immediately, and the end 
//   time is until the user ends the sale or the item gets sold. 
// 
// - The seller wallet is derived from the connected wallet. The 
//   source addresses are also derived from the connected wallet. 
// 
// - The token is defined by the token the user is adding to the 
//   sale. There will only be one tokenID per sale. 
// 


interface ITokenDetailsExternal {
  tokenId: string;
  amount: number;
  rarity: string;
}

interface INewSaleExternal {
  name: string;
  description: string;
  startTime: Date; // now
  endTime: Date; // how to make it indefinite until the user cancels? 
  sellerWallet: string;
  password?: string;
  packs: {}[]; // will be used for price
  tokens: ITokenDetailsExternal[];
  sourceAddresses: string[];
}

interface ILocalSale {
  startTime: Date;
  endTime: Date;
  sellerWallet: string; // the seller's main address
  sourceAddresses: string[]; // an array of all their addresses if they connected with a dapp connector
  price: number;
  currency: 'SigUSD' | 'Erg';
  tokensById: string[];
  saleName: string;
  saleDescription: string;
}

const localSaleInit: ILocalSale = {
  startTime: new Date(),
  endTime: new Date(2147512000000),
  sellerWallet: '', // the seller's main address
  sourceAddresses: [''], // an array of all their addresses if they connected with a dapp connector
  price: 0,
  currency: 'SigUSD',
  tokensById: [''],
  saleName: '',
  saleDescription: '',
}

// uuidv4()

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    maxWidth: '600px',
    minWidth: '390px',
    border: 'none',
    margin: 'auto'
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

interface ISellTokensProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tokens: {
    name: string;
    collection?: string;
    artist: string;
    imgUrl: string;
  }[]
}

const SellTokens: FC<ISellTokensProps> = ({ open, setOpen, tokens }) => {
  const [submitting, setSubmitting] = useState<"submitting" | "success" | "failed" | undefined>(undefined)
  const [saleData, setSaleData] = useState([localSaleInit])

  const apiSimulatedTokenInfo = {
    royalty: 50, // value / 1000 = percent float 
  }

  useEffect(() => {
    setSaleData(tokens.map(() => { return localSaleInit }))
  }, [tokens])

  const handleSelectChange = (e: SelectChangeEvent, index: number) => {
    setSaleData((prevArray) => {
      const newArray = prevArray.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [e.target.name]: e.target.value // key could be hardcoded as 'currency' since its the only one used here. 
          }
        }
        return item
      })
      return newArray
    })
  };

  const handleChangeNum = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    setSaleData((prevArray) => {
      const newArray = prevArray.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [e.target.name]: e.target.value
          }
        }
        return item
      })
      return newArray
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    setSaleData((prevArray) => {
      const newArray = prevArray.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [e.target.name]: e.target.value
          }
        }
        return item
      })
      return newArray
    })
  }

  const handleClose = () => {
    setSubmitting(undefined)
    setOpen(false);
  };

  const submit = () => {
    setSubmitting("submitting")
  }

  const switchTitle = (param: string | undefined) => {
    switch (param) {
      case "submitting":
        return 'Awaiting Confirmation';
      case "success":
        return 'Success';
      case "failed":
        return 'Transaction Failed';
      default:
        return 'Sell Tokens';
    }
  }

  const switchContent = (param: string | undefined) => {
    switch (param) {
      case "submitting":
        return (
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <CircularProgress size={120} thickness={1} sx={{ mb: '12px' }} />
            <Typography
              sx={{
                fontWeight: '600',
                mb: '12px'
              }}
            >
              Awaiting your confirmation of the transaction in the dApp connector.
            </Typography>
            <Button onClick={() => setSubmitting("success")}>
              Test Success
            </Button>
            <Button onClick={() => setSubmitting("failed")}>
              Test Failed
            </Button>
          </Box>
        )
      case "success":
        return (
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <TaskAltIcon sx={{ fontSize: '120px' }} />
            <Typography
              sx={{
                fontWeight: '600',
                mb: '12px'
              }}
            >
              Transaction succeeded.
            </Typography>
          </Box>
        )
      case "failed":
        return (
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <CancelOutlinedIcon sx={{ fontSize: '120px' }} />
            <Typography
              sx={{
                fontWeight: '600',
                mb: '12px'
              }}
            >
              Transaction failed, please try again.
            </Typography>
          </Box>
        )
      default:
        return (
          <>
            {tokens.map((item, i) => {
              return (
                <React.Fragment key={i}>
                  <Grid2
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      mb: '6px',
                    }}
                  >
                    <Grid2 xs="auto">
                      <Avatar
                        variant="rounded"
                        alt="nft-image"
                        src={item.imgUrl}
                        sx={{ width: 64, height: 64 }}
                      />
                    </Grid2>
                    <Grid2 xs sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontWeight: '700' }}>
                        {item.name}
                      </Typography>
                      <Typography color="text.secondary">
                        Platform Fee 2% | Royalty {apiSimulatedTokenInfo.royalty * 0.1}%
                      </Typography>
                      <Typography color="text.secondary">
                        Net proceeds: {(saleData[i]?.price - (saleData[i]?.price * 0.02 + saleData[i]?.price * apiSimulatedTokenInfo.royalty * 0.001)).toFixed(2) + ' ' + saleData[i]?.currency}
                      </Typography>
                    </Grid2>
                  </Grid2>
                  <Grid2
                    container
                    direction="row"
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      pb: 1,
                      mb: 1
                    }}
                    spacing={1}
                  >
                    <Grid2 xs={12}>
                    <TextField
                      fullWidth
                      variant="filled"
                      id="sale-name"
                      label="Sale Name"
                      name="saleName"
                      value={saleData[i]?.saleName ? saleData[i].saleName : ''}
                      onChange={(e) => handleChange(e, i)}
                    />
                  </Grid2>
                  <Grid2 xs={12}>
                    <TextField
                      fullWidth
                      variant="filled"
                      id="sale-description"
                      label="Sale Description"
                      name="saleDescription"
                      multiline
                      minRows={3}
                      value={saleData[i]?.saleDescription ? saleData[i].saleDescription : ''}
                      onChange={(e) => handleChange(e, i)}
                    />
                  </Grid2>
                    <Grid2 xs={7}>
                      <TextField
                        fullWidth
                        variant="filled"
                        id="price-per-token"
                        label="Price per token"
                        type="number"
                        name="price"
                        value={saleData[i]?.price ? saleData[i].price : 0}
                        onChange={(e) => handleChangeNum(e, i)}
                      />
                    </Grid2>
                    <Grid2 xs={5}>
                      <FormControl variant="filled" fullWidth>
                        <InputLabel id="currency">Currency</InputLabel>
                        <Select
                          id="currency"
                          value={saleData[i]?.currency ? saleData[i].currency : 'SigUSD'}
                          label="Currency"
                          name="currency"
                          onChange={(e) => handleSelectChange(e, i)}
                        >
                          <MenuItem value={'SigUSD'}>SigUSD</MenuItem>
                          <MenuItem value={'Erg'}>Erg</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid2>
                  </Grid2>
                </React.Fragment>
              )
            })}
          </>
        )
    }
  }

  const theme = useTheme()
  const extraSmall = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullScreen={extraSmall}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          {switchTitle(submitting)}
        </BootstrapDialogTitle>
        <DialogContent dividers>
          {switchContent(submitting)}
        </DialogContent>
        <DialogActions sx={{
          display: !submitting ? 'block' : 'none'
        }}>
          <Button autoFocus fullWidth onClick={submit} variant="contained">
            Confirm Sale
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  );
}

export default SellTokens;