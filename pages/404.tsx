import type { NextPage } from 'next'
import { Button, Container, Typography } from '@mui/material'
import Link from '@components/Link'

const Home: NextPage = () => {
  return (
    <Container sx={{ textAlign: 'center', py: '20vh' }}>
      <Typography variant="h1">
        404
      </Typography>
      <Typography variant="body1" sx={{ mb: '24px' }}>
        This Page Could Not Be Found
      </Typography>
      <Typography variant="body1">
        The page you are looking for does not exist, has been removed, name changed, or is temporarily unavailable.
      </Typography>
      <Link href="/">
        Go Back Home
      </Link>
    </Container>
  )
}

export default Home
