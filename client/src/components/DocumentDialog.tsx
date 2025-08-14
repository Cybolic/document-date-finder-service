import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import SuperDocComponent from "@components/SuperDocComponent"
import type { SuperDoc } from "@harbour-enterprises/superdoc";
import type { FileWithDates, DateToFileMapping } from "@/types/found-dates";

type Props = {
  parsedFile: FileWithDates;
  dateToFileMapping: DateToFileMapping;
  onReady?: (superdoc: SuperDoc) => void;
  onClose?: () => void;
};

export default function Component({ parsedFile, dateToFileMapping, onReady, onClose }: Props) {
  const handleEditorReady = ({ superdoc }: { superdoc: SuperDoc }) => {
    superdoc.activeEditor.commands.markupText(
      parsedFile.dates,
      dateToFileMapping.dateIndex
    );
    onReady?.(superdoc);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:min-h-[75vh] sm:max-h-[min(640px,90vh)] sm:max-w-4xl [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            {parsedFile.file.name}
          </DialogTitle>
          <div className="overflow-y-auto grow">
            <DialogDescription asChild>
              <div className="px-6 py-4">
                <SuperDocComponent
                  documentId={parsedFile.file.name}
                  parsedFiles={[parsedFile]}
                  // user: {},
                  onReady={handleEditorReady as (() => void)}
                />
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

