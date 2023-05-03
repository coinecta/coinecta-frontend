import NextLink, { LinkProps } from 'next/link';
import { FC, HTMLProps } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { sizeHeight } from '@mui/system';

// Use only when the button is linking to internal pages. 
// For external links or buttons that use onClick functions, don't use this component

const ButtonLink: FC<
  LinkProps &
  // HTMLProps<HTMLAnchorElement> &
  ButtonProps
> = ({
  as,
  children,
  href,
  replace,
  scroll,
  shallow,
  classes,
  color,
  disabled,
  disableElevation,
  disableFocusRipple,
  endIcon,
  fullWidth,
  size,
  startIcon,
  sx,
  variant,
  // ...rest
}) => (
    <NextLink
      as={as}
      href={href}
      passHref
      replace={replace}
      scroll={scroll}
      shallow={shallow}
    >
      {/* <a {...rest}> */}
      <Button
        classes={classes}
        color={color}
        disabled={disabled}
        disableElevation={disableElevation}
        disableFocusRipple={disableFocusRipple}
        endIcon={endIcon}
        fullWidth={fullWidth}
        size={size}
        startIcon={startIcon}
        sx={sx}
        variant={variant}
      >
        {children}
      </Button>
      {/* </a> */}
    </NextLink>
  );

export default ButtonLink;