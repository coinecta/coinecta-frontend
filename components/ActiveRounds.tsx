import React, { useState, useEffect, FC } from 'react';
import {
  Grid,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Box,
  Paper
} from '@mui/material';
import { useWhitelistProjects } from "@hooks/useWhitelistProjects";
import { useContributionProjects } from "@hooks/useContributionProjects";
import Image from 'next/image';
import Link from '@components/Link';
import { IProject } from '@pages/projects/[project_id]';

var months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface WhitelistEvent {
  projectName: string;
  roundName: string;
  title: string;
  details: string;
  additionalDetails: {
    min_stake: number;
    add_to_footer: boolean;
    staker_snapshot_whitelist: boolean;
  };
  id: number;
  eventId: number;
  subtitle: string;
  checkBoxes: {
    checkBoxText: string[];
  };
}

interface ContributionEvent {
  id: number;
  eventId: number;
  subtitle: string;
  checkBoxes: {
    checkBoxes: string[];
  };
  tokenName: string;
  tokenPrice: number;
  whitelistTokenId: string;
  title: string;
  projectName: string;
  roundName: string;
  details: string;
  tokenId: string;
  tokenDecimals: number;
  proxyNFTId: string;
  additionalDetails: {
    add_to_footer: boolean;
  };
}

interface ButtonProps {
  roundType?: string;
  roundName?: string;
  itemName: string;
  projectName: string;
  link?: string;
  disabled?: boolean;
}

const ButtonNextLink: React.FC<ButtonProps> = ({ roundType, roundName, itemName, projectName, link, disabled }) => {
  const buttonStyles = {
    height: '60px',
    width: '100%',
    justifyContent: 'flex-start'
  };

  if (disabled) {
    return (
      <Button variant="contained" disabled sx={buttonStyles}>
        {itemName}
      </Button>
    );
  } else if (link) {
    return (
      <Button href={link} variant="contained" target="_blank" sx={buttonStyles}>
        {itemName}
      </Button>
    );
  } else {
    return (
      <Link href={"/" + roundType + "/" + projectName + "/" + roundName + "/"}>
        <Button variant="contained" sx={buttonStyles}>
          {itemName}
        </Button>
      </Link>
    );
  }
};

interface ICheckButtonType {
  itemName: string;
  activeRounds: { projectName: string; roundName: string; title: string; }[];
  projectName: string;
}

const transformName = (name: string): string => name.toLowerCase().replaceAll(" ", "").replaceAll(/[^a-zA-Z0-9]/g, "");

const CheckButtonType: React.FC<ICheckButtonType> = ({ itemName, activeRounds, projectName }) => {
  const removePrefix = (str: string): string => {
    return str.replace(/coinecta-wl-|coinecta-ctr-|cardano-/g, '');
  };
  const cleanedProjectName = removePrefix(projectName);
  const lowerCaseItemName = itemName.toLowerCase();
  const transformedProjectName = transformName(cleanedProjectName);

  const hasMatchingWord = (str1: string, str2: string) => str1.toLowerCase().split(' ').some(word => str2.toLowerCase().split(' ').includes(word));

  const roundTypes = ['seed', 'staker', 'strategic', 'public', 'presale'];
  const roundActions = ['whitelist', 'contribution'];

  const button = activeRounds.map(round => {
    if (hasMatchingWord(removePrefix(round.projectName).toLowerCase(), cleanedProjectName.toLowerCase())) {
      if (lowerCaseItemName.includes('ido')) {
        return <ButtonNextLink itemName={itemName} projectName="" link="https://app.spectrum.fi/ergo/swap" />;
      }
      else if (round.title.includes('coinecta-wl-')) {
        return <ButtonNextLink roundName={round.roundName} roundType={'whitelist'} itemName={itemName} projectName={transformedProjectName} />;
      }
      else if (round.title.includes('coinecta-ctr-')) {
        return <ButtonNextLink roundName={round.roundName} roundType={'contribution'} itemName={itemName} projectName={transformedProjectName} />;
      }
    }
    return null
  });
  return button[0] !== null ? button[0] : <ButtonNextLink itemName={itemName} projectName="" disabled />
}

const ActiveRounds: FC<{ project: IProject; isLoading: boolean; }> = ({ project, isLoading }) => {
  const [activeRounds, setActiveRounds] = useState<any>([]);
  const { whitelistProjects } = useWhitelistProjects();
  const { contributionProjects } = useContributionProjects();

  useEffect(() => {
    const filteredContributionProjects = contributionProjects?.filter((event: ContributionEvent) => {
      return event.projectName.includes('coinecta-ctr-');
    });
    const filteredWhitelistProjects = whitelistProjects?.filter((event: WhitelistEvent) => {
      return event.projectName.includes('coinecta-wl-');
    });
    setActiveRounds(() => [...filteredContributionProjects, ...filteredWhitelistProjects]);
  }, []);

  return (
    <>
      {project.roadmap.roadmap.map((item, i) => (
        <Grid container key={i} sx={{ mb: '24px' }}>
          <Grid item xs={2}>
            <Typography sx={{ fontSize: '.875rem' }}>
              {months[parseInt(item.date.slice(5, 7))]}
            </Typography>
            <Typography sx={{ fontSize: '2.25rem', lineHeight: 0.7 }}>
              {item.date.slice(8, 10)}
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <CheckButtonType itemName={item.name} activeRounds={activeRounds} projectName={project.name} />
          </Grid>
        </Grid>
      ))}
    </>
  );
};

export default ActiveRounds;