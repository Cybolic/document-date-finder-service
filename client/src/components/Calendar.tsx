import { useState, useEffect } from 'react';
import { Calendar as OriginCalendar } from '@components/ui/calendar.js';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@components/ui/tooltip.js';
import { Button } from '@components/ui/button.js';
import type { DateToFileMapping, DateToFileMappings, FileWithDates, FilesWithDates } from '@types/found-dates.js';
import type { DayButtonProps } from 'react-day-picker';

type Props = {
  visibleDate: Date;
  parsedFiles: FilesWithDates;
  datesToFiles: DateToFileMappings;
  onDateClick?: (date: Date) => void;
  onDocumentClick?: (file: DateToFileMapping) => void;
};

export default function Calendar({ visibleDate, parsedFiles, datesToFiles, onDocumentClick, onDateClick }: Props) {
  const [dates, setDates] = useState<Date[]>([])

  useEffect(() => {
    setDates(parsedFiles.map((fileData: FileWithDates) =>
      fileData.dates.map(date => new Date(date.found_date))
    ).flat());
  }, [parsedFiles]);

  const handleDateSelect = (_newArray: unknown[], selectedDate: Date) => {
    onDateClick?.(selectedDate);
  };

  const handleDocumentClick = (file: DateToFileMapping) => {
    onDocumentClick?.(file);
  }

  return (
    <div>
      <OriginCalendar
        mode={'multiple'}
        selected={dates}
        month={visibleDate}
        onSelect={handleDateSelect}
        className="rounded-md border p-2"
        classNames={{
          day_button: 'size-14',
        }}
        components={{
          DayButton: (props: DayButtonProps) => (
            <DayButton {...props}
              datesToFiles={datesToFiles}
              onClick={handleDocumentClick as Extract<DayButtonProps, 'onClick'>}
            /> 
          ),
        }}
      />
    </div>
  )
}

function DayButton(props: DayButtonProps & {
  datesToFiles: DateToFileMappings
  onClick: (file: DateToFileMapping) => void;
}) {
  const { datesToFiles, day, onClick, ...buttonProps } = props;
  const selectedDay = day.dateLib.format(day.date, 'yyyy-MM-dd'); // Normalize
  const data = datesToFiles[selectedDay] || null;

  let dateTexts = null;
  if (data) {
    dateTexts = data.map(item => {
      const foundDatePosition = item.context.indexOf(item.foundText);
      return {
        filename: item.filename,
        textPreDate: item.context.slice(0, foundDatePosition),
        textPostDate: item.context.slice(foundDatePosition + item.foundText.length),
        text: item.foundText,
        originalData: item,
      }
    });
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button {...buttonProps}>
            {props.children}
          </button>
        </TooltipTrigger>
        {(data && dateTexts) ? (
          <TooltipContent className="py-3">
            { dateTexts.map((item, index) => (
              <div key={`file-${index}`}>
                <ul className="grid gap-3 text-xs">
                  <li className="grid gap-0.5">
                    <span className="text-muted-foreground">The Document</span>
                    <span className="font-medium">
                      {item.filename}
                    </span>
                  </li>
                  <li className="grid gap-0.5">
                    <span className="text-muted-foreground">Found Date</span>
                    <div className="font-medium">
                      <span className="font-medium">{item.textPreDate}</span>
                      <span className="font-extrabold">{item.text}</span>
                      <span className="font-medium">{item.textPostDate}</span>
                    </div>
                  </li>
                </ul>
                <Button
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() => { onClick?.(item.originalData); }}
                >
                  View Document
                </Button>
              </div>
            )) }
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  );
}
