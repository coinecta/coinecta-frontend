import React, { FC } from 'react';
import {
  Typography,
  Grid as MuiGrid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
} from '@mui/material'
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';

interface IProjectCard {
  title: string;
  tagline: string;
  imageUrl: string;
  category: string;
  status: string;
  blockchains: string[];
  link: string;
}

const ProjectCard: FC<IProjectCard> = ({
  title,
  tagline,
  imageUrl,
  category,
  status,
  blockchains,
  link
}) => {
  const router = useRouter()
  return (
    <Card sx={{ maxWidth: '560px' }}>
      <CardMedia
        component="img"
        image={imageUrl || '/banner.jpg'}
        alt={`${title} Banner`}
        sx={{ height: '240px' }}
      />
      <CardContent sx={{ flex: '1 0 auto' }}>
        <Box sx={{ position: 'relative' }}>

          <Typography
            component="h5"
            variant="h5"
          >
            {title}
          </Typography>
          <Chip label={status} sx={{ position: 'absolute', top: '-32px', right: '6px', background: '#ccc', color: '#000' }} />
        </Box>

        <Typography variant="subtitle2" color="text.secondary" component="div" sx={{ mb: 2 }}>
          {tagline}
        </Typography>
        <MuiGrid container justifyContent="space-between" alignItems="center">
          <MuiGrid item>
            {blockchains.map((item, i) => {
              const key = uuidv4()
              return <Chip variant="outlined" label={item} key={key} sx={{ mr: 1 }} />
            })}
          </MuiGrid>
          <MuiGrid item>
            <Button onClick={() => router.push(link)} variant="contained" color="secondary" size="small">
              Learn More
            </Button>
          </MuiGrid>
        </MuiGrid>
      </CardContent>
    </Card>
  )
}

export default ProjectCard