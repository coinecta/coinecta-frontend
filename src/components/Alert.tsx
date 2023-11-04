import React, { FC } from 'react';
import { useAlert } from '@contexts/AlertContext';
import { Snackbar, Alert } from '@mui/material';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const AlertComponent: FC = () => {
  const { alerts, removeAlert } = useAlert();

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string, id?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    if (id) removeAlert(id);
  };

  return (
    <TransitionGroup>
      {alerts.map((alert, index) => (
        <CSSTransition key={alert.id} timeout={500} classNames="alert">
          <Snackbar
            open={true}
            onClose={(event, reason) => handleClose(event, reason, alert.id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            style={{ bottom: 50 + index * 70 }}
          >
            <Alert
              variant="filled"
              onClose={() => handleClose(undefined, undefined, alert.id)}
              severity={alert.type}
              sx={{ width: '100%' }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

export default AlertComponent;
