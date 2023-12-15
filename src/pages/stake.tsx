import type { NextPage } from 'next'
import {
  Container,
  useTheme,
  useMediaQuery,
  Typography
} from '@mui/material'
import Link from '@components/Link'

const Stake: NextPage = () => {
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: '600' }}>
        Staking
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Stake your CNCT tokens here
      </Typography>

    </Container>
  )
}

export default Stake