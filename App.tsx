
import React, { useState, useCallback, useRef } from 'react';
import type { AppTab, ImageFile } from './types';
import { fileToImageFile } from './utils/fileUtils';
import { generateImage, editImage } from './services/geminiService';
import ImageDisplay from './components/ImageDisplay';
import LoadingOverlay from './components/LoadingOverlay';

// --- Helper Components & Icons (defined outside App to prevent re-creation) ---

const LogoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const GenerateIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-4 py-3 text-sm font-medium rounded-md flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${
      isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
    }`}
  >
    {icon} {label}
  </button>
);


// --- Main App Component ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('generate');
  const [generatePrompt, setGeneratePrompt] = useState<string>("A high-quality photo of a blank white t-shirt on a hanger against a clean, light gray wall.");
  const [editPrompt, setEditPrompt] = useState<string>("Place the uploaded logo on the center of the t-shirt's chest.");
  
  const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
  const [overlayImage, setOverlayImage] = useState<ImageFile | null>(null);
  const [finalImage, setFinalImage] = useState<ImageFile | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!generatePrompt) {
      setError("Please enter a prompt to generate an image.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setLoadingMessage('Generating your mockup...');
    try {
      const imageBase64 = await generateImage(generatePrompt);
      const generatedFile = { base64: imageBase64, mimeType: 'image/png' };
      setBaseImage(generatedFile);
      setFinalImage(generatedFile);
      setOverlayImage(null); // Clear previous logo
      setActiveTab('edit');
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [generatePrompt]);

  const handleEdit = useCallback(async () => {
    if (!baseImage) {
      setError("Please generate or have a base image first.");
      return;
    }
    if (!editPrompt) {
        setError("Please enter an editing prompt.");
        return;
    }
    setError(null);
    setIsLoading(true);
    setLoadingMessage('Applying your edits...');
    try {
      const imageBase64 = await editImage(baseImage, editPrompt, overlayImage ?? undefined);
      setFinalImage({ base64: imageBase64, mimeType: 'image/png' });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [baseImage, editPrompt, overlayImage]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setIsLoading(true);
      setLoadingMessage('Processing logo...');
      try {
        const imageFile = await fileToImageFile(file);
        setOverlayImage(imageFile);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to read file.");
      } finally {
          setIsLoading(false);
      }
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const activeImage = finalImage || baseImage;

  return (
    <>
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
      <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col md:flex-row">
        {/* --- Control Panel --- */}
        <aside className="w-full md:w-96 lg:w-[450px] bg-slate-800 p-6 flex-shrink-0 flex flex-col space-y-6 border-r border-slate-700">
          <header className="flex items-center space-x-3">
            <LogoIcon />
            <h1 className="text-2xl font-bold text-white">Mockup Magic</h1>
          </header>

          <div className="flex bg-slate-800 p-1 rounded-lg space-x-2">
            <TabButton label="Generate" isActive={activeTab === 'generate'} onClick={() => setActiveTab('generate')} icon={<GenerateIcon />} />
            <TabButton label="Edit" isActive={activeTab === 'edit'} onClick={() => setActiveTab('edit')} icon={<EditIcon />} />
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-3" role="alert">{error}</div>}

          {/* --- Generate Tab Content --- */}
          <div className={`${activeTab === 'generate' ? 'flex' : 'hidden'} flex-col space-y-4 flex-grow`}>
            <h2 className="text-lg font-semibold text-white">1. Generate a Mockup</h2>
            <p className="text-sm text-slate-400">Describe the product mockup you want to create. Be specific for best results.</p>
            <textarea
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="e.g., A black cotton t-shirt on a wooden hanger."
              className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                <GenerateIcon />
                Generate Mockup
            </button>
          </div>

          {/* --- Edit Tab Content --- */}
          <div className={`${activeTab === 'edit' ? 'flex' : 'hidden'} flex-col space-y-4 flex-grow`}>
            <h2 className="text-lg font-semibold text-white">2. Edit Your Mockup</h2>
            <p className="text-sm text-slate-400">Upload a logo or just use text to modify your generated mockup.</p>
            
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Upload Logo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
              <button onClick={triggerFileSelect} className="w-full flex items-center justify-center text-sm p-3 bg-slate-700 border-2 border-dashed border-slate-600 rounded-md hover:border-indigo-500 hover:text-indigo-400 transition-colors">
                <UploadIcon />
                {overlayImage ? 'Change Logo' : 'Select a logo file...'}
              </button>
              {overlayImage && (
                <div className="mt-3 bg-slate-700/50 p-2 rounded-md flex items-center space-x-3">
                    <img src={`data:${overlayImage.mimeType};base64,${overlayImage.base64}`} alt="Logo preview" className="w-12 h-12 object-contain rounded-md bg-white/10"/>
                    <p className="text-sm text-slate-300">Logo loaded.</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="edit-prompt" className="text-sm font-medium text-slate-300 mb-2 block">Editing Instructions</label>
              <textarea
                id="edit-prompt"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, or place the logo on the sleeve."
                className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
                onClick={handleEdit}
                disabled={isLoading || !baseImage}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                <EditIcon />
                Apply Edits
            </button>
          </div>
        </aside>

        {/* --- Image Display Area --- */}
        <main className="flex-1 p-6 lg:p-10 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <ImageDisplay imageFile={activeImage} altText="Generated mockup" isLoading={false} />
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
