import { useState, useEffect } from "react";
import { NextPage } from "next";
import {
  Grid,
  useTheme,
  Paper,
  useMediaQuery,
  Typography,
  Box,
  Container,
  MenuItem,
  MenuList,
  Chip
} from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import CustomMenuItem from "@components/notifications/CustomMenuItem";

export interface IImportMenuItem {
  message: string;
  id: string;
  userName: string;
  userPfp: string;
  userVerfied: boolean;
  time: Date;
  unread: boolean;
}

const NotificationsPage: NextPage = () => {
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));
  const [currentMenuItems, setCurrentMenuItems] = useState<IImportMenuItem[]>(sampleMenuItems)
  const filters = ["All", "Unread"];
  const [selectedFilters, setSelectedFilters] = useState(["All"]);

  const handleFilter = (filter: string) => {
    if (filter === "All") {
      setSelectedFilters(["All"]);
    } else if (selectedFilters.includes("All")) {
      setSelectedFilters([filter]);
    } else if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter]);
    } else if (selectedFilters.length > 1) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters(["All"])
    }
  };

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [])

  return (
    <Container>
      
      {!loading &&
        (
          <Grid
            container
            spacing={4}
            alignItems="center"
            sx={{ mb: 4 }}
            direction={{ xs: "column-reverse", md: "row" }}
          >
            <Grid item xs={12} md={6}>
              <Box sx={{
                mx: "auto",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                minHeight: !upMd ? 'calc(100vh - 160px)' : '100%'
              }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      borderLeft: `8px solid ${theme.palette.secondary.main}`,
                      pl: "20px",
                      mb: 4,
                    }}
                  >
                    <Typography variant="h2">Notifications</Typography>
                  </Box>
                  <Box sx={{ mb: 4 }}>
                    {filters.map((filter, index) => (
                      <Chip
                        label={filter}
                        onClick={() => handleFilter(filter)}
                        key={"proposal-filter-chip-key-" + index}
                        variant="filled"
                        color={
                          selectedFilters.includes(filter) ? "primary" : "default"
                        }
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </Box>
                  <Box
                    sx={{
                      display: 'block'
                    }}
                  >
                    <MenuList sx={{ py: 0 }}>
                      {currentMenuItems.length > 0
                        ? currentMenuItems.map((item, i) => {
                          return (
                            <CustomMenuItem
                              key={item.id}
                              menuItems={currentMenuItems}
                              setMenuItems={setCurrentMenuItems}
                              {...item}
                            />
                          )
                        })
                        : <MenuItem>

                        </MenuItem>
                      }
                    </MenuList>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: upMd ? 'flex' : 'none' }}>
              <Paper sx={{ maxHeight: '100vh', overflow: 'hidden', lineHeight: 0 }}>
                <img
                  src="/full-banners/megaphone.png"
                  style={{
                    width: "100%",
                    height: "auto"
                  }}
                  alt="image"
                />
              </Paper>
            </Grid>
          </Grid>
        )}
    </Container>
  );
};

export default NotificationsPage;

////////////////////////////////
// START SAMPLE DATA ///////////
////////////////////////////////

const sampleMenuItems: IImportMenuItem[] = [
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: uuidv4(),
    userVerfied: false,
    time: new Date(),
    unread: true
  },
  {
    message: 'Jake just updated the status on your transaction. Check it out!',
    userName: 'Jake Jones',
    userPfp: '/thoreau.png',
    id: uuidv4(),
    userVerfied: true,
    time: new Date(),
    unread: true
  },
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: uuidv4(),
    userVerfied: false,
    time: new Date(),
    unread: false
  },
  {
    message: 'Jake just updated the status on your transaction. Check it out!',
    userName: 'Jake Jones',
    userPfp: '/thoreau.png',
    id: uuidv4(),
    userVerfied: true,
    time: new Date(),
    unread: true
  },
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: uuidv4(),
    userVerfied: false,
    time: new Date(),
    unread: false
  },
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: uuidv4(),
    userVerfied: false,
    time: new Date(),
    unread: false
  },
  {
    message: 'Jake just updated the status on your transaction. Check it out!',
    userName: 'Jake Jones',
    userPfp: '/thoreau.png',
    id: uuidv4(),
    userVerfied: true,
    time: new Date(),
    unread: true
  },
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: uuidv4(),
    userVerfied: false,
    time: new Date(),
    unread: false
  },
  {
    message: 'Ornella just updated the status on your transaction. Check it out!',
    userName: 'Ornella May',
    userPfp: '',
    id: uuidv4(),
    userVerfied: false,
    time: new Date(),
    unread: false
  }
]