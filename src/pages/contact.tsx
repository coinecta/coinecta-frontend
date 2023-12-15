import type { NextPage } from 'next'
import {
  Container,
  useTheme,
  useMediaQuery,
  Typography,
  Link,
  Box,
  Alert
} from '@mui/material'
import ButtonLink from '@components/ButtonLink'

const Contact: NextPage = () => {
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: '600' }}>
        Contact Us
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        If you run into issues while using the Coinceta website, please open a support ticket on Discord. We will work to resolve the issue as quickly as possible for you.
      </Typography>
      <Alert severity="warning" variant="outlined" sx={{ fontWeight: 700 }}>
        Never share your private keys with anyone! We will never DM you first!
      </Alert>
      <Typography variant="h6">
        Step 1: Join discord
      </Typography>
      <Typography sx={{ mb: 3 }}>
        First join the Discord channel by clicking <Link href="https://discord.gg/EuFdWye8yw" target="_blank">this link</Link>.
      </Typography>
      <Typography variant="h6">
        Step 2: Create a support ticket
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Enter the #create-a-ticket channel, then create a new ticket.
      </Typography>
      <Box sx={{
        width: '100%',
        maxWidth: 600,
        overflow: 'hidden',
        borderRadius: '16px',
        mb: 3,
        img: {
          width: '100%',
          height: 'auto',
          borderRadius: '16px',
        }
      }}>
        <img src="/discord.jpg" alt="Discord" />
      </Box>
      <Typography variant="h6">
        Step 3: Discuss with support staff
      </Typography>
      <Typography sx={{ mb: 4 }}>
        Describe the issue and someone will help you out as soon as possible. Only admins will be able to see the ticket, and they might ask for information such as your public ADA address.
      </Typography>
      <Alert severity="warning" variant="outlined" sx={{ fontWeight: 700 }}>
        Never share your private keys with anyone! We will never DM you first!
      </Alert>
    </Container>
  )
}

export default Contact
