import React, { FC } from 'react';
import {
  useTheme,
  Typography,
  Box,
  Grid,
  Badge,
  MenuItem,
  ListItemIcon,
  Avatar,
} from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CheckIcon from '@mui/icons-material/Check'
import { IImportMenuItem } from '@pages/notifications';

interface IProps extends IImportMenuItem {
  menuItems: IImportMenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<IImportMenuItem[]>>;
}

const CustomMenuItem: FC<IProps> = ({ menuItems, setMenuItems, time, unread, message, id, userVerfied, userName, userPfp }) => {
  const theme = useTheme()

  const setRead = (id: string) => {
    setMenuItems((prevArray) => {
      const newArray = prevArray.map((item, index) => {
        if (item.id === id) {
          return {
            ...item,
            unread: !prevArray[index].unread
          }
        }
        return item
      })
      return newArray
    })
  }

  return (
    <MenuItem
      onClick={() => setRead(id)}
      sx={{
        background: 'none',
        my: '12px',
        borderRadius: '12px',
        '&:hover': {
          background: theme.palette.background.paper,
        }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Badge
          overlap="circular"
          color="primary"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              p: '0',
              border: '2px solid #fff',
              display: userVerfied ? 'flex' : 'none'
            },
          }}
          badgeContent={<CheckIcon color="inherit" sx={{ fontSize: '12px' }} />}
        >
          <Avatar src={userPfp} alt={userName} sx={{ fontSize: '14px', color: theme.palette.text.primary }}>
            {(userPfp === '' || userPfp === undefined) &&
              userName.split(' ').map((word) => word[0]).join('').toUpperCase()
            }
          </Avatar>
        </Badge>
      </Box>
      <Grid container direction="column" sx={{ whiteSpace: 'normal', ml: 1 }}>
        <Grid item>
          <Typography variant="subtitle1">
            {message}
          </Typography>

        </Grid>
        <Grid item>
          <Typography variant="subtitle1" sx={{ fontSize: '0.8rem' }}>
            {'1 hour' + ' ago'}
          </Typography>
        </Grid>
      </Grid>
      <ListItemIcon>
        <FiberManualRecordIcon
          sx={{
            fontSize: '12px',
            ml: '6px',
            color: unread ? theme.palette.primary.main : theme.palette.background.default
          }}
        />
      </ListItemIcon>
    </MenuItem>
  )
}

export default CustomMenuItem;