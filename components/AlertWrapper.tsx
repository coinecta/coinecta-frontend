import { Alert, Box, IconButton, Collapse } from "@mui/material";
import React, { useEffect, FC } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionGroup } from "react-transition-group";

interface IAlert {
  alerts: IAlertMessages[];
  close: (i: number) => void;
}

export interface IAlertMessages {
  severity: ValidAlert;
  content: string;
  id: string;
}

export type ValidAlert = "error" | "warning" | "info" | "success";

const AlertWrapper: FC<IAlert> = (props) => {
  useEffect(() => {
    setTimeout(() => props.close(0), 15000);
  }, []);
  return (
    <Box
      sx={{
        position: "fixed",
        top: "4rem",
        right: "1rem",
        zIndex: 100000,
      }}
    >
      <TransitionGroup>
        {props.alerts.map((alert: IAlertMessages, i: number) => {
          return (
            <Collapse key={alert.id}>
              <CustomAlert alert={alert} i={i} close={props.close} />
            </Collapse>
          );
        })}
      </TransitionGroup>
    </Box>
  );
};

const CustomAlert: FC<{
  alert: IAlertMessages;
  i: number;
  close: Function;
}> = ({ alert, i, close }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      close(0);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <Alert
      severity={alert.severity}
      variant="filled"
      key={`alert-${i}`}
      sx={{ position: "relative", minWidth: "250px", mb: ".5rem" }}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={() => {
            close(i);
          }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
    >
      {alert.content}
    </Alert>
  );
};

export default AlertWrapper;
