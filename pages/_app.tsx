import React, { useState, useEffect } from "react";
import "@styles/globals.css";
import type { AppProps } from "next/app";
import { DarkTheme, LightTheme } from "@theme/theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "@components/layout/Layout";
import Head from "next/head";
import { ThemeContext } from "@contexts/ThemeContext";
import { WalletContext } from "@contexts/WalletContext";
import { UserContext } from "@contexts/UserContext";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import AlertWrapper, { IAlertMessages } from "@components/AlertWrapper";
import { ApiContext } from "@contexts/ApiContext";
import AppApi from "@utils/api";

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState(LightTheme);
  const [walletAddress, setWalletAddress] = useState("");
  const [dAppWallet, setDAppWallet] = useState({
    connected: false,
    name: "",
    addresses: [""],
  });
  const [expanded, setExpanded] = useState<string | false>(false);
  const [addWalletModalOpen, setAddWalletModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ address: "" });
  const [alert, setAlert] = useState<IAlertMessages[]>([]);

  useEffect(() => {
    setTheme(
      localStorage.getItem("darkToggle") === "dark" ? DarkTheme : LightTheme
    );
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes"
        />
      </Head>
      <LocalizationProvider
        // @ts-ignore
        dateAdapter={AdapterDayjs}
      >
        <ThemeProvider theme={theme}>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            <WalletContext.Provider
              value={{
                walletAddress,
                setWalletAddress,
                dAppWallet,
                setDAppWallet,
                addWalletModalOpen,
                setAddWalletModalOpen,
                expanded,
                setExpanded,
              }}
            >
              <UserContext.Provider value={{ userInfo, setUserInfo }}>
                <ApiContext.Provider value={{ api: new AppApi(setAlert) }}>
                  <CssBaseline enableColorScheme />
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  <AlertWrapper
                    alerts={alert}
                    close={(i: number) => {
                      setAlert((prevState) =>
                        prevState.filter((_item, idx) => idx !== i)
                      );
                    }}
                  />
                </ApiContext.Provider>
              </UserContext.Provider>
            </WalletContext.Provider>
          </ThemeContext.Provider>
        </ThemeProvider>
      </LocalizationProvider>
    </>
  );
}

export default MyApp;
