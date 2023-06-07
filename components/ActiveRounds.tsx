import React from 'react';
import { Button } from '@mui/material'; // Assuming you're using MUI for Button.
import Link from 'next/link'; // Assuming you're using Next.js.

interface ButtonProps {
  roundType: string;
  roundName: string;
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
      <Link href={"/" + roundType + "/" + projectName + "/" + roundName + "/"} passHref>
        <Button variant="contained" sx={buttonStyles}>
          {itemName}
        </Button>
      </Link>
    );
  }
};

interface Props {
  name: string;
  activeRounds: { projectName: string; roundName: string; title: string; }[];
  project: { name: string; };
}

const transformName = (name: string): string => name.toLowerCase().replaceAll(" ", "").replaceAll(/[^a-zA-Z0-9]/g, "");

const ActiveRounds: React.FC<Props> = ({ name, activeRounds, project }) => {

  const lowerCaseName = name.toLowerCase();
  const transformedProjectName = transformName(project.name);

  const roundTypes = ['seed', 'staker', 'strategic', 'public'];
  const roundActions = ['whitelist', 'contribution'];
  
  for (const roundType of roundTypes) {
    if (!lowerCaseName.includes(roundType)) continue;

    for (const roundAction of roundActions) {
      if (!lowerCaseName.includes(roundAction)) continue;
  
      const isValidRound = activeRounds.some(attr => {
        const transformedProjectNameAttr = transformName(attr.projectName);
        const transformedRoundNameAttr = transformName(attr.roundName);
  
        return transformedProjectNameAttr === transformedProjectName
          && transformedRoundNameAttr === roundType
          && attr.title.toLowerCase().includes(roundAction);
      });

      if (isValidRound) {
        return <ButtonNextLink roundName={roundType} roundType={roundAction} itemName={name} projectName={transformedProjectName} />;
      }
    }
  }

  if (lowerCaseName.includes('ido')) {
    return <ButtonNextLink roundName="" roundType="" itemName={name} projectName="" link="https://app.spectrum.fi/ergo/swap" />;
  }
  
  return <ButtonNextLink roundName="" roundType="" itemName={name} projectName="" disabled />;
}

export default ActiveRounds;