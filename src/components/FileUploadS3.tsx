import { FC, useState } from 'react';
import { trpc } from '@lib/utils/trpc';
import { Button, CircularProgress } from '@mui/material';
import { slugify } from '@lib/utils/general';

type UploadResponse = {
  status: string;
  image_url?: string;
  message?: string;
};

type FileUploadS3Props = {
  onUpload: (response: UploadResponse) => void;
  fileName: string;
};

const FileUploadS3: FC<FileUploadS3Props> = ({ onUpload, fileName }) => {
  const [isLoading, setLoading] = useState(false);
  const uploadFile = trpc.file.upload.useMutation()

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    const maxSize = 5242880 // 5MB

    if (file.size > maxSize) {
      alert(`Please select a file smaller than ${maxSize / 1048576} MB.`);
      return;
    }

    setLoading(true);

    // Function to convert file into Base64 format
    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = error => reject(error);
        fileReader.readAsDataURL(file); // This will encode the file as base64
      });
    };

    try {
      const base64File = await convertFileToBase64(file);

      // Remove the base64 prefix generated by readAsDataURL (if necessary)
      const base64Data = base64File.split(';base64,').pop();

      if (base64Data) {
        const slugFileName = slugify(fileName)
        const extension = file.name.split('.').pop() || ''; // safe default, in case there's no extension
        const correctedFileName = `${slugFileName}.${extension}`
        const response = await uploadFile.mutateAsync({ fileContent: base64Data, fileName: correctedFileName });
        onUpload(response);
      }
      else throw new Error('Error parsing file data')
    } catch (error: any) {
      console.error('Upload failed', error);
      onUpload({
        status: 'failed',
        message: error.message || 'Something went wrong during the upload',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="contained" component="label" disabled={isLoading} sx={{ textTransform: 'none' }}>
      {isLoading ? <CircularProgress /> : 'Upload file'}
      <input type="file" hidden onChange={onFileChange} />
    </Button>
  );
};

export default FileUploadS3;