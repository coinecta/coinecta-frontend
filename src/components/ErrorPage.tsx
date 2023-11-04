import { Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import React, { FC } from 'react';
import ButtonLink from './ButtonLink';

interface IErrorPageProps {
  title?: string;
  subtitle?: string;
  message?: string;
  link?: string;
  linkMessage?: string;
}

const ErrorPage: FC<IErrorPageProps> = ({ title, subtitle, message, link, linkMessage }) => {
  return (
    <Container sx={{ textAlign: 'center', py: '20vh' }}>
      <Typography variant="h1">
        {title ?? '404'}
      </Typography>
      <Typography variant="body1" sx={{ mb: '24px' }}>
        {subtitle ?? 'This Page Could Not Be Found'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {message ?? 'The page you are looking for does not exist, has been removed, name changed, or is temporarily unavailable.'}
      </Typography>
      <ButtonLink href={link ?? "/"}>
        {linkMessage ?? 'Go Back Home'}
      </ButtonLink>
    </Container>
  );
};

export default ErrorPage;