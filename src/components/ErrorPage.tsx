import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import React, { FC } from 'react';
import ButtonLink from './ButtonLink';

interface IErrorPageProps {
  title?: string;
  subtitle?: string;
  message?: string;
  link?: string;
  linkMessage?: string;
  buttonFunction?: Function;
  buttonMessage?: string;
}

const ErrorPage: FC<IErrorPageProps> = ({ title, subtitle, message, link, linkMessage, buttonFunction, buttonMessage }) => {
  return (
    <Container sx={{ textAlign: 'center', py: '20vh' }}>
      <Typography variant="h1">
        {title ?? '404'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {subtitle ?? 'This Page Could Not Be Found'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {message ?? 'The page you are looking for does not exist, has been removed, name changed, or is temporarily unavailable.'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 2 }}>
        {buttonFunction &&
          <Button variant="contained" onClick={() => buttonFunction()}>
            {buttonMessage}
          </Button>
        }
        <ButtonLink variant="outlined" href={link ?? "/"}>
          {linkMessage ?? 'Go Back Home'}
        </ButtonLink>
      </Box>

    </Container>
  );
};

export default ErrorPage;