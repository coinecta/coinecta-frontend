import type { NextPage } from 'next'
import {
  Container,
  useTheme,
  useMediaQuery,
  Typography
} from '@mui/material'

const Staking: NextPage = () => {
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <Container maxWidth="md" sx={{ py: 12 }}>
      <Typography variant="h2" component="h1" sx={{ fontWeight: '600' }}>
        Staking
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        CNCT Staking coming soon. Please check back after March 8th.
      </Typography>
    </Container>
  )
}

export default Staking