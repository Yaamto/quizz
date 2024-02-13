import Question from "./question";
import User from "./user";

interface Room {
    id?: string;
    creator: User | null;
    clients?: User[];
    difficulty?: string;
    theme?: string;
    isPrivate?: boolean | null;
    isRandomTheme?: boolean | null;
    nbQuestions?: number;
    quizz?: Question[];
    isStarted: boolean;
  }

  export default Room;