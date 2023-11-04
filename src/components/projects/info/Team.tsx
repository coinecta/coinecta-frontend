import {
  Avatar,
  Grid,
  Typography,
  useTheme
} from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import Box from '@mui/material/Box';
import Link from '@components/Link';
import React from 'react';

const Team = ({ data }: { data: any[] }) => {
  const theme = useTheme()
  const teamMembers: any[] = data ? data : [];
  return (
    <>
      <Grid container spacing={3} direction="row" justifyContent="center">
        {teamMembers.map((item: any, i: number) => {
          return (
            <React.Fragment key={item.name} >
              <Grid item sx={{ width: '160px' }}>
                <Avatar
                  alt={item.name}
                  src={item.profileImgUrl}
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 1,
                    bgcolor: theme.palette.text.secondary,
                  }}
                />
                <Typography
                  color="text.secondary"
                  sx={{ fontWeight: '500', textAlign: 'center', mb: '0.1rem' }}
                >
                  {item.name}
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: '300',
                    textAlign: 'center',
                    mb: '0.1rem',
                  }}
                >
                  {item.description}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  {item.socials?.twitter &&
                    <Link
                      href={`https://twitter.com/${item.socials.twitter}`}
                    >
                      <TwitterIcon />
                    </Link>
                  }
                  {item.socials?.linkedin &&
                    <Link
                      href={`https://linkedin.com/${item.socials.linkedin}`}
                    >
                      <LinkedInIcon />
                    </Link>
                  }
                </Box>
              </Grid>
            </React.Fragment>
          )
        })}
      </Grid >
    </>
  );
};

export default Team;
