import type { NextPage } from 'next'
import {
  Container,
  Typography,
  Box
} from '@mui/material'
import ErgoVerify from '@components/user/ergo/ErgoVerify'
import AddWallet from '@components/user/AddWallet'

const ConnectedWallets: NextPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: '600', mb: 4 }}>
        Connected Wallets
      </Typography>
      <Typography variant="h6">
        Add ADA wallets
      </Typography>
      <Typography sx={{ mb: 4 }}>
        Add ADA wallets to display their info on your dashboard. You still need to sign in with your main wallet. If you sign in with one of the other wallet, it will create a separate account.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', mb: 3 }}>
        <Box sx={{ position: 'relative', display: 'block', maxWidth: '100%' }}>
          <AddWallet />
        </Box>
      </Box>
      <Typography variant="h6">
        Connect Ergo wallets
      </Typography>
      <Typography sx={{ mb: 4 }}>
        Add Ergo wallets for cross-chain IDOs that track Ergopad staking. If you have Ergopad staked, you&apos;ll need to make sure the wallets are connected before the snapshot for a given IDO.
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
