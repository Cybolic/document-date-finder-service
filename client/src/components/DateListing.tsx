import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import type { DateToFileMappings } from "@/types/found-dates";

type Props = {
  datesToFiles: DateToFileMappings;
  onClick: (date: string) => void;
};

export default function Component({ datesToFiles, onClick }: Props) {
  const [datesSorted, setDatesSorted] = useState<string[]>([]);

  useEffect(() => {
    setDatesSorted(Object.keys(datesToFiles)
      .map(date => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime())
      .map(date => date.toISOString().split('T')[0])
    );
  }, [datesToFiles]);

  return (
    <div className="max-h-[23.5em] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datesSorted.map((date, index) => (
            <TableRow
              key={`${index}-${date}`}
              className="has-data-[state=checked]:bg-muted/50 text-right cursor-pointer"
              onClick={() => onClick?.(date)}
            >
              <TableCell className="font-medium">{date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={2} className="text-center">
              {datesSorted.length} date{datesSorted.length === 1 ? '' : 's'} found
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

