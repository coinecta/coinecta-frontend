import React, { FC, useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  Box,
  FormControl,
  Input,
  useTheme,
  InputLabel,
  SxProps,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Avatar,
  LinearProgress
} from "@mui/material";
import Image from "next/image";
import { bytesToSize, aspectRatioResize } from "@utilities/general";
import DeleteIcon from "@mui/icons-material/Delete";
import { storeNFT } from "@utils/nft-storage";
import axios from "axios";
import { resolveIpfs } from "@utils/assets";
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import { ipfsUpload } from "@utils/nft-storage";
import FileProgress from "./FileProgress";
import { randomUUID } from "crypto";
import { v4 as uuidv4 } from 'uuid';

export interface IFileData {
  currentFile: File;
  previewImage: string;
  progress: number;
  message: string;
  id?: string;
}

const fileInitObject: IFileData = {
  currentFile: {} as File,
  previewImage: "",
  progress: 0,
  message: "",
  id: uuidv4()
};

const fileInit = [fileInitObject];

export interface IFileUrl {
  url: string;
  ipfs: string;
}

interface IFileUploadAreaProps {
  fileUrls: IFileUrl[];
  setFileUrls: React.Dispatch<React.SetStateAction<IFileUrl[]>>;
  ipfsFlag?: boolean;
  autoUpload?: boolean;
  title?: string;
  expectedImgHeight?: number;
  expectedImgWidth?: number;
  type?: "avatar";
  multiple?: boolean;
  sx?: SxProps;
  imgFill?: boolean;
  clearTrigger: boolean;
  setClearTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Todos:
 * 1. Rename this file with a better name
 * 2. Use ipfs backend api instead of direct upload
 * 3. Use S3 upload instead on local api
 */
const FileUploadAreaIpfs: FC<IFileUploadAreaProps> = ({
  fileUrls,
  setFileUrls,
  ipfsFlag,
  title,
  expectedImgHeight,
  expectedImgWidth,
  type,
  multiple,
  sx,
  imgFill,
  clearTrigger,
  setClearTrigger,
  autoUpload,
}) => {
  const theme = useTheme();
  const [aspect, setAspect] = useState({});
  const [fileData, setFileData] = useState(fileInit);
  const [progress, setProgress] = useState<any[]>([])
  const [upload, setUpload] = useState(false)

  useEffect(() => {
    if (fileUrls.length === fileData.length) setUpload(false)
  }, [fileUrls.toString()])

  useEffect(() => {
    if (expectedImgHeight && expectedImgWidth) {
      setAspect(
        aspectRatioResize(expectedImgWidth, expectedImgHeight, 800, 350)
      );
    }
  }, []);

  useEffect(() => {
    if (!multiple && fileData[0]?.previewImage) {
      if (expectedImgHeight && expectedImgWidth) {
        setAspect(
          aspectRatioResize(expectedImgWidth, expectedImgHeight, 800, 350)
        );
      } else {
        let img = document.createElement("img");
        img.src = fileData[0].previewImage;
        img.onload = () => {
          setAspect(
            aspectRatioResize(img.naturalWidth, img.naturalHeight, 800, 300)
          );
        };
      }
    }
  }, [fileData[0].previewImage]);

  useEffect(() => {
    if (clearTrigger === true) {
      clearFiles();
      setClearTrigger(false);
    }
  }, [clearTrigger]);

  const [dropHover, setDropHover] = useState("");
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropHover("#f00");
    e.stopPropagation();
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropHover("");
    e.stopPropagation();
  };
  // const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  //   e.preventDefault();
  //   e.dataTransfer.dropEffect = 'copy';
  //   e.stopPropagation();
  // };

  const clearFiles = () => {
    setInputKey(randomNumber());
    setFileData([fileInitObject]);
  };

  const checkExists = (name: string) => {
    const truth = fileData.some((value) => value.currentFile.name === name);
    return truth;
  };

  const onFileChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    setDropHover("");
    if ("files" in event.target && event.target.files?.[0] != undefined) {
      Array.from(event.target.files).forEach((file: File, i: number) => {
        if (!multiple || (i === 0 && fileData?.[0]?.previewImage === "")) {
          // make sure to erase the existing empty object first
          setFileData([
            {
              currentFile: file,
              previewImage: URL.createObjectURL(file),
              progress: 0,
              message: "",
              id: uuidv4()
            },
          ]);
          if (
            type === undefined &&
            expectedImgHeight === undefined &&
            expectedImgWidth === undefined
          ) {
            let img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.onload = () => {
              setAspect(
                aspectRatioResize(img.naturalWidth, img.naturalHeight, 800, 300)
              );
            };
          }
        } else {
          if (!checkExists(file.name)) {
            setProgress([...fileData.map(() => { return 0 }), 0])
            setFileData((files) => [
              ...files,
              {
                currentFile: file,
                previewImage: URL.createObjectURL(file),
                progress: 0,
                message: "",
                id: uuidv4()
              },
            ]);
          }
        }
      });
    } else if (!multiple) {
      setFileData([fileInitObject]);
    }
  };

  const deleteFile = (fileNumber: number) => {
    if (fileData.length > 1) setFileData(fileData.filter((data, idx) => idx !== fileNumber));
    else setFileData([fileInitObject]);
  };

  const deleteFileById = (fileId: string) => {
    setFileData(prevFileData => {
      if (prevFileData.length > 1) {
        return prevFileData.filter(data => data.id !== fileId);
      } else {
        return [fileInitObject];
      }
    })
  };

  const randomNumber = () => {
    return Math.random().toString(36);
  };
  const [isLoading, setIsLoading] = React.useState(false);
  const inputFileRef = React.useRef<HTMLInputElement | null>(null);
  const [inputKey, setInputKey] = useState(randomNumber());

  const ipfsUpload = async () => {
    setIsLoading(true);
    try {
      const promises = fileData.map(async (file) => {
        const formData = new FormData();
        formData.append("fileobject", file.currentFile, file.currentFile.name);
        const res = await axios.post(
          `${process.env.API_URL}/nft/upload_file`,
          formData
        );
        return res.data.url;
      });
      const promisesS3 = fileData.map(async (file) => {
        const formData = new FormData();
        formData.append("fileobject", file.currentFile, file.currentFile.name);
        const res = await axios.post(
          `${process.env.API_URL}/upload_file`,
          formData
        );
        return res.data.url;
      });
      const results = await Promise.all(promises);
      const resultsS3 = await Promise.all(promisesS3);
      const newArray = results.map((item, index) => {
        return {
          url: resultsS3[index],
          ipfs: item,
        };
      });
      if (setFileUrls) setFileUrls(newArray);
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const handleUpload = async () => {
    /* If file is not selected, then show alert message */
    if (fileData[0].currentFile.name == undefined) {
      console.log("Please, select the file(s) you want to upload");
      return;
    }
    if (!multiple) ipfsUpload();
    else {
      setFileData((prevData) => {
        let count = 1
        return prevData.map((file) => {
          if (file.message !== 'uploaded') {
            const message = `uploading ${Math.ceil(count / 20)}`;
            count++
            return { ...file, message: message }
          }
          else return file
        }
        )
      }
      );
    }
  };

  // auto upload if fileData changes and autoUpload is true
  useEffect(() => {
    if (autoUpload && fileData[0].currentFile.name !== undefined) {
      handleUpload();
    }
  }, [JSON.stringify(fileData)]);

  return (
    <Box
      sx={
        sx
          ? sx
          : {
            height: "100%",
          }
      }
    >
      <Box
        sx={{
          background:
            theme.palette.mode == "dark"
              ? "#242932"
              : theme.palette.background.paper,
          borderStyle: "solid",
          borderWidth: "1px",
          borderRadius: "6px",
          borderColor: theme.palette.divider,
          p: "12px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <InputLabel
          htmlFor="fileInputUncontrolled"
          sx={{ mb: "12px", position: "relative", overflow: "visible" }}
          onClick={(e) => e.preventDefault()}
        >
          <Grid container justifyContent="space-between">
            <Grid item xs>
              <Typography>{title}</Typography>
            </Grid>
            {multiple &&
              <Grid item xs="auto">
                <Typography>
                  {fileData.length} files.
                </Typography>
              </Grid>
            }
            <Grid item xs="auto">
              {isLoading && <CircularProgress />}
              <Button
                size="small"
                onClick={() => handleUpload()}
                disabled={isLoading}
              >
                Upload
              </Button>
              <Button size="small" onClick={clearFiles}>
                Clear Data
              </Button>
            </Grid>
          </Grid>
        </InputLabel>
        <FormControl
          sx={{
            borderRadius: "6px",
            width: "100%",
            height: "100%",
            display: "block",
            position: "relative",
            border: `1px dashed ${theme.palette.divider}`,
            "&:hover": {
              cursor: "pointer",
              background: theme.palette.action.hover,
            },
          }}
          // onDragOver={e => handleDragOver(e)}
          onDragEnter={(e) => handleDragEnter(e)}
          onDragLeave={(e) => handleDragLeave(e)}
        // onDrop={e => handleDrop(e)}
        >
          <Input
            ref={inputFileRef}
            type="file"
            id="fileInputUncontrolled"
            title=""
            onChange={onFileChange}
            inputProps={{
              accept: "image/*",
              multiple: multiple ? true : false,
            }}
            sx={{
              zIndex: 10,
              opacity: 0,
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              flexGrow: "1",
              "& input": {
                width: "100%",
                height: "100%",
                cursor: "pointer !important",
              },
              "&::before": {
                display: "none",
              },
              "&::after": {
                display: "none",
              },
            }}
            key={inputKey}
          />
          <Box
            sx={{
              textAlign: "center",
              position: "relative",
              background: dropHover ? dropHover : "none",
              width: "100%",
              height: "100%",
              p: imgFill ? "6px" : "24px",
              zIndex: 1,
            }}
          >
            {multiple && fileData[0]?.currentFile.name != undefined ? ( // if multiple files can be added
              <>
                <Typography>Add more (Unique filenames only)</Typography>
                {expectedImgWidth && expectedImgHeight && (
                  <Typography sx={{ color: theme.palette.text.secondary }}>
                    Recommended dimensions:{" "}
                    {" " +
                      expectedImgWidth +
                      "px Wide by " +
                      expectedImgHeight +
                      "px High"}
                  </Typography>
                )}
              </>
            ) : (
              // for single file upload areas only:
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                  mx: "auto",
                  //     position: 'absolute',
                  // left: '50%',
                  // top: '50%',
                  // transform: 'translate(-50%,-50%)',
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                    minHeight: "100px",
                  }}
                >
                  {fileData?.[0]?.previewImage != "" &&
                    fileData?.[0]?.currentFile?.name != undefined ? (
                    <>
                      {type === "avatar" ? (
                        <Box sx={{ mx: "auto" }}>
                          <Box
                            sx={{
                              width: expectedImgWidth
                                ? expectedImgWidth.toString() + "px"
                                : "120px",
                              height: expectedImgHeight
                                ? expectedImgHeight.toString() + "px"
                                : "120px",
                              maxWidth: "240px",
                              maxHeight: "240px",
                              position: "relative",
                              display: "inline-block",
                              verticalAlign: "middle",
                              borderRadius: "240px",
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              src={fileData[0].previewImage}
                              layout="fill"
                              objectFit="contain"
                              alt="image"
                            />
                          </Box>
                          {imgFill ? (
                            ""
                          ) : (
                            <Box
                              sx={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                textAlign: "left",
                                ml: "12px",
                              }}
                            >
                              <Typography>
                                {fileData[0].currentFile.name}
                              </Typography>
                              <Typography>
                                {bytesToSize(fileData[0].currentFile.size)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <>
                          <Box
                            sx={{
                              borderRadius: "6px",
                              overflow: "hidden",
                              display: "block",
                              position: "relative",
                              maxWidth: "100%",
                              mb: imgFill ? 0 : "12px",
                              mx: "auto",
                              ...aspect,
                            }}
                          >
                            <Image
                              src={fileData[0].previewImage}
                              layout="fill"
                              objectFit="cover"
                              alt="image"
                            />
                          </Box>
                          {imgFill ? (
                            ""
                          ) : (
                            <Box>
                              <Typography>
                                {fileData[0].currentFile.name +
                                  " - " +
                                  bytesToSize(fileData[0].currentFile.size)}
                              </Typography>
                            </Box>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Typography sx={{ color: theme.palette.text.secondary }}>
                        Drag and drop an image or click to choose.
                      </Typography>
                      {expectedImgWidth && expectedImgHeight && (
                        <Typography
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Recommended dimensions:{" "}
                          {" " +
                            expectedImgWidth +
                            "px Wide by " +
                            expectedImgHeight +
                            "px High"}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </FormControl>
        {multiple && fileData[0]?.currentFile.name != undefined && (
          <List>
            {fileData.map((file: IFileData, i: number) => {
              return (
                <FileProgress
                  key={file.id}
                  thisFileData={file}
                  setFileData={setFileData}
                  setResponse={setFileUrls}
                  deleteFile={deleteFileById}
                />
              );
            })}
          </List>
        )}
        {!multiple && fileUrls[0]?.ipfs && (
          <Box sx={{ mt: 1 }}>
            Current Image:
            {fileUrls.map((item, i) => {
              const url = resolveIpfs(item.ipfs)
              return (
                <Box sx={{ flexDirection: 'row', display: 'flex', alignItems: 'center' }} key={i}>
                  <Avatar src={url} variant="rounded" sx={{ mr: 1 }} />
                  <Typography sx={{ flex: 1 }}>{item.ipfs}</Typography>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>
      <Button
        onClick={() => {
          console.log(fileData);
        }}
      >
        Console Log file data
      </Button>
    </Box>
  );
};

export default FileUploadAreaIpfs;