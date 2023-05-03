import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  useTheme,
  Skeleton,
  Box
} from '@mui/material'
import useResizeObserver from "use-resize-observer";
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2

const LoadingCard: FC = () => {
  const theme = useTheme()
  const { ref, width = 1 } = useResizeObserver<HTMLDivElement>();
  const [newWidth, setNewWidth] = useState(300)

  useEffect(() => {
    setNewWidth(width)
  }, [width])

  return (
    <>
      <Card
        sx={{
          mb: '6px',
          height: '100%',
        }}
        ref={ref}
      >
        <CardActionArea sx={{ minHeight: '260px' }}>
          <Skeleton variant="rectangular" width={newWidth} height={newWidth} sx={{
            minWidth: '100%',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderBottomColor: theme.palette.divider,
          }} />
          <CardContent sx={{ position: 'relative' }}>
            <Skeleton variant="text" sx={{ fontSize: '1.27rem' }} />
          </CardContent>
        </CardActionArea>
        <CardActions
          sx={{
            p: '16px',
            pt: 0
          }}
        >
          <Grid2
            container
            direction="column"
            justifyContent="space-between"
            alignItems="left"
            sx={{
              width: '100%',
            }}
          >
            <Grid2>
              <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
            </Grid2>
            <Grid2>
              <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
            </Grid2>
            <Grid2>
              <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
            </Grid2>
          </Grid2>
        </CardActions>
      </Card>
    </>
  );
};
export default LoadingCard;