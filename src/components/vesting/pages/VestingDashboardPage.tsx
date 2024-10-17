import React, { useEffect, useState } from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";
import VestingPositionTable from "../VestingPositionTable";
import { useWallet } from "@meshsdk/react";
import { useWalletContext } from "@contexts/WalletContext";

const VestingDashboardPage = () => {
  const { wallet, connected, name } = useWallet();
  useWalletContext();
  const [connectedAddress, setConnectedAddress] = useState<string | undefined>(
    undefined,
  );
  const [, setWalletName] = useState<string | undefined>(undefined);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[name.toLowerCase()].enable();

        const changeAddress = await wallet.getChangeAddress();
        setConnectedAddress(changeAddress);
        setWalletName(name.toLowerCase());
      }
    };
    execute();
  }, [connected, connectedAddress, name, wallet]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 5 }}>
        <Typography align="center" variant="h3" sx={{ fontWeight: "bold" }}>
          Vesting Dashboard
        </Typography>
      </Box>

      <Box sx={{ mb: 7 }}>
        <VestingPositionTable
          connectedAddress={connectedAddress}
        />
      </Box>
    </Container>
  );
};

export default VestingDashboardPage;