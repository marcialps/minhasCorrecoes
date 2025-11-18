import React, { useState } from 'react';
import Button from './Button';

interface FileUploadProps {
  onFileRead: (content: string) => void;
  isLoading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileRead, isLoading }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError(null);

      // Basic check for file type
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileRead(content);
        };
        reader.onerror = () => {
          setError('Erro ao ler o arquivo.');
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setError('A leitura de arquivos PDF/DOCX não é suportada diretamente neste aplicativo. Por favor, cole o texto manualmente ou use um arquivo .txt.');
        onFileRead(''); // Clear content if unsupported file type
      } else {
        setError('Formato de arquivo não suportado. Por favor, use um arquivo .txt ou cole o texto diretamente.');
        onFileRead(''); // Clear content if unsupported file type
      }
    } else {
      setFileName(null);
      onFileRead('');
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">
        Anexar arquivo com enunciado (somente .txt)
      </label>
      <div className="flex items-center space-x-2">
        <input
          id="file-upload"
          type="file"
          accept=".txt, .pdf, .docx" // Allow these for input, but warn for PDF/DOCX
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 transition-colors duration-200 text-sm"
        >
          {fileName ? 'Trocar arquivo' : 'Escolher arquivo'}
        </label>
        {fileName && <span className="text-gray-300 text-sm">{fileName}</span>}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default FileUpload;