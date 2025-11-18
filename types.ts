
export interface ActivityPrompt {
  id: string;
  title: string;
  content: string; // The actual text of the activity prompt
  timestamp: number; // For sorting and uniqueness
}

export interface GeneratedFeedbackContent {
  feedbackText: string;
  actionableSuggestions: string[];
}

export interface StudentFeedback {
  id: string;
  studentName: string;
  activityTitle: string;
  uc: string; // Unidade Curricular
  grade: number; // 0-10
  activityPromptContent: string; // The prompt content used for this feedback
  generatedFeedback: GeneratedFeedbackContent; // The generated feedback from Gemini
  editedFeedback?: GeneratedFeedbackContent; // Editable version
  timestamp: number;
}
