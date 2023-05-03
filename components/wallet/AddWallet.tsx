import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Dialog,
  TextField,
  Collapse,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Avatar,
  Box,
  Chip,
  Typography,
  Fade,
  useMediaQuery,
  IconButton,
  Icon,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/CheckCircle";
import { WalletContext } from "@contexts/WalletContext";
import { Address } from "@nautilus-wallet/ergo-ts";
import DappWallet from "@components/wallet/DappWallet";
import { ExpandMore } from "@mui/icons-material";

const WALLET_ADDRESS = "wallet_address_7621";
const WALLET_ADDRESS_LIST = "wallet_address_list_1283";
const DAPP_CONNECTED = "dapp_connected_6329";
const DAPP_NAME = "dapp_name_8930";

/**
 * Note on es-lint disable lines:
 *
 * Ergo dApp injector uses global variables injected from the browser,
 * es-lint will complain if we reference un defined varaibles.
 *
 * Injected variables:
 * - ergo
 * - window.ergo_check_read_access
 * - window.ergo_request_read_access
 * - window.ergoConnector
 */
export const AddWallet = () => {
  const router = useRouter();
  const theme = useTheme();
  const [walletInput, setWalletInput] = useState("");
  const {
    walletAddress,
    setWalletAddress,
    dAppWallet,
    setDAppWallet,
    addWalletModalOpen,
    setAddWalletModalOpen,
    expanded,
    setExpanded,
  } = useContext(WalletContext);
  const [init, setInit] = useState(false);
  const [mobileAdd, setMobileAdd] = useState(false);
  /**
   * dapp state
   *
   * DEPRACATED ----> loading: yoroi is slow so need to show a loader for yoroi
   * dAppConnected: true if permission granted (persisted in local storage)
   * dAppError: show error message
   * dAppAddressTableData: list available addresses from wallet
   */
  const [loading, setLoading] = useState(false);
  const [dAppError, setDAppError] = useState(false);
  // const [dAppAddressTableData, setdAppAddressTableData] = useState([{}]); // table data

  useEffect(() => {
    const isModalOpen = localStorage.getItem("modalOpen");
    if (isModalOpen === "true") {
      setAddWalletModalOpen(true);
    }
    localStorage.setItem("modalOpen", "false");
  }, []);

  const handleWalletChange = (wallet: string | false) => {
    setExpanded(typeof wallet === "string" ? wallet : false);
    if (wallet === "nautilus") dAppConnect("nautilus");
    if (wallet === "safew") dAppConnect("safew");
    if (wallet === "mobile") setMobileAdd(!mobileAdd);
  };

  useEffect(() => {
    // load primary address
    const address = localStorage.getItem(WALLET_ADDRESS);
    // load dApp state
    const dappConnected = localStorage.getItem(DAPP_CONNECTED);
    const dappName = localStorage.getItem(DAPP_NAME);
    const walletAddressList = localStorage.getItem(WALLET_ADDRESS_LIST);
    if (
      address !== null &&
      address !== "" &&
      (dappName === null || dappName === "")
    ) {
      setWalletAddress(address);
      setWalletInput(address);
      handleWalletChange("mobile");
    }
    if (
      dappConnected !== null &&
      dappName !== null &&
      walletAddressList !== null &&
      dappConnected !== "" &&
      dappName !== "" &&
      walletAddressList !== ""
    ) {
      setDAppWallet({
        connected: dappConnected === "true" ? true : false,
        name: dappName,
        addresses: JSON.parse(walletAddressList),
      });
      handleWalletChange(dappName.toLowerCase());
    }
    // refresh connection
    try {
      if (localStorage.getItem(DAPP_CONNECTED) === "true") {
        window.ergoConnector[String(localStorage.getItem(DAPP_NAME))]
          .isConnected()
          .then((res: any) => {
            if (!res)
              window.ergoConnector[String(localStorage.getItem(DAPP_NAME))]
                .connect({ createErgoObject: false })
                .then((res: any) => {
                  if (!res) clearWallet();
                });
          });
      }
    } catch (e) {
      console.log(e);
    }
    setInit(true);
  }, []); // eslint-disable-line

  /**
   * update persist storage
   */
  useEffect(() => {
    if (init) {
      localStorage.setItem(DAPP_CONNECTED, dAppWallet.connected.toString());
      localStorage.setItem(DAPP_NAME, dAppWallet.name);
      localStorage.setItem(
        WALLET_ADDRESS_LIST,
        JSON.stringify(dAppWallet.addresses)
      );
    }
  }, [dAppWallet, init]);

  useEffect(() => {
    if (init) localStorage.setItem(WALLET_ADDRESS, walletAddress);
  }, [walletAddress, init]);

  const handleClose = () => {
    // reset unsaved changes
    setAddWalletModalOpen(false);
    setWalletInput(walletAddress);
    setDAppError(false);
  };

  const handleSubmitWallet = () => {
    // add read only wallet
    setAddWalletModalOpen(false);
    setWalletAddress(walletInput);
    // clear dApp state
    setDAppError(false);
    setDAppWallet({
      connected: false,
      name: "",
      addresses: [],
    });
  };

  const clearWallet = async () => {
    if (expanded === "safew" || expanded === "nautilus") {
      // @ts-ignore
      await ergoConnector[expanded].disconnect();
      // router.reload();
      // localStorage.setItem('modalOpen', 'true');
    }
    // clear state and local storage
    setWalletInput("");
    setWalletAddress("");
    // clear dApp state
    setDAppError(false);
    setDAppWallet({
      connected: false,
      name: "",
      addresses: [],
    });
    setExpanded(false);
  };

  const handleWalletFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletInput(e.target.value);
  };

  /**
   * dapp connector
   */
  const dAppConnect = async (wallet: string) => {
    const walletMapper: { [index: string]: any } = {
      nautilus: window.ergoConnector?.nautilus,
      safew: window.ergoConnector?.safew,
    };
    setLoading(true);
    try {
      if (await walletMapper[wallet].isConnected()) {
        await dAppLoad(wallet);
        setLoading(false);
        return;
      } else if (
        await walletMapper[wallet].connect({ createErgoObject: false })
      ) {
        await dAppLoad(wallet);
        setLoading(false);
        return;
      }
      setDAppError(true);
    } catch (e) {
      setDAppError(true);
      console.log(e);
    }
    setLoading(false);
  };

  const dAppLoad = async (wallet: string) => {
    try {
      const walletConnector = window.ergoConnector[wallet];
      const context = await walletConnector.getContext();
      // @ts-ignore
      const address_used = await context.get_used_addresses(); // eslint-disable-line
      // @ts-ignore
      const address_unused = await context.get_unused_addresses(); // eslint-disable-line
      const addresses = [...address_used, ...address_unused];
      // use the first used address if available or the first unused one if not as default
      const address = addresses.length ? addresses[0] : "";
      setWalletAddress(address);
      setWalletInput(address);
      // update dApp state
      setDAppWallet({
        connected: true,
        name: wallet,
        addresses: addresses,
      });
      setDAppError(false);
    } catch (e) {
      console.log(e);
      // update dApp state
      setDAppWallet({
        connected: false,
        name: "",
        addresses: [],
      });
      setDAppError(true);
    }
  };

  const changeWalletAddress = (address: string) => {
    setWalletAddress(address);
    setWalletInput(address);
  };

  // const loadAddresses = async () => {
  //   setLoading(true);
  //   try {
  //     // @ts-ignore
  //     const address_used = await ergo.get_used_addresses();
  //     // @ts-ignore
  //     const address_unused = await ergo.get_unused_addresses();
  //     const addresses = [...address_used, ...address_unused];
  //     const addressData = addresses.map((address, index) => {
  //       return { id: index, name: address };
  //     });
  //     setDAppWallet({
  //       ...dAppWallet,
  //       addresses: addresses,
  //     });
  //     setdAppAddressTableData(addressData);
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   setLoading(false);
  // };

  const wallets = [
    {
      name: "Nautilus",
      icon: "/images/wallets/nautilus-128.png",
      description: "Connect automatically signing with your wallet",
    },
    {
      name: "SAFEW",
      icon: "/images/wallets/safew_icon_128.png",
      description: "Connect automatically signing with your wallet",
    },
    {
      name: "Mobile",
      icon: "/images/wallets/mobile.webp",
      description: "Enter your wallet address manually",
    },
  ];

  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Dialog
        open={addWalletModalOpen}
        onClose={handleClose}
        fullScreen={fullScreen}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: "32px",
          }}
        >
          {walletAddress != "" ? "Wallet Connected" : "Connect Wallet"}
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          {/* <DialogContentText sx={{ textAlign: 'center', mb: '24px' }}>
            Your wallet info will never be stored on our server.
          </DialogContentText> */}
          {wallets.map((props, i) => {
            return (
              <Collapse
                in={expanded === props.name.toLowerCase() || expanded === false}
                mountOnEnter
                unmountOnExit
                key={i}
              >
                <Button
                  fullWidth
                  disabled={walletAddress != ""}
                  sx={{
                    borderRadius: "6px",
                    p: "0.5rem",
                    justifyContent: "space-between",
                    mb: "12px",
                    display: "flex",
                    minWidth: fullScreen ? "90vw" : "500px",
                  }}
                  onClick={
                    expanded === false
                      ? () => handleWalletChange(props.name.toLowerCase())
                      : () => handleWalletChange(false)
                  }
                >
                  <Box
                    sx={{
                      fontSize: "1.2rem",
                      color: "text.primary",
                      fontWeight: "400",
                      textAlign: "left",
                      display: "flex",
                    }}
                  >
                    <Avatar
                      src={props.icon}
                      variant={props.name === "SAFEW" ? "square" : "circular"}
                      sx={{
                        height: "3rem",
                        width: "3rem",
                        mr: "1rem",
                      }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "1.1rem",
                          color: "text.secondary",
                          fontWeight: "400",
                        }}
                      >
                        {props.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: ".9rem",
                          color: "text.secondary",
                          fontWeight: "400",
                        }}
                      >
                        {props.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      transform:
                        expanded === props.name.toLowerCase()
                          ? "rotate(0deg)"
                          : "rotate(-90deg)",
                      transition: "transform 100ms ease-in-out",
                      textAlign: "right",
                      lineHeight: "0",
                      mr: "-0.5rem",
                    }}
                  >
                    <ExpandMoreIcon />
                  </Box>
                </Button>
              </Collapse>
            );
          })}

          <Collapse in={expanded === "mobile"} mountOnEnter unmountOnExit>
            <TextField
              disabled={walletAddress != ""}
              autoFocus
              margin="dense"
              id="name"
              label="Wallet address"
              type="wallet"
              fullWidth
              variant="outlined"
              value={walletInput}
              onChange={handleWalletFormChange}
              error={!isAddressValid(walletInput)}
              sx={{
                "& .MuiOutlinedInput-input:-webkit-autofill": {
                  boxShadow: "0 0 0 100px rgba(35, 35, 39, 1) inset",
                },
              }}
            />
            <FormHelperText error={true}>
              {!isAddressValid(walletInput) ? "Invalid ergo address." : ""}
            </FormHelperText>
          </Collapse>

          <Collapse
            in={expanded !== "mobile" && expanded !== false}
            mountOnEnter
            unmountOnExit
          >
            <DappWallet
              connect={dAppConnect}
              setLoading={setLoading}
              setDAppWallet={setDAppWallet}
              dAppWallet={dAppWallet}
              loading={loading}
              clear={clearWallet}
              wallet={walletAddress}
              changeWallet={changeWalletAddress}
            />
          </Collapse>

          {loading && (
            <CircularProgress sx={{ ml: 2, color: "white" }} size={"1.2rem"} />
          )}

          <FormHelperText error={true}>
            {dAppError
              ? "Failed to connect to wallet. Please retry after refreshing page."
              : ""}
          </FormHelperText>

          {/* 
          
          {dAppWallet.connected && (
            <Accordion sx={{ mt: 1 }}>
              <AccordionSummary onClick={loadAddresses}>
                <strong>Change Address</strong>
              </AccordionSummary>
              <AccordionDetails>
                <PaginatedTable
                  rows={dAppAddressTableData}
                  onClick={(index) =>
                    changeWalletAddress(dAppAddressTableData[index].name)
                  }
                />
              </AccordionDetails>
            </Accordion>
          )} 
          
          */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close Window</Button>
          <Button
            onClick={
              walletAddress == "" ? handleSubmitWallet : () => clearWallet()
            }
            disabled={!isAddressValid(walletInput)}
          >
            {walletAddress == "" ? "Connect" : "Remove Wallet"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export function isAddressValid(address: string) {
  try {
    return new Address(address).isValid();
  } catch (_) {
    return false;
  }
}

export const getErgoWalletContext = async () => {
  const walletConnector =
    window.ergoConnector[localStorage.getItem(DAPP_NAME) ?? DAPP_NAME];
  const context = await walletConnector.getContext();
  return context;
};

export default AddWallet;
