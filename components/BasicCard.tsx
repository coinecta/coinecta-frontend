import React, { FC, useMemo } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CardActionArea,
  Button,
  Box,
  Typography,
  useTheme
} from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import Image from 'next/image';
import Link from '@components/Link';
import { ThemeContext } from '@emotion/react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useRouter } from 'next/router'

interface IBasicCardProps {
  imgUrl?: string;
  link?: string;
  name?: string;
}

const BasicCard: FC<IBasicCardProps> = ({ imgUrl, link, name }) => {
  const router = useRouter();

  const randomInteger = (min: number, max: number) => {
    return (min + Math.random() * (max - min)).toFixed();
  };
  const rand = useMemo(() => randomInteger(1, 18), [1, 18]);

  const theme = useTheme()
  return (
    <Card
      elevation={0}
      sx={{
        // minWidth: '276px',
        mb: '6px',
      }}
    >
      <CardActionArea
        href={link ? link : ''}
      >
        <CardContent
          sx={{
            // position: 'absolute',
            // bottom: '0',
            p: '9px 9px 6px 16px',
            // borderRadius: '0px 12px 12px 0px',
            // background: theme.palette.background.paper,
            //mb: '6px'
          }}
        >
          <Typography
            sx={{
              fontWeight: '700',
              fontSize: '1.1rem',
              // mb: '6px',
            }}
          >
            {name}
          </Typography>
        </CardContent>
        <Box sx={{ position: 'relative', display: 'block', height: '220px' }}>
          <Image src={imgUrl ? imgUrl : `/images/placeholder/${rand}.jpg`} layout="fill" draggable="false" objectFit="cover" alt="image" />
        </Box>
      </CardActionArea>
      <CardActions>
        <Button fullWidth>
          Open Pack
        </Button>
      </CardActions>
    </Card>
  );
};

export default BasicCard;