
export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}

export interface Subject {
  name: string;
  questions: Question[];
  questionCount: number;
}

export interface TestDetails {
  id: string;
  title: keyof typeof import('./translations').translations.en;
  description: keyof typeof import('./translations').translations.en;
  medium: string;
  timeLimit: number; // in minutes
  subjects: Subject[];
  totalQuestions: number;
}

const generatePlaceholderQuestions = (subject: string, count: number, test: string): Question[] => {
  const questions: Question[] = [];
  for (let i = 1; i <= count; i++) {
    const options = [
        `विकल्प A प्रश्न ${i}`, 
        `विकल्प B प्रश्न ${i}`, 
        `विकल्प C प्रश्न ${i}`, 
        `विकल्प D प्रश्न ${i}`
    ];
    questions.push({
      id: i,
      question: `${test} के लिए ${subject} का प्रश्न ${i}। सही विकल्प क्या है?`,
      options: options,
      answer: options[0], // For simplicity, answer is always A
    });
  }
  return questions;
};

export const testsData: Record<string, TestDetails> = {
  'class-6': {
    id: 'class-6',
    title: 'rmsMockTestClass6',
    description: 'rmsMockTestClass6Desc',
    medium: 'Hindi',
    timeLimit: 120,
    subjects: [
      { name: 'math', questionCount: 50, questions: generatePlaceholderQuestions('गणित', 50, 'कक्षा 6') },
      { name: 'reasoning', questionCount: 50, questions: generatePlaceholderQuestions('रीजनिंग', 50, 'कक्षा 6') },
      { name: 'gk', questionCount: 50, questions: generatePlaceholderQuestions('सामान्य ज्ञान', 50, 'कक्षा 6') },
      { name: 'english', questionCount: 50, questions: generatePlaceholderQuestions('अंग्रेजी', 50, 'कक्षा 6') },
    ],
    totalQuestions: 200,
  },
  'class-9': {
    id: 'class-9',
    title: 'rmsMockTestClass9',
    description: 'rmsMockTestClass9Desc',
    medium: 'English',
    timeLimit: 150,
    subjects: [
      { name: 'english', questionCount: 50, questions: generatePlaceholderQuestions('English', 50, 'Class 9') },
      { name: 'math', questionCount: 50, questions: generatePlaceholderQuestions('Math', 50, 'Class 9') },
      { name: 'science', questionCount: 50, questions: generatePlaceholderQuestions('Science', 50, 'Class 9') },
      { name: 'socialStudies', questionCount: 30, questions: generatePlaceholderQuestions('Social Studies', 30, 'Class 9') },
      { name: 'hindi', questionCount: 20, questions: generatePlaceholderQuestions('Hindi', 20, 'Class 9') },
    ],
    totalQuestions: 200,
  },
};
