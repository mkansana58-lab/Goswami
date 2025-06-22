
export type TestType = "sainik_school" | "rms" | "jnv" | "subject_wise";

export interface SubjectConfig {
  key: string;
  nameKey: string;
  questions: number;
  marksPerQuestion?: number;
  totalMarks: number;
}

export interface TestConfig {
  [className: string]: SubjectConfig[];
}

export const testConfigs: Record<TestType, TestConfig> = {
  sainik_school: {
    'Class 6': [
      { key: 'Language', nameKey: 'subjectLanguage', questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'Mathematics', nameKey: 'subjectMathematics', questions: 50, marksPerQuestion: 3, totalMarks: 150 },
      { key: 'Intelligence', nameKey: 'subjectReasoning', questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', questions: 25, marksPerQuestion: 2, totalMarks: 50 },
    ],
    'Class 9': [
      { key: 'Mathematics', nameKey: 'subjectMathematics', questions: 50, marksPerQuestion: 4, totalMarks: 200 },
      { key: 'Intelligence', nameKey: 'subjectReasoning', questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'English', nameKey: 'subjectEnglish', questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'General Science', nameKey: 'subjectGeneralScience', questions: 25, marksPerQuestion: 2, totalMarks: 50 },
      { key: 'Social Studies', nameKey: 'subjectSocialStudies', questions: 25, marksPerQuestion: 2, totalMarks: 50 },
    ],
  },
   rms: {
    'Class 6': [
        { key: 'English', nameKey: 'subjectEnglish', questions: 50, totalMarks: 50 },
        { key: 'Intelligence', nameKey: 'subjectReasoning', questions: 50, totalMarks: 50 },
        { key: 'Mathematics', nameKey: 'subjectMathematics', questions: 50, totalMarks: 50 },
        { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', questions: 50, totalMarks: 50 },
    ],
    'Class 9': [
        { key: 'Paper-I English', nameKey: 'subjectEnglish', questions: 100, totalMarks: 100 },
        { key: 'Paper-II Hindi & Social Science', nameKey: 'subjectSocialStudies', questions: 100, totalMarks: 100 },
        { key: 'Paper-III Maths & Science', nameKey: 'subjectGeneralScience', questions: 100, totalMarks: 100 },
    ],
  },
  jnv: {
    'Class 6': [
      { key: 'Mental Ability', nameKey: 'subjectMentalAbility', questions: 40, marksPerQuestion: 1.25, totalMarks: 50 },
      { key: 'Arithmetic', nameKey: 'subjectArithmetic', questions: 20, marksPerQuestion: 1.25, totalMarks: 25 },
      { key: 'Language', nameKey: 'subjectLanguage', questions: 20, marksPerQuestion: 1.25, totalMarks: 25 },
    ],
    'Class 9': [
      { key: 'English', nameKey: 'subjectEnglish', questions: 15, marksPerQuestion: 1, totalMarks: 15 },
      { key: 'Hindi', nameKey: 'subjectHindi', questions: 15, marksPerQuestion: 1, totalMarks: 15 },
      { key: 'Mathematics', nameKey: 'subjectMathematics', questions: 35, marksPerQuestion: 1, totalMarks: 35 },
      { key: 'General Science', nameKey: 'subjectGeneralScience', questions: 35, marksPerQuestion: 1, totalMarks: 35 },
    ],
  },
  subject_wise: {
      'All': [
          { key: 'Mathematics', nameKey: 'subjectMathematics', questions: 25, marksPerQuestion: 1, totalMarks: 25 },
          { key: 'General Knowledge', nameKey: 'subjectGeneralKnowledge', questions: 25, marksPerQuestion: 1, totalMarks: 25 },
          { key: 'Reasoning', nameKey: 'subjectReasoning', questions: 25, marksPerQuestion: 1, totalMarks: 25 },
          { key: 'Hindi', nameKey: 'subjectHindi', questions: 25, marksPerQuestion: 1, totalMarks: 25 },
          { key: 'English', nameKey: 'subjectEnglish', questions: 25, marksPerQuestion: 1, totalMarks: 25 },
          { key: 'Science', nameKey: 'subjectGeneralScience', questions: 25, marksPerQuestion: 1, totalMarks: 25 },
          { key: 'Social Studies', nameKey: 'subjectSocialStudies', questions: 25, marksPerQuestion: 1, totalMarks: 25},
          { key: 'Mental Ability', nameKey: 'subjectMentalAbility', questions: 25, marksPerQuestion: 1, totalMarks: 25},
          { key: 'Arithmetic', nameKey: 'subjectArithmetic', questions: 25, marksPerQuestion: 1, totalMarks: 25},
          { key: 'Language', nameKey: 'subjectLanguage', questions: 25, marksPerQuestion: 1, totalMarks: 25},
      ]
  }
};
