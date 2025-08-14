import { useState } from 'react';
import './App.css';
import Calendar from '@/components/Calendar.js';
import DateListing from '@components/DateListing.js';
import DocumentDialog from '@components/DocumentDialog.js';
import FileUploadMultiple from '@components/UploadForm.js';
import type { DateToFileMapping, DateToFileMappings, FilesWithDates } from '@types/found-dates.js';

function App() {
  const [parsedFiles, setParsedFiles] = useState<FilesWithDates>([]);
  const [datesToFiles, setDatesToFiles] = useState<DateToFileMappings>({});
  const [currentDocument, setCurrentDocument] = useState<DateToFileMapping | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const handleUploadDone = (files: FilesWithDates) => {
    setParsedFiles(files);
    setDatesToFiles(files.reduce((acc, fileData, fileIndex) => {
      fileData.dates.forEach((date, index) => {
        const isoDate = date.found_date.replace(/T.*Z$/, ''); // Normalize to YYYY-MM-DD

        if (acc[isoDate] === undefined) {
          acc[isoDate] = [];
        }

        acc[isoDate].push({
          filename: fileData.file.name,
          fileIndex,
          date: isoDate,
          dateIndex: index,
          context: date.context,
          foundText: date.found_text,
        });
      });
      return acc;
    }, {} as DateToFileMappings));

    const firstFileWithDates = files.find(file => !!file.dates.length);
    setCurrentDate(firstFileWithDates ?
        new Date(firstFileWithDates?.dates[0].found_date)
      : new Date()
    );
  };

  // When a date in the list of dates is clicked
  const handleDateListingClick = (date: string) => {
    console.log('Date listing clicked:', date);
    setCurrentDate(new Date(date));
  };

  // When a date in the calendar is clicked
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date, parsedFiles, datesToFiles, date.toISOString());
    if (parsedFiles.length) {
      const matchedDate = datesToFiles[date.toISOString()];
      console.log('Date clicked:', date, 'Matched file:', matchedDate);
    }
  };

  // When a "View Document" button is clicked in the calendar
  const handleDocumentClick = (file: DateToFileMapping) => {
    setCurrentDocument(file);
  };

  return (<>
    <div className="flex justify-center items-center mb-4">
      <FileUploadMultiple
        onUploadStart={(files) => console.log('Upload started', files)}
        onUploadDone={handleUploadDone}
        onError={(error) => console.error('Upload error:', error)}
      />
    </div>
    { parsedFiles.length > 0 ? (<>
      <div className="flex justify-center items-center gap-4 mb-4">
        <DateListing
          datesToFiles={datesToFiles}
          onClick={handleDateListingClick}
        />
        <Calendar
          visibleDate={currentDate}
          parsedFiles={parsedFiles}
          datesToFiles={datesToFiles}
          onDateClick={handleDateClick}
          onDocumentClick={handleDocumentClick}
        />
      </div>
      { currentDocument ? (
        <DocumentDialog
          parsedFile={parsedFiles[currentDocument.fileIndex]}
          dateToFileMapping={currentDocument}
          onClose={() => setCurrentDocument(null)}
        />
      ) : null }
    </>) : null }
  </>)
}

export default App
