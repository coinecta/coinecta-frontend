import type { NextPage } from 'next'
import {
  Container,
  useTheme,
  useMediaQuery,
  Typography,
  Box
} from '@mui/material'
import ErgoVerify from '@components/user/ergo/ErgoVerify'

const ConnectedWallets: NextPage = () => {
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: '600', mb: 4 }}>
        Connected Wallets
      </Typography>
      {/* <Typography variant="body1" sx={{ mb: 4 }}>
        
      </Typography> */}
      <Typography variant="h6">
        Change Ada login wallet
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography>
          Coming soon.
        </Typography>
      </Box>
      <Typography variant="h6">
        Connect Ergo wallets
      </Typography>
      <Typography sx={{ mb: 4 }}>
        Manage your connected Ergo wallets. If you have Ergopad staked, you&apos;ll need to make sure the wallets are connected before the snapshot for a given IDO.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <Box sx={{ position: 'relative', display: 'block', maxWidth: '100%' }}>
          <ErgoVerify />
        </Box>
      </Box>
    </Container>
  )
}

export default ConnectedWallets
