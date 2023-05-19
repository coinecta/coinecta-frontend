import { Tooltip } from '@mui/material';
import { ReactElement, useState } from 'react';

const CopyToClipboard = (props: { TooltipProps: any; children: (arg0: { copy: (content: any) => void; }) => ReactElement<any, any>; }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const onCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setShowTooltip(true);
  };

  return (
    <Tooltip
      open={showTooltip}
      title={'Link copied to clipboard!'}
      leaveDelay={1500}
      onClose={() => setShowTooltip(false)}
      {...(props.TooltipProps || {})}
    >
      {props.children({ copy: onCopy })}
    </Tooltip>
  );
};

export default CopyToClipboard;
