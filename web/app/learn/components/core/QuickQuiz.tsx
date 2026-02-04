'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuickQuizProps {
  title?: string;
  questions: QuizQuestion[];
  color?: string;
}

export default function QuickQuiz({
  title = 'Quick Check',
  questions,
  color = 'var(--accent)',
}: QuickQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctIndex;

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === question.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="card p-6">
        <div className="text-center">
          <h3 className="font-semibold text-xl mb-4">{title} Complete!</h3>

          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4"
            style={{
              backgroundColor: percentage >= 70 ? '#22c55e' : percentage >= 50 ? '#f59e0b' : '#ef4444',
            }}
          >
            {percentage}%
          </div>

          <p className="text-[var(--text-muted)] mb-4">
            You got {score} out of {questions.length} questions correct!
          </p>

          {percentage >= 70 ? (
            <p className="text-green-500 font-medium mb-4">Great job! You've mastered this concept.</p>
          ) : percentage >= 50 ? (
            <p className="text-yellow-500 font-medium mb-4">Good effort! Review the material and try again.</p>
          ) : (
            <p className="text-red-500 font-medium mb-4">Keep learning! Review the concepts and try again.</p>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="badge hover:border-[var(--border-strong)]"
            style={{ borderColor: color, color }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-[var(--text-muted)]">
          Question {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--surface-2)] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            backgroundColor: color,
            width: `${((currentQuestion + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <p className="text-lg mb-6">{question.question}</p>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          let optionStyle = 'bg-[var(--surface-2)] border-[var(--border)] hover:border-[var(--border-strong)]';

          if (selectedAnswer !== null) {
            if (index === question.correctIndex) {
              optionStyle = 'bg-green-500/20 border-green-500';
            } else if (index === selectedAnswer) {
              optionStyle = 'bg-red-500/20 border-red-500';
            }
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`
                w-full p-4 text-left rounded-lg border-2 transition-all
                ${optionStyle}
                ${selectedAnswer === null ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm
                    ${selectedAnswer !== null && index === question.correctIndex ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${selectedAnswer !== null && index === selectedAnswer && index !== question.correctIndex ? 'bg-red-500 border-red-500 text-white' : ''}
                  `}
                >
                  {selectedAnswer !== null && index === question.correctIndex && <Check size={14} />}
                  {selectedAnswer !== null && index === selectedAnswer && index !== question.correctIndex && <X size={14} />}
                  {selectedAnswer === null && String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            isCorrect ? 'bg-green-500/10 border-l-4 border-green-500' : 'bg-red-500/10 border-l-4 border-red-500'
          }`}
        >
          <p className={`font-semibold mb-2 flex items-center gap-1 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? <><Check size={16} /> Correct!</> : <><X size={16} /> Not quite</>}
          </p>
          <p className="text-sm text-[var(--text-muted)]">{question.explanation}</p>
        </div>
      )}

      {/* Navigation */}
      {selectedAnswer !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3 rounded-lg font-medium text-white transition-colors"
          style={{ backgroundColor: color }}
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
        </button>
      )}
    </div>
  );
}
