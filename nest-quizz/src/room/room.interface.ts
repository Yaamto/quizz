export interface User {
    id: string;
    username?: string;
    avatar?: string;
    point?: number;
  }
  
  export interface UserAnswer {
    user: User;
    answer: string;
    timeStamps: number;
  }
  
  export interface room {
    id: string;
    creator: User;
    clients: User[];
    difficulty: string;
    theme: string;
    isPrivate: boolean;
    nbQuestions: number;
    isRandomTheme: boolean;
    quizz?: Question[];
    isStarted: boolean;
    isQuestionResults: boolean;
  }
  
  export interface Question {
    id: string;
    question: string;
    possibleAnswers: string[];
    answer: string;
    userAnswers?: UserAnswer[];
  }