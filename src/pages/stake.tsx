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
    <Container sx={{ textAlign: 'center', py: '20vh' }}>
      <Typography variant="h2">
        Staking panel coming soon
      </Typography>
      <Typography variant="body1" gutterBottom>
        We are getting this ready and will release it shortly. 
      </Typography>
      <Link href="/">
        Go Back Home
      </Link>
    </Container>
  )
}

export default Stake