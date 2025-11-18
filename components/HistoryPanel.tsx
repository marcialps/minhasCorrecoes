import React, { useState } from 'react';
import { StudentFeedback, GeneratedFeedbackContent } from '../types';
import Button from './Button';
import Modal from './Modal'; // Assuming a Modal component for detailed view

interface HistoryPanelProps {
  feedbackHistory: StudentFeedback[];
  onClearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ feedbackHistory, onClearHistory }) => {
  const [selectedFeedback, setSelectedFeedback] = useState<StudentFeedback | null>(null);

  const viewFeedbackDetails = (feedback: StudentFeedback) => {
    setSelectedFeedback(feedback);
  };

  const closeModal = () => {
    setSelectedFeedback(null);
  };

  if (feedbackHistory.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center text-gray-400 border border-gray-700">
        Nenhum histórico de feedback ainda.
      </div>
    );
  }

  const generateFeedbackTextForCopy = (feedbackContent: GeneratedFeedbackContent): string => {
    const mainText = feedbackContent.feedbackText;
    const suggestions = feedbackContent.actionableSuggestions
      .map((s, idx) => `${idx + 1}. ${s}`)
      .join('\n');
    return `${mainText}\n\nSugestões:\n${suggestions}`;
  };

  const handleCopyFromHistory = (feedback: StudentFeedback) => {
    const contentToCopy = feedback.editedFeedback || feedback.generatedFeedback;
    navigator.clipboard.writeText(generateFeedbackTextForCopy(contentToCopy));
  };


  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-blue-700">
      <h2 className="text-2xl font-bold text-blue-400 mb-4 flex justify-between items-center">
        Histórico de Feedbacks
        <Button variant="danger" size="sm" onClick={onClearHistory}>
          Limpar Histórico
        </Button>
      </h2>
      <ul className="divide-y divide-gray-700">
        {[...feedbackHistory].sort((a, b) => b.timestamp - a.timestamp).map((feedback) => (
          <li key={feedback.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-2 sm:mb-0">
              <p className="text-lg font-semibold text-gray-100">
                {feedback.studentName} - <span className="text-blue-400">{feedback.activityTitle}</span>
              </p>
              <p className="text-sm text-gray-400">
                UC: {feedback.uc} | Nota: {feedback.grade} |{' '}
                {new Date(feedback.timestamp).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" onClick={() => viewFeedbackDetails(feedback)}>
                Ver Detalhes
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleCopyFromHistory(feedback)}>
                Copiar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {selectedFeedback && (
        <Modal isOpen={!!selectedFeedback} onClose={closeModal} title="Detalhes do Feedback">
          <p className="mb-2"><span className="font-semibold text-gray-200">Aluno:</span> {selectedFeedback.studentName}</p>
          <p className="mb-2"><span className="font-semibold text-gray-200">Atividade:</span> {selectedFeedback.activityTitle}</p>
          <p className="mb-2"><span className="font-semibold text-gray-200">UC:</span> {selectedFeedback.uc}</p>
          <p className="mb-2"><span className="font-semibold text-gray-200">Nota:</span> {selectedFeedback.grade}</p>
          <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <p className="font-semibold text-lg mb-2 text-blue-400">Mensagem Principal:</p>
            <p className="whitespace-pre-wrap text-gray-100">
              {selectedFeedback.editedFeedback?.feedbackText || selectedFeedback.generatedFeedback.feedbackText}
            </p>
            <p className="font-semibold text-lg mt-4 mb-2 text-blue-400">Sugestões:</p>
            <ul className="list-disc list-inside text-gray-100">
              {(selectedFeedback.editedFeedback?.actionableSuggestions || selectedFeedback.generatedFeedback.actionableSuggestions).map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={closeModal}>
              Fechar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HistoryPanel;