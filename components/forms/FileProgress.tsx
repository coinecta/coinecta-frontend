import React, { FC, useState, useEffect } from 'react';
import { ipfsUpload } from '@utils/nft-storage';
import { IFileData, IFileUrl } from '@components/forms/FileUploadAreaIpfs'
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Avatar,
  LinearProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { bytesToSize, aspectRatioResize } from "@utilities/general";

interface IFileProgressProps {
  thisFileData: IFileData;
  setFileData: React.Dispatch<React.SetStateAction<IFileData[]>>;
  deleteFile: Function;
  setResponse: React.Dispatch<React.SetStateAction<IFileUrl[]>>;
}

const FileProgress: FC<IFileProgressProps> = ({ thisFileData, deleteFile, setResponse, setFileData }) => {
  const [uploadFailed, setUploadFailed] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async () => {
    setUploadFailed(false)
    setProgress(0)
    const result = await ipfsUpload(thisFileData, (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setProgress(percentCompleted);
    });
    if (result !== undefined) {
      setResponse(prevArray => {
        return [...prevArray, result]
      })
      setProgress(100)
      setFileData(prevData => {
        return prevData.map(file =>
          file.id === thisFileData.id
            ? { ...file, progress: 100, message: "uploaded" }
            : file
        );
      });
    }
    else {
      setFileData(prevData => {
        return prevData.map(file =>
          file.id === thisFileData.id
            ? { ...file, message: "upload failed", progress: 0 }
            : file
        );
      });
      setProgress(0)
      setUploadFailed(true)
    }
  };

  useEffect(() => {
    if (thisFileData.message.includes("uploading")) {
      const groupNumber = parseInt(thisFileData.message.split(" ")[1]);
      if (groupNumber === 1) {
        console.log('first group')
        handleUpload();
      } else {
        const delay = (groupNumber) * 10000;
        setTimeout(() => {
          console.log('group ' + groupNumber)
          handleUpload();
        }, delay);
      }
    }
  }, [thisFileData])

  return (
    <>
      <ListItem
        // key={i}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => deleteFile(thisFileData.id)}
          >
            <DeleteIcon />
          </IconButton>
        }
      >
        <ListItemAvatar>
          <Avatar src={thisFileData.previewImage} variant="rounded" />
        </ListItemAvatar>
        <ListItemText
          primary={thisFileData.currentFile.name}
          secondary={bytesToSize(thisFileData.currentFile.size)}
          sx={{
            "& .MuiTypography-body2": {
              mb: 0,
            },
          }}
        />
      </ListItem>
      <LinearProgress variant="determinate" value={progress} color={uploadFailed ? "error" : "primary"} />
    </>
  );
};

export default FileProgress;