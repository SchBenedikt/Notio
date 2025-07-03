
"use client";

import { useState, useEffect } from 'react';
import { StudySet, QuizQuestion } from '@/lib/types';
import { generateStudySetQuiz } from '@/ai/flows/study-set-quiz-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, BrainCircuit, RefreshCw } from 'lucide-react';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type StudySetQuizViewProps = {
  studySet: StudySet;
  googleAiApiKey: string;
};

export function StudySetQuizView({ studySet, googleAiApiKey }: StudySetQuizViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [key, setKey] = useState(Date.now()); // Used to force a re-render and re-fetch

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      setIsFinished(false);
      setCurrentQuestionIndex(0);
      setScore(0);

      try {
        const response = await generateStudySetQuiz({
          title: studySet.title,
          description: studySet.description,
          cards: studySet.cards,
          apiKey: googleAiApiKey,
        });
        setQuestions(response.questions);
      } catch (err) {
        console.error("Failed to generate quiz:", err);
        setError("Das KI-Quiz konnte nicht erstellt werden. Bitte versuche es später erneut.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [studySet, key, googleAiApiKey]);
  
  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
      setKey(Date.now()); // This will trigger the useEffect to re-fetch the quiz
  }

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Dein persönliches Quiz wird erstellt...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (isFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
          <Card className="w-full max-w-2xl mx-auto text-center">
              <CardHeader>
                  <CardTitle className="text-2xl">Quiz beendet!</CardTitle>
                  <CardDescription>Hier ist dein Ergebnis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-2">
                       <p className="text-5xl font-bold text-primary">{percentage}%</p>
                       <p className="text-muted-foreground">Du hast {score} von {questions.length} Fragen richtig beantwortet.</p>
                  </div>
                   <Progress value={percentage} className="h-2" />
              </CardContent>
              <CardFooter>
                  <Button onClick={restartQuiz} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Neues Quiz generieren
                  </Button>
              </CardFooter>
          </Card>
      )
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" /> KI-Quiz
            </CardTitle>
            <div className="text-sm text-muted-foreground">Frage {currentQuestionIndex + 1} / {questions.length}</div>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold text-center min-h-[56px] flex items-center justify-center">{currentQuestion.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => {
             const isCorrect = option === currentQuestion.correctAnswer;
             const isSelected = option === selectedAnswer;

             return (
                <Button
                key={index}
                variant="outline"
                className={cn(
                    "h-auto justify-start text-left whitespace-normal py-3",
                    isAnswered && isCorrect && "bg-green-100 border-green-400 text-green-900 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300",
                    isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-400 text-red-900 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300"
                )}
                onClick={() => handleAnswerSelect(option)}
                disabled={isAnswered}
                >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}</span>
                    <span className="flex-1">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle className="h-5 w-5" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5" />}
                </Button>
             )
          })}
        </div>
        {isAnswered && (
            <Alert className={cn(selectedAnswer === currentQuestion.correctAnswer ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/50")}>
                <AlertTitle className="flex items-center gap-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                     {selectedAnswer === currentQuestion.correctAnswer ? "Richtig!" : "Falsch"}
                </AlertTitle>
                <AlertDescription>
                    {currentQuestion.explanation}
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNextQuestion} className="w-full" disabled={!isAnswered}>
            {currentQuestionIndex < questions.length - 1 ? "Nächste Frage" : "Quiz beenden"}
        </Button>
      </CardFooter>
    </Card>
  );
}
