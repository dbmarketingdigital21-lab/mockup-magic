
import React from 'react';
import type { ImageFile } from '../types';

interface ImageDisplayProps {
  imageFile: ImageFile | null;
  altText: string;
  isLoading: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageFile, altText, isLoading }) => {
  return (
    <div className="aspect-square w-full bg-slate-800/50 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-700">
      {isLoading ? (
         <div className="flex flex-col items-center justify-center text-slate-400">
             <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4">Generating...</p>
         </div>
      ) : imageFile ? (
        <img
          src={`data:${imageFile.mimeType};base64,${imageFile.base64}`}
          alt={altText}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="text-center text-slate-500 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2">Your generated image will appear here</p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
