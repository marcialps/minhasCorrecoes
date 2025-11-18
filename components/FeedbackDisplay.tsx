import React, { useState, useEffect } from 'react';
import Button from './Button';
import { GeneratedFeedbackContent } from '../types';

interface FeedbackDisplayProps {
  generatedFeedback: GeneratedFeedbackContent | null;
  onSaveEdit: (editedContent: GeneratedFeedbackContent) => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  generatedFeedback,
  onSaveEdit,
}) => {
  const [editableFeedback, setEditableFeedback] = useState<GeneratedFeedbackContent | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    setEditableFeedback(generatedFeedback);
  }, [generatedFeedback]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editableFeedback) {
      setEditableFeedback({ ...editableFeedback, feedbackText: e.target.value });
    }
  };

  const handleSuggestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableFeedback) {
      const newSuggestions = [...editableFeedback.actionableSuggestions];
      newSuggestions[index] = e.target.value;
      setEditableFeedback({ ...editableFeedback, actionableSuggestions: newSuggestions });
    }
  };

  const handleAddSuggestion = () => {
    if (editableFeedback) {
      setEditableFeedback({
        ...editableFeedback,
        actionableSuggestions: [...editableFeedback.actionableSuggestions, ''],
      });
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    if (editableFeedback) {
      const newSuggestions = editableFeedback.actionableSuggestions.filter((_, i) => i !== index);
      setEditableFeedback({ ...editableFeedback, actionableSuggestions: newSuggestions });
    }
  };

  const handleSave = () => {
    if (editableFeedback) {
      onSaveEdit(editableFeedback);
    }
  };

  const handleCopy = () => {
    if (editableFeedback) {
      const feedbackString = `${editableFeedback.feedbackText}\n\nSugestões:\n${editableFeedback.actionableSuggestions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`;
      navigator.clipboard.writeText(feedbackString);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  if (!generatedFeedback) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 text-center text-gray-400">
        Nenhum feedback gerado ainda. Preencha o formulário para começar!
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-blue-700">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">Feedback Gerado</h2>
      <div className="mb-6">
        <label htmlFor="feedback-text" className="block text-lg font-semibold text-gray-200 mb-2">
          Mensagem Principal:
        </label>
        <textarea
          id="feedback-text"
          className="w-full p-3 border border-gray-600 rounded-lg focus:ring-blue-400 focus:border-blue-400 resize-y min-h-[150px] bg-gray-700 text-gray-100"
          value={editableFeedback?.feedbackText || ''}
          onChange={handleTextChange}
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-200 mb-2">
          Sugestões Acionáveis:
        </label>
        {editableFeedback?.actionableSuggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              className="flex-grow p-2 border border-gray-600 rounded-lg focus:ring-blue-400 focus:border-blue-400 bg-gray-700 text-gray-100"
              value={suggestion}
              onChange={(e) => handleSuggestionChange(index, e)}
            />
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleRemoveSuggestion(index)}
              className="ml-2 px-3 py-1"
            >
              Remover
            </Button>
          </div>
        ))}
        <Button onClick={handleAddSuggestion} variant="secondary" className="mt-2" size="sm">
          Adicionar Sugestão
        </Button>
      </div>

      <div className="flex justify-end space-x-4 sticky bottom-0 bg-gray-800 pt-4 pb-2 -mx-6 px-6 border-t border-gray-700">
        <Button onClick={handleSave} variant="primary">
          Salvar Edições
        </Button>
        <Button onClick={handleCopy} variant="secondary">
          {copyStatus === 'copied' ? 'Copiado!' : 'Copiar Feedback'}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackDisplay;