export type FoundDate = {
  type: 'header' | 'footer' | 'run';
  found_date: string;
  found_text: string;
  context: string;
  location: string;
  text: string;
};

export type FileWithDates = {
  file: File;
  dates: FoundDate[];
};
export type FilesWithDates = FileWithDates[];

export type DateToFileMapping = {
  filename: string;
  fileIndex: number;
  date: string;
  dateIndex: number;
  context: string;
  foundText: string;
};
export type DateToFileMappings = Record<string, DateToFileMapping[]>;

