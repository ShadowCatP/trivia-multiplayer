export type QuestionType = 'multiple-choice' | 'true-false';

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: number; // index of correct answer
};

export type MultipleChoiceQuestion = Question & {
  type: 'multiple-choice';
  answers: string[];
};

export type TrueFalseQuestion = Question & {
  type: 'true-false';
  answers: ['True', 'False'];
};

export type ValidQuestion = MultipleChoiceQuestion | TrueFalseQuestion;

export type QuestionPayload = {
  question: ValidQuestion;
  questionTimeLimit: number;
  serverTimestamp: number;
};

export type AnswerResultPayload = {
  correctAnswerIndex: number;
};
