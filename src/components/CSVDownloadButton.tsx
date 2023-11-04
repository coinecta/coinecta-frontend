import React from 'react';
import { unparse } from 'papaparse';
import Button, { ButtonProps } from '@mui/material/Button';

type CSVDownloadButtonProps = {
  data: any[];
  filename?: string;
  maxNestedLevel?: number;
  children?: React.ReactNode;
  buttonProps?: ButtonProps;
};

const flattenObject = (obj: any, parentKey = '', separator = '_', level = 0, maxLevel?: number) => {
  let flattened: any = {};

  for (let key in obj) {
    let newKey = parentKey ? `${parentKey}${separator}${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (maxLevel !== undefined && level >= maxLevel) {
        // If max level is reached, concatenate the values
        flattened[newKey] = Object.values(obj[key]).join(', ');
      } else {
        // Else, recursively flatten the object
        Object.assign(flattened, flattenObject(obj[key], newKey, separator, level + 1, maxLevel));
      }
    } else {
      flattened[newKey] = obj[key];
    }
  }

  return flattened;
};

const CSVDownloadButton: React.FC<CSVDownloadButtonProps> = ({
  data,
  filename = 'file.csv',
  maxNestedLevel,
  children,
  buttonProps
}) => {
  const flattenedData = data.map(item => flattenObject(item, '', '_', 0, maxNestedLevel));

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent any default button behavior

    const config = {
      header: true,
      delimiter: ","
    };

    const csv = unparse(flattenedData, config);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button onClick={handleClick} {...buttonProps}>
      {children || 'Download CSV'}
    </Button>
  );
};

export default CSVDownloadButton;
