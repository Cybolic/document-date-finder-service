import { useState } from 'react';
import FileUpload from '@components/UploadFormOrigin.js';
import { Button } from './ui/button';
import type { FileWithPreview } from '@/hooks/use-file-upload';
import type { FoundDate, FileWithDates } from '@types/found-dates.js';

type ApiResponse = {
  message: string;
  data: Record<string, FoundDate[]>;
};
type Props = {
  onUploadStart?: (files: File[]) => void;
  onUploadDone?: (files: FileWithDates[]) => void;
  onError?: (error: Error) => void;
};

export default function FileUploadMultiple({ onUploadStart, onUploadDone, onError }: Props) {
  const [fileList, setFileList] = useState<File[]>([]);

  const handleFileChange = (files: FileWithPreview[]) => {
    console.log('Files selected:', files);
    const plainFiles = files.map(file => file.file as File);
    setFileList(plainFiles);
  };

  const handleUploadClick = () => {
    if (!fileList) {
      console.error('No files selected');
      return;
    }

    console.log('Files selected:', fileList);
    const data = new FormData();
    fileList.forEach((file) => data.append(`files`, file, file.name));

    onUploadStart?.(fileList);

    fetch('/api/v1/docx', { method: 'POST', body: data })
      .then((res) => res.json())
      .then((data: ApiResponse) => onUploadDone?.(
        fileList.map(file => ({
          file,
          dates: (data.data[file.name] || []).filter(date =>
            // SuperDoc doesn't seem to handle headers and footers, so skip dates found there
            (date.location.includes('header') || date.location.includes('footer')) ?
                false
              : true
          )
        } as FileWithDates))
      ))
      .catch((err) => onError?.(err instanceof Error ? err : new Error('Unknown error')));
  };

  return (<div className="flex flex-col items-center gap-4">
    <FileUpload
      accept={"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
      multiple={true}
      onFilesChange={handleFileChange}
    />
    { (fileList.length > 0) ? (
      <Button
        variant="default"
        onClick={handleUploadClick} disabled={fileList == null || !fileList.length}
      >
        Find Dates
      </Button>
    ) : null}
  </div>);
  /* In case the third-party component is unwanted,
     here's a clean implementation.
  */
  // return (
  //   <div>
  //     <input type="file" onChange={handleFileChange} multiple />

  //     <ul>
  //       {files.map((file, i) => (
  //         <li key={i}>
  //           {file.name} - {file.type}
  //         </li>
  //       ))}
  //     </ul>

  //     <button
  //       onClick={handleUploadClick}
  //       disabled={!fileList?.length}
  //     >Upload</button>
  //   </div>
  // );
}

