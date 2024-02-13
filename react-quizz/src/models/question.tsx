import UserAnswer from "./userAnwser";

interface Question {
  id:string
  question: string;
  possibleAnswers: string[];
  answer: string;
  userAnswers?: UserAnswer[];
}

export default Question;