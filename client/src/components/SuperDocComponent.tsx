/* Based on the example on the SuperDoc website */
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import '@harbour-enterprises/superdoc/style.css';
import { DateMatchesMarkup } from '@lib/superdoc-matches-markup.js';
import { SuperDoc, type DocumentMode, type User } from '@harbour-enterprises/superdoc';
import type { Editor } from 'node_modules/@harbour-enterprises/superdoc/dist/core';
import type { FilesWithDates } from '@types/found-dates.js';

type Props = {
  documentId: string;
  parsedFiles: FilesWithDates;
  user?: User;
  onReady?: () => void;
};

type SuperDocInstance = SuperDoc & Editor;
    
const SuperDocComponent = forwardRef<SuperDocInstance, Props>(({ documentId, parsedFiles, user, onReady }: Props, ref) => {
  const containerRef = useRef(null);
  const superdocRef = useRef<(SuperDoc & Editor) | null>(null);

  // Expose SuperDoc methods to parent components
  useImperativeHandle(ref, () => ({
    exportDocx: () => superdocRef.current?.exportDocx(),
    setDocumentMode: (mode: DocumentMode) => superdocRef.current.setDocumentMode(mode),
  }));

  useEffect(() => {
    if (containerRef.current && !superdocRef.current) {
      console.log('Initializing SuperDoc with documentId:', documentId);
      superdocRef.current = new SuperDoc({
        selector: '#superdoc-container',
        documentMode: 'viewing',
        documents: parsedFiles.map((fileData, index) => ({
          id: fileData.file.name || `document-${index}`,
          type: 'docx',
          data: fileData.file,
        })),
        user: user,
        editorExtensions: [ DateMatchesMarkup ],
      });
      if (onReady) {
        superdocRef.current.on('ready', onReady);
      }
    }

    return () => {
      if (superdocRef.current) {
        if (onReady) {
          superdocRef.current.off('ready', onReady);
        }
        superdocRef.current = null;
      }
    };
  }, [documentId, parsedFiles, user, onReady]);

  return (
    <div
      id="superdoc-container"
      ref={containerRef}
      style={{ width: '100%', height: '700px' }}></div>
  );
});

export default SuperDocComponent;
