
export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export interface Subject {
  name: string;
  questionCount: number;
}

export interface TestDetails {
  id: string;
  title: keyof typeof import('./translations').translations.en;
  description: keyof typeof import('./translations').translations.en;
  medium: string;
  languageForAI: 'Hindi' | 'English';
  classForAI: string;
  timeLimit: number; // in minutes
  subjects: Subject[];
  totalQuestions: number;
  testType: 'mock' | 'practice';
}

export const testsData: Record<string, TestDetails> = {
  'rms-class-6': {
    id: 'rms-class-6',
    title: 'rmsMockTestClass6',
    description: 'rmsMockTestClass6Desc',
    medium: 'Hindi',
    languageForAI: 'Hindi',
    classForAI: 'Class 6',
    timeLimit: 120,
    subjects: [
      { name: 'math', questionCount: 50 },
      { name: 'reasoning', questionCount: 50 },
      { name: 'gk', questionCount: 50 },
      { name: 'english', questionCount: 25 }, // As per user "qulifly hai 25 प्रश्न"
    ],
    totalQuestions: 175,
    testType: 'mock',
  },
  'rms-class-9': {
    id: 'rms-class-9',
    title: 'rmsMockTestClass9',
    description: 'rmsMockTestClass9Desc',
    medium: 'English',
    languageForAI: 'English',
    classForAI: 'Class 9',
    timeLimit: 150,
    subjects: [
      { name: 'english', questionCount: 50 },
      { name: 'math', questionCount: 50 },
      { name: 'science', questionCount: 50 },
      { name: 'socialStudies', questionCount: 30 },
      { name: 'hindi', questionCount: 20 },
    ],
    totalQuestions: 200,
    testType: 'mock',
  },
  'jnv-class-6': {
    id: 'jnv-class-6',
    title: 'jnvMockTestClass6',
    description: 'jnvMockTestClass6Desc',
    medium: 'Hindi',
    languageForAI: 'Hindi',
    classForAI: 'Class 6',
    timeLimit: 120,
    subjects: [
        { name: 'mentalAbility', questionCount: 40 },
        { name: 'arithmetic', questionCount: 20 },
        { name: 'languageTest', questionCount: 20 },
    ],
    totalQuestions: 80,
    testType: 'mock',
  },
  'math-olympiad-class-6': {
    id: 'math-olympiad-class-6',
    title: 'mathOlympiadClass6',
    description: 'mathOlympiadClass6Desc',
    medium: 'English',
    languageForAI: 'English',
    classForAI: 'Class 6',
    timeLimit: 60,
    subjects: [
        { name: 'math', questionCount: 25 },
    ],
    totalQuestions: 25,
    testType: 'practice',
  }
};
