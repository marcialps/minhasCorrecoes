
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import FeedbackForm from './components/FeedbackForm';
import FeedbackDisplay from './components/FeedbackDisplay';
import HistoryPanel from './components/HistoryPanel';
import { ActivityPrompt, StudentFeedback, GeneratedFeedbackContent } from './types';

function App() {
  const [activities, setActivities] = useState<ActivityPrompt[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<StudentFeedback[]>([]);
  const [currentGeneratedFeedback, setCurrentGeneratedFeedback] = useState<StudentFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on initial mount
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem('activities');
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
      const storedFeedbackHistory = localStorage.getItem('feedbackHistory');
      if (storedFeedbackHistory) {
        setFeedbackHistory(JSON.parse(storedFeedbackHistory));
      }
    } catch (e) {
      console.error("Failed to load from local storage:", e);
      setError("Erro ao carregar dados do armazenamento local.");
    }
  }, []);

  // Save activities to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  // Save feedback history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('feedbackHistory', JSON.stringify(feedbackHistory));
  }, [feedbackHistory]);

  const handleAddActivity = useCallback((activity: ActivityPrompt) => {
    setActivities((prev) => {
      // Check if an activity with the same title and content already exists
      const exists = prev.some(
        (act) => act.title === activity.title && act.content === activity.content,
      );
      if (!exists) {
        return [...prev, activity];
      }
      return prev; // Do not add if already exists
    });
  }, []);

  const handleGenerateFeedback = useCallback((feedback: StudentFeedback) => {
    setCurrentGeneratedFeedback(feedback);
    setFeedbackHistory((prev) => [...prev, feedback]);
    setError(null); // Clear any previous errors
  }, []);

  const handleSaveEditedFeedback = useCallback((editedContent: GeneratedFeedbackContent) => {
    if (currentGeneratedFeedback) {
      // Update the current displayed feedback
      const updatedCurrentFeedback = {
        ...currentGeneratedFeedback,
        editedFeedback: editedContent, // Store the edited version
      };
      setCurrentGeneratedFeedback(updatedCurrentFeedback);

      // Update the feedback in history
      setFeedbackHistory((prevHistory) =>
        prevHistory.map((fb) =>
          fb.id === currentGeneratedFeedback.id ? updatedCurrentFeedback : fb,
        ),
      );
    }
  }, [currentGeneratedFeedback]);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de feedback? Esta ação é irreversível.')) {
      setFeedbackHistory([]);
      setCurrentGeneratedFeedback(null); // Also clear the currently displayed feedback
      setError(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-1 lg:col-span-1">
            <FeedbackForm
              activities={activities}
              onAddActivity={handleAddActivity}
              onGenerateFeedback={handleGenerateFeedback}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setError={setError}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="font-bold">Erro:</p>
                <p>{error}</p>
              </div>
            )}
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <FeedbackDisplay
              generatedFeedback={currentGeneratedFeedback?.editedFeedback || currentGeneratedFeedback?.generatedFeedback || null}
              onSaveEdit={handleSaveEditedFeedback}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <HistoryPanel
              feedbackHistory={feedbackHistory}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 mt-8">
        <p>&copy; {new Date().getFullYear()} Gerador de Feedback Inteligente. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
