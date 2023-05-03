import { useState, FC } from "react";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  Link,
  useTheme
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { isAddressValid } from "@components/wallet/AddWallet";

const DappWallet: FC<{
  connect: Function;
  setLoading: Function;
  setDAppWallet: Function;
  dAppWallet: any;
  loading: boolean;
  clear: Function;
  wallet: string;
  changeWallet: Function;
}> = (props) => {
  const theme = useTheme()
  return (
    <>
      {props.dAppWallet.connected && isAddressValid(props.wallet) ? (
        <>
          <Typography sx={{ mb: "1rem", fontSize: ".9rem" }}>
            Select which address you want to use as as the default.
          </Typography>
          <TextField
            label="Default Wallet Address"
            fullWidth
            value={props.wallet}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {props.wallet !== "" && <CheckCircleIcon color="success" />}
                </InputAdornment>
              ),
            }}
          />

          <Box
            sx={{
              // width: "100%",
              border: "1px solid",
              borderColor: theme.palette.background.default,
              borderRadius: ".3rem",
              mt: "1rem",
              maxHeight: "12rem",
              overflowY: "auto",
            }}
          >
            {props.dAppWallet.name !== undefined && props.dAppWallet.addresses.map((address: string, i: number) => {
              return (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: 'space-between',
                    alignItems: "center",
                    // width: "100%",
                    fontSize: ".7rem",
                    pl: ".5rem",
                    mt: ".5rem",
                    pb: ".5rem",
                    borderBottom: i === props.dAppWallet.addresses.length - 1 ? 0 : "1px solid",
                    borderBottomColor: theme.palette.background.default,
                  }}
                  key={i}
                >
                  <Box sx={{
                    maxWidth: '60vw',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {address}
                  </Box>
                  <Box>
                    <Button
                      sx={{ ml: "auto", mr: ".5rem" }}
                      variant="contained"
                      color={props.wallet === address ? "success" : "primary"}
                      size="small"
                      onClick={() => props.changeWallet(address)}
                    >
                      {props.wallet === address ? "Active" : "Choose"}
                    </Button>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </>
      ) : (
        <Typography sx={{ fontSize: ".9rem", maxWidth: '450px' }}>
          Follow the instructions in {props.dAppWallet.name} to confirm and you will connect your wallet instantly. If a popup box is not appearing or if you accidentally closed it, please{" "}
          <Link
            sx={{
              cursor: "pointer",
              display: "inline",
              textDecoration: "underline",
              color: "primary.main",
            }}
            onClick={async () => {
              await props.connect(props.dAppWallet.name.toLowerCase());
            }}
          >
            click here
          </Link>{" "} to open it again.
        </Typography>
      )}
    </>
  );
};

export default DappWallet;
