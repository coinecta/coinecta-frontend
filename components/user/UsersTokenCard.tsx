import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Box,
  Typography,
  useTheme,
  Skeleton
} from '@mui/material'
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import Link from '@components/Link';
import { useRouter } from 'next/router'
import { styled } from '@mui/material/styles';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import useResizeObserver from "use-resize-observer";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import HideImageIcon from '@mui/icons-material/HideImage';
import axios from 'axios';
import { getNautilusAddressMapper, ASSET_URL } from "@utilities/LogoMapper";

// import dynamic from 'next/dynamic'
// const TimeRemaining = dynamic(() => import('@components/TimeRemaining'), {
//   ssr: false,
// });

export interface INftItem {
  imgUrl?: string;
  link: string;
  name: string;
  tokenId: string;
  qty?: number;
  price?: number;
  currency?: string;
  rarity?: string;
  saleType?: 'mint' | 'auction' | 'sale';
  artist?: string;
  artistLink?: string;
  collection?: string;
  collectionLink?: string;
  explicit?: boolean;
  type?: string;
  loading?: boolean;
  remainingVest?: number;
}

interface IUsersTokenCard {
  nftData: INftItem;
  index?: number;
  selected?: boolean[];
  setSelected?: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const randomInteger = (min: number, max: number) => {
  return (min + Math.random() * (max - min)).toFixed();
};

const UsersTokenCard: FC<IUsersTokenCard> = ({
  nftData,
  index,
  selected,
  setSelected
}) => {
  const router = useRouter();
  const rand = useMemo(() => randomInteger(1, 18), [1, 18]);
  const theme = useTheme()
  const SaleTypeSwitch = (saleType: 'mint' | 'auction' | 'sale') => {
    switch (saleType) {
      case "mint":
        return 'Mint';
      case "auction":
        return 'Auction';
      case "sale":
        return 'Sale';
    }
  }

  const handleSelect = () => {
    if (setSelected != undefined && index != undefined) {
      setSelected(prev => {
        const newArray = prev.map((item, i) => {
          if (index === i) {
            return !prev[index]
          }
          return item
        })
        return newArray
      })
    }
  }

  const { ref, width = 1 } = useResizeObserver<HTMLDivElement>();
  const [newWidth, setNewWidth] = useState(300)

  useEffect(() => {
    if (width > 260) setNewWidth(width)
  }, [width])

  const [imageUrl, setImageUrl] = useState<string>('')
  useEffect(() => {
    if (nftData.imgUrl) {
      const ipfsPrefix = 'ipfs://';
      const url = nftData.imgUrl
      if (!url.startsWith(ipfsPrefix) && url.startsWith('http://')) setImageUrl('https://' + url.substring(7))
      else if (!url.startsWith(ipfsPrefix)) setImageUrl(url)
      else setImageUrl(url.replace(ipfsPrefix, `https://cloudflare-ipfs.com/ipfs/`))
    }
    else if (nftData.imgUrl) setImageUrl(nftData.imgUrl)
    else setImageUrl('')
  }, [nftData])

  const [artist, setArtist] = useState<string | null>(null);
  const [showArtist, setShowArtist] = useState(true)
  useEffect(() => {
    const fetchArtist = async () => {
      if (nftData.tokenId) {
        let artist = null
        const cache = localStorage.getItem(`token-artist-${nftData.tokenId}`)
        if (cache) {
          artist = cache
        }
        else {
          const apiCall = await axios
            .get(process.env.ERGOPAD_API + `/asset/info/${nftData.tokenId}/minter`)
            .catch((err) => {
              console.log("ERROR FETCHING: ", err);
            });

          if (apiCall?.data) {
            artist = apiCall.data.minterAddress
            localStorage.setItem(`token-artist-${nftData.tokenId}`, artist)
          }
        }
        if (artist === null || artist === 'null') {
          setShowArtist(false)
          setArtist(null);
        }
        else setArtist(artist);
      }
    }
    if (!nftData.loading) fetchArtist();
  }, [nftData]);

  const [assetMapper, setAssetMapper] = useState<any>({});
  useEffect(() => {
    let isMounted = true;
    const loadMapper = async () => {
      const mapper = await getNautilusAddressMapper();
      if (isMounted) setAssetMapper(mapper);
    };
    loadMapper();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Card
        sx={{
          minWidth: '100%',
          backgroundColor: selected !== undefined && index !== undefined && selected[index] ?
            theme.palette.divider :
            theme.palette.background.paper,
          mb: '6px',
          // height: '100%',
          transform: selected !== undefined && index !== undefined && selected[index] ?
            "scale3d(0.95, 0.95, 1)" :
            "scale3d(1, 1, 1)",
          transition: "transform 0.15s ease-in-out"
        }}
      >
        <CardActionArea
          href={setSelected === undefined ? nftData.link : ''}
          onClick={() => setSelected != undefined && handleSelect()}
          disableRipple={selected !== undefined && index !== undefined ?
            true :
            false
          }
        >
          {nftData.loading ? (
            <>
              <Skeleton variant="rectangular" width={newWidth} height={newWidth} sx={{
                minWidth: '100%',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: theme.palette.divider,
              }} />
              <CardContent sx={{ position: 'relative' }}>
                <Skeleton variant="text" sx={{ fontSize: '1.27rem' }} />
              </CardContent>
            </>
          ) : (
            <>
              <Box ref={ref} sx={{
                height: `${newWidth}px`,
                minHeight: '260px',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: theme.palette.divider,
                backgroundImage: imageUrl ? `url(${imageUrl})` : '',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                transition: 'height 70ms linear'
              }}>
                {nftData.type === 'AUDIO' && (
                  <AudiotrackIcon
                    sx={{
                      position: 'absolute',
                      color: theme.palette.divider,
                      fontSize: '8rem',
                      top: '42%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
                {nftData.imgUrl === undefined && nftData.type === 'OTHER' && assetMapper[nftData.tokenId] && (
                  <TokenIcon src={ASSET_URL + "/" + assetMapper[nftData.tokenId]}
                    sx={{
                      position: 'absolute',
                      top: '42%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )
                }
                {nftData.remainingVest && 
                <Box>
                  Vested tokens remaining: {nftData.remainingVest}
                </Box>
                }
                {nftData.imgUrl === undefined && nftData.type != 'AUDIO' && !assetMapper[nftData.tokenId] && (
                  <HideImageIcon
                    sx={{
                      position: 'absolute',
                      color: theme.palette.divider,
                      fontSize: '5rem',
                      top: '42%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
              </Box>
              {nftData.price && setSelected === undefined && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    p: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    borderRadius: '6px',
                  }}
                >
                  <Typography sx={{ fontWeight: '700', }}>
                    {nftData.price + ' ' + nftData.currency}
                  </Typography>
                </Box>
              )}
              {selected !== undefined && index !== undefined && (
                <BpCheckbox
                  sx={{
                    position: 'absolute',
                    top: 1,
                    left: 1,
                  }}
                  checked={selected[index] !== undefined ? selected[index] : false}
                  inputProps={{ 'aria-label': 'selected-nft' }}
                />
              )}
              <CardContent sx={{ position: 'relative' }}>
                {nftData.saleType && setSelected === undefined && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '-16px',
                      right: '16px',
                      height: '28px',
                      p: '2px 8px',
                      background: theme.palette.primary.main,
                      color: theme.palette.background.default,
                      borderRadius: '50px',
                    }}
                  >
                    <Typography sx={{ fontWeight: '700', }}>
                      {SaleTypeSwitch(nftData.saleType)}
                    </Typography>
                  </Box>
                )}
                <Typography
                  sx={{
                    fontWeight: '600',
                    fontSize: '1.27rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {nftData.name}
                </Typography>
                {/* {nftData.saleEnd && (
                      <Box>
                        <AccessTimeIcon
                          sx={{
                            verticalAlign: '-0.25em',
                            mr: '5px',
                          }}
                        />
                        <Box
                          sx={{
                            display: 'inline-block',
                          }}
                        >
                          <TimeRemaining
                            endTime={nftData.saleEnd}
                          />
                        </Box>
                      </Box>
                    )} */}
              </CardContent>
            </>
          )}
        </CardActionArea>
        <CardActions
          sx={{
            p: '16px',
            pt: 0
          }}
        >
          {nftData.loading ? (
            <Grid2
              container
              direction="column"
              justifyContent="space-between"
              alignItems="left"
              sx={{
                width: '100%',
              }}
            >
              <Grid2>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
              </Grid2>
              <Grid2>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
              </Grid2>
              <Grid2>
                <Skeleton variant="text" sx={{ fontSize: '0.8rem' }} />
              </Grid2>
            </Grid2>
          ) : (
            <Grid2
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                width: '100%',
              }}
            >
              <Grid2>
                <Box
                  sx={{
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {nftData.collectionLink ? (
                    <Link
                      href={nftData.collectionLink}
                      sx={{
                        color: theme.palette.text.secondary,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {nftData.collection}
                    </Link>
                  ) : (
                    nftData.collection
                  )}
                  {' '}
                  {showArtist && (
                    <Typography
                      sx={{
                        fontStyle: 'italic',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: artist && 'ellipsis',
                      }}
                    >
                      {artist ? (
                        <>By <Link
                          href={'/users/' + artist}
                        >
                          {artist}
                        </Link>
                        </>
                      ) : (
                        <Skeleton
                          variant="text"
                          sx={{
                            fontSize: '1.1rem',
                            display: 'inline-block',
                            width: '220px'
                          }} />
                      )}
                    </Typography>
                  )}
                </Box>
              </Grid2>
            </Grid2>
          )}
        </CardActions>
      </Card>
    </>
  );
};

function BpCheckbox(props: CheckboxProps) {
  return (
    <Checkbox
      sx={{
        '&:hover': { bgcolor: 'transparent' },
      }}
      disableRipple
      color="default"
      checkedIcon={<BpCheckedIcon />}
      icon={<BpIcon />}
      {...props}
    />
  );
}

const BpIcon = styled('span')(({ theme }) => ({
  borderRadius: 3,
  width: 20,
  height: 20,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 0 0 1px rgb(16 22 26 / 40%)'
      : 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
  backgroundColor: theme.palette.mode === 'dark' ? '#394b59' : '#f5f8fa',
  backgroundImage:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
      : 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
  '.Mui-focusVisible &': {
    outline: '2px auto rgba(19,124,189,.6)',
    outlineOffset: 2,
  },
  'input:hover ~ &': {
    backgroundColor: theme.palette.mode === 'dark' ? '#30404d' : '#ebf1f5',
  },
  'input:disabled ~ &': {
    boxShadow: 'none',
    background:
      theme.palette.mode === 'dark' ? 'rgba(57,75,89,.5)' : 'rgba(206,217,224,.5)',
  },
}));

const BpCheckedIcon = styled(BpIcon)(({ theme }) => ({
  backgroundColor: '#00868F',
  backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
  '&:before': {
    display: 'block',
    width: 20,
    height: 20,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  'input:hover ~ &': {
    backgroundColor: '#106ba3',
  },
}));

const TokenIcon = styled("img")(() => ({
  width: "8rem",
  height: "8rem",
  borderRadius: "8px",
}));

export default UsersTokenCard;