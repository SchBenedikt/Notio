
"use client";

import { useState, useEffect, useRef } from 'react';
import { StudySet, TestQuestion } from '@/lib/types';
import { generateStudySetTest } from '@/ai/flows/study-set-test-flow';
import { evaluateAnswer } from '@/ai/flows/evaluate-answer-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, FileQuestion, RefreshCw, Lightbulb, Trophy } from 'lucide-react';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

type StudySetTestViewProps = {
  studySet: StudySet;
  googleAiApiKey: string;
};

type AnswerStatus = 'unanswered' | 'checking' | 'correct' | 'incorrect';

export function StudySetTestView({ studySet, googleAiApiKey }: StudySetTestViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [answerStatuses, setAnswerStatuses] = useState<Record<number, AnswerStatus>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [key, setKey] = useState(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError(null);
      setIsFinished(false);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setAnswerStatuses({});

      try {
        const response = await generateStudySetTest({
          title: studySet.title,
          description: studySet.description,
          cards: studySet.cards,
          apiKey: googleAiApiKey,
        });
        setQuestions(response.questions);
      } catch (err) {
        console.error("Failed to generate test:", err);
        setError("Der KI-Test konnte nicht erstellt werden. Bitte versuche es später erneut.");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [studySet, key, googleAiApiKey]);
  
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerChange = (answer: string) => {
    setUserAnswers(prev => ({...prev, [currentQuestionIndex]: answer}));
  };

  const checkWrittenAnswer = async (answer: string, correctAnswer: string, definition: string) => {
    const result = await evaluateAnswer({
      userAnswer: answer,
      correctTerm: correctAnswer,
      definition: definition,
      apiKey: googleAiApiKey,
    });
    return result.isCorrect;
  };

  const handleConfirmAnswer = async () => {
    const userAnswer = userAnswers[currentQuestionIndex];
    if (!userAnswer) return;

    setAnswerStatuses(prev => ({...prev, [currentQuestionIndex]: 'checking'}));
    let isCorrect = false;

    if (currentQuestion.type === 'written') {
      isCorrect = await checkWrittenAnswer(userAnswer, currentQuestion.correctAnswer, currentQuestion.question);
    } else {
      isCorrect = userAnswer === currentQuestion.correctAnswer;
    }

    setAnswerStatuses(prev => ({...prev, [currentQuestionIndex]: isCorrect ? 'correct' : 'incorrect'}));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };
  
  const restartTest = () => {
      setKey(Date.now());
  };
  
  const renderQuestion = () => {
    const status = answerStatuses[currentQuestionIndex] || 'unanswered';
    const isAnswered = status === 'correct' || status === 'incorrect';
    const userAnswer = userAnswers[currentQuestionIndex];

    switch(currentQuestion.type) {
        case 'multiple-choice':
            return (
                <RadioGroup onValueChange={handleAnswerChange} value={userAnswer} disabled={isAnswered} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => {
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const isSelected = option === userAnswer;
                        return (
                            <Label key={index} className={cn(
                                "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                                isAnswered && isCorrect && "bg-green-100 border-green-400 dark:bg-green-900/50 dark:border-green-700",
                                isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-400 dark:bg-red-900/50 dark:border-red-700",
                                !isAnswered && "hover:bg-muted/50"
                            )}>
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <span>{option}</span>
                            </Label>
                        )
                    })}
                </RadioGroup>
            )
        case 'written':
            return (
                 <Input
                    ref={inputRef}
                    placeholder="Tippe den Begriff..."
                    value={userAnswer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    disabled={isAnswered}
                    className={cn(
                        "h-12 text-base",
                        isAnswered && status === 'correct' && "border-green-500 focus-visible:ring-green-500",
                        isAnswered && status === 'incorrect' && "border-red-500 focus-visible:ring-red-500"
                    )}
                />
            )
        case 'true-false':
            return (
                <RadioGroup onValueChange={handleAnswerChange} value={userAnswer} disabled={isAnswered} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Wahr', 'Falsch'].map((option, index) => {
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const isSelected = option === userAnswer;
                        return (
                             <Label key={index} className={cn(
                                "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all text-lg justify-center",
                                isAnswered && isCorrect && "bg-green-100 border-green-400 dark:bg-green-900/50 dark:border-green-700",
                                isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-400 dark:bg-red-900/50 dark:border-red-700",
                                !isAnswered && "hover:bg-muted/50"
                            )}>
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <span>{option}</span>
                            </Label>
                        )
                    })}
                </RadioGroup>
            )
        default:
            return null;
    }
  }
  
  const score = Object.values(answerStatuses).filter(s => s === 'correct').length;
  
  if (loading) {
    return <Card className="flex flex-col items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary mb-4" /><p className="text-muted-foreground">Dein persönlicher Test wird erstellt...</p></Card>;
  }

  if (error) {
    return <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Fehler</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }

  if (isFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      return (
          <Card className="w-full max-w-2xl mx-auto text-center">
              <CardHeader><div className="flex justify-center mb-4"><Trophy className="h-12 w-12 text-yellow-500" /></div><CardTitle className="text-2xl">Test beendet!</CardTitle><CardDescription>Hier ist dein Ergebnis.</CardDescription></CardHeader>
              <CardContent className="space-y-4"><div className="flex flex-col items-center gap-2"><p className="text-5xl font-bold text-primary">{percentage}%</p><p className="text-muted-foreground">Du hast {score} von {questions.length} Fragen richtig beantwortet.</p></div><Progress value={percentage} className="h-2" /></CardContent>
              <CardFooter><Button onClick={restartTest} className="w-full"><RefreshCw className="mr-2 h-4 w-4" />Neuen Test generieren</Button></CardFooter>
          </Card>
      )
  }
  
  if(questions.length === 0) return null;
  
  const isAnswered = answerStatuses[currentQuestionIndex] === 'correct' || answerStatuses[currentQuestionIndex] === 'incorrect';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <CardTitle className="flex items-center gap-2"><FileQuestion className="h-5 w-5 text-primary" /> KI-Test</CardTitle>
            <div className="text-sm text-muted-foreground">Frage {currentQuestionIndex + 1} / {questions.length}</div>
        </div>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold text-center min-h-[56px] flex items-center justify-center">
            {currentQuestion.type === 'true-false' ? currentQuestion.statement : currentQuestion.question}
        </p>
        <div className="space-y-4">
            {renderQuestion()}
        </div>
        {isAnswered && (
            <Alert className={cn("animate-fade-in-down", answerStatuses[currentQuestionIndex] === 'correct' ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/50")}>
                <AlertTitle className="flex items-center gap-2">
                    {answerStatuses[currentQuestionIndex] === 'correct' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                     {answerStatuses[currentQuestionIndex] === 'correct' ? "Richtig!" : "Falsch"}
                </AlertTitle>
                <AlertDescription>{currentQuestion.explanation}</AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
         {isAnswered ? (
             <Button onClick={handleNext} className="w-full">
                {currentQuestionIndex < questions.length - 1 ? "Nächste Frage" : "Test beenden"}
            </Button>
         ) : (
            <Button onClick={handleConfirmAnswer} className="w-full" disabled={!userAnswers[currentQuestionIndex] || answerStatuses[currentQuestionIndex] === 'checking'}>
                {answerStatuses[currentQuestionIndex] === 'checking' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Antwort bestätigen
            </Button>
         )}
      </CardFooter>
    </Card>
  );
}
