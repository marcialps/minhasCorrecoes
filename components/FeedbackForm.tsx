import React, { useState, useEffect } from 'react';
import TextInput from './TextInput';
import Select from './Select';
import Button from './Button';
import FileUpload from './FileUpload';
import LoadingSpinner from './LoadingSpinner';
import { ActivityPrompt, GeneratedFeedbackContent, StudentFeedback } from '../types';
import { generateFeedback } from '../services/geminiService';

interface FeedbackFormProps {
  activities: ActivityPrompt[];
  onAddActivity: (activity: ActivityPrompt) => void;
  onGenerateFeedback: (feedback: StudentFeedback) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  activities,
  onAddActivity,
  onGenerateFeedback,
  isLoading,
  setIsLoading,
  setError,
}) => {
  const [studentName, setStudentName] = useState<string>('');
  const [uc, setUc] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [newActivityTitle, setNewActivityTitle] = useState<string>('');
  const [newActivityContent, setNewActivityContent] = useState<string>('');
  const [activityInputMethod, setActivityInputMethod] = useState<'select' | 'newText' | 'newFile'>('newText'); // 'select', 'newText', 'newFile'


  // Update newActivityContent when a file is read
  const handleFileRead = (content: string) => {
    setNewActivityContent(content);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
      setError('A nota deve ser um número entre 0 e 10.');
      return;
    }

    let currentActivityTitle = newActivityTitle;
    let currentActivityContent = newActivityContent;

    if (activityInputMethod === 'select' && selectedActivityId) {
      const selectedActivity = activities.find(act => act.id === selectedActivityId);
      if (selectedActivity) {
        currentActivityTitle = selectedActivity.title;
        currentActivityContent = selectedActivity.content;
      }
    }

    if (!studentName || !currentActivityTitle || !uc || !currentActivityContent) {
      setError('Por favor, preencha todos os campos obrigatórios (Nome do Aluno, Título da Atividade, UC e Enunciado da Atividade).');
      return;
    }

    setIsLoading(true);
    try {
      // Add new activity if it's not already in the list
      const isNewActivity = !activities.some(act => act.title === currentActivityTitle && act.content === currentActivityContent);
      let activityIdToUse = selectedActivityId;

      if (activityInputMethod !== 'select' || isNewActivity) { // If it's a new text/file or a selected activity that's been modified.
        const newActivity: ActivityPrompt = {
          id: `activity-${Date.now()}`,
          title: currentActivityTitle,
          content: currentActivityContent,
          timestamp: Date.now(),
        };
        onAddActivity(newActivity);
        activityIdToUse = newActivity.id; // Use the new ID for the current feedback entry
      }

      const generatedContent: GeneratedFeedbackContent = await generateFeedback(
        studentName,
        currentActivityTitle,
        uc,
        numericGrade,
        currentActivityContent,
      );

      const newFeedback: StudentFeedback = {
        id: `feedback-${Date.now()}`,
        studentName,
        activityTitle: currentActivityTitle,
        uc,
        grade: numericGrade,
        activityPromptContent: currentActivityContent,
        generatedFeedback: generatedContent,
        timestamp: Date.now(),
      };
      onGenerateFeedback(newFeedback);
      // Clear form after successful generation
      setStudentName('');
      setUc('');
      setGrade('');
      setNewActivityTitle('');
      setNewActivityContent('');
      setSelectedActivityId('');
      setActivityInputMethod('newText'); // Reset to default input method
    } catch (error: any) {
      console.error('Error generating feedback:', error);
      setError(error.message || 'Ocorreu um erro ao gerar o feedback. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const activityOptions = activities.map(act => ({ value: act.id, label: act.title }));

  // Effect to update newActivityTitle and newActivityContent when an activity is selected
  useEffect(() => {
    if (activityInputMethod === 'select' && selectedActivityId) {
      const selectedActivity = activities.find(act => act.id === selectedActivityId);
      if (selectedActivity) {
        setNewActivityTitle(selectedActivity.title);
        setNewActivityContent(selectedActivity.content);
      }
    } else if (activityInputMethod !== 'select') {
      // Clear content if switching away from 'select'
      setNewActivityTitle('');
      setNewActivityContent('');
    }
  }, [selectedActivityId, activityInputMethod, activities]);


  return (
    <form onSubmit={handleGenerate} className="bg-gray-800 p-6 rounded-lg shadow-xl border border-blue-700">
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Informações da Atividade e Aluno</h2>

      <TextInput
        id="studentName"
        label="Nome do Aluno"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        required
        disabled={isLoading}
      />
      <TextInput
        id="uc"
        label="Unidade Curricular (UC)"
        value={uc}
        onChange={(e) => setUc(e.target.value)}
        required
        disabled={isLoading}
      />
      <TextInput
        id="grade"
        label="Nota (0-10)"
        type="number"
        step="0.1"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        required
        disabled={isLoading}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Enunciado da Atividade
        </label>
        <div className="flex space-x-2 mb-2">
          <Button
            type="button"
            variant={activityInputMethod === 'newText' ? 'primary' : 'secondary'}
            onClick={() => setActivityInputMethod('newText')}
            size="sm"
            disabled={isLoading}
          >
            Novo Texto
          </Button>
          <Button
            type="button"
            variant={activityInputMethod === 'newFile' ? 'primary' : 'secondary'}
            onClick={() => setActivityInputMethod('newFile')}
            size="sm"
            disabled={isLoading}
          >
            Anexar Arquivo
          </Button>
          {activities.length > 0 && (
            <Button
              type="button"
              variant={activityInputMethod === 'select' ? 'primary' : 'secondary'}
              onClick={() => setActivityInputMethod('select')}
              size="sm"
              disabled={isLoading}
            >
              Usar Existente
            </Button>
          )}
        </div>

        {activityInputMethod === 'newText' && (
          <>
            <TextInput
              id="newActivityTitle"
              label="Título da Atividade"
              value={newActivityTitle}
              onChange={(e) => setNewActivityTitle(e.target.value)}
              required
              disabled={isLoading}
              className="mt-2"
            />
            <TextInput
              id="newActivityContent"
              label="Conteúdo do Enunciado"
              textarea
              rows={6}
              value={newActivityContent}
              onChange={(e) => setNewActivityContent(e.target.value)}
              required
              disabled={isLoading}
            />
          </>
        )}

        {activityInputMethod === 'newFile' && (
          <>
            <TextInput
              id="newActivityTitle"
              label="Título da Atividade"
              value={newActivityTitle}
              onChange={(e) => setNewActivityTitle(e.target.value)}
              required
              disabled={isLoading}
              className="mt-2"
            />
            <FileUpload onFileRead={handleFileRead} isLoading={isLoading} />
            {newActivityContent && <p className="text-sm text-gray-300 mb-2">Conteúdo do arquivo carregado (pré-visualização limitada para .txt): <span className="italic">{newActivityContent.substring(0, 100)}...</span></p>}
          </>
        )}

        {activityInputMethod === 'select' && activities.length > 0 && (
          <Select
            id="selectedActivity"
            label="Selecionar Atividade Existente"
            options={[
              { value: '', label: '--- Selecione uma atividade ---' },
              ...activityOptions,
            ]}
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            required
            disabled={isLoading}
          />
        )}
      </div>

      <Button type="submit" fullWidth disabled={isLoading} className="mt-6">
        {isLoading ? <LoadingSpinner /> : 'Gerar Feedback'}
      </Button>
    </form>
  );
};

export default FeedbackForm;