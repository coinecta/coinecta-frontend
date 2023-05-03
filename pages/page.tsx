import type { NextPage } from 'next'
import { 
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material'
import ButtonLink from '@components/ButtonLink'

const Page: NextPage = () => {
  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  return (
    <Container>
      <ButtonLink
        href="/"
      >
        Home
      </ButtonLink>
    </Container>
  )
}

export default Page
