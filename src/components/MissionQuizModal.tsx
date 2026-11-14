// src/components/MissionQuizModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Compass,
  Sparkles,
  X,
  HelpCircle,
} from 'lucide-react';
import type { LandmarkQuiz } from '../data/quizzes';
import type { QuizRecord } from '../lib/streak';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  quiz: LandmarkQuiz;
  planetName: string;
  previousRecord?: QuizRecord;
  onComplete: (correct: number, total: number, maxXp: number) => void;
  onClose: () => void;
  onBackToExploration: () => void;
}

const OPTION_LETTERS_EN = ['A', 'B', 'C', 'D'] as const;
const OPTION_LETTERS_AR = ['أ', 'ب', 'ج', 'د'] as const;

export default function MissionQuizModal({
  quiz,
  planetName,
  previousRecord,
  onComplete,
  onClose,
  onBackToExploration,
}: Props) {
  const { lang, isRtl, t } = useLanguage();
  const total = quiz.questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [xpAwardedThisRun, setXpAwardedThisRun] = useState(0);

  const currentQ = quiz.questions[currentIndex];
  const isCorrect = submitted && selectedIndex === currentQ.correctIndex;
  const progressPct = Math.round(((currentIndex + (submitted ? 1 : 0)) / total) * 100);
  const optionLetters = lang === 'ar' ? OPTION_LETTERS_AR : OPTION_LETTERS_EN;

  const getPerformanceFeedback = (pct: number): { badge: string; message: string } => {
    if (pct === 100) {
      return {
        badge: t.quiz.scoreRatings.perfectTitle,
        message: t.quiz.scoreRatings.perfectSub,
      };
    }
    if (pct >= 80) {
      return {
        badge: t.quiz.scoreRatings.greatTitle,
        message: t.quiz.scoreRatings.greatSub,
      };
    }
    if (pct >= 60) {
      return {
        badge: t.quiz.scoreRatings.goodTitle,
        message: t.quiz.scoreRatings.goodSub,
      };
    }
    return {
      badge: t.quiz.scoreRatings.retryTitle,
      message: t.quiz.scoreRatings.retrySub,
    };
  };

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedIndex(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedIndex === null || submitted) return;
    setSubmitted(true);
    if (selectedIndex === currentQ.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < total) {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setSubmitted(false);
    } else {
      const finalCorrect = correctCount;
      const earnedForAttempt = Math.round((finalCorrect / total) * quiz.xpReward);
      const prevAwarded = previousRecord?.xpAwarded ?? 0;
      const deltaXp = Math.max(0, earnedForAttempt - prevAwarded);
      setXpAwardedThisRun(deltaXp);
      setFinished(true);
      onComplete(finalCorrect, total, quiz.xpReward);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setSubmitted(false);
    setCorrectCount(0);
    setFinished(false);
    setXpAwardedThisRun(0);
  };

  const finalPct = Math.round((correctCount / total) * 100);
  const incorrectCount = total - correctCount;
  const perf = getPerformanceFeedback(finalPct);

  return (
    <div
      className="quiz-backdrop interactive"
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.96 }}
        transition={{ type: 'spring', damping: 24, stiffness: 240 }}
        className="quiz-modal glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="quiz-header">
          <div>
            <div className="section-eyebrow">
              {finished
                ? t.quiz.badgeComplete
                : t.quiz.badgeChallenge(currentIndex + 1, total)}
            </div>
            <h2 id="quiz-modal-title" className="quiz-title">
              {quiz.title}
            </h2>
            <p className="quiz-subtitle">{quiz.description}</p>
          </div>
          <button
            type="button"
            className="streak-close-btn"
            onClick={onClose}
            aria-label={t.quiz.closeAria}
          >
            <X size={18} />
          </button>
        </div>

        {!finished ? (
          <>
            {/* Question counter + Progress bar */}
            <div className="quiz-progress-meta">
              <span className="quiz-step-indicator">
                {lang === 'ar'
                  ? `السؤال ${currentIndex + 1} من ${total}`
                  : `Question ${currentIndex + 1} of ${total}`}
              </span>
              <span className="quiz-xp-tag">
                {lang === 'ar'
                  ? `حتى +${quiz.xpReward} XP`
                  : `Up to +${quiz.xpReward} XP`}
              </span>
            </div>

            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 16 : -16 }}
                transition={{ duration: 0.22 }}
                className="quiz-question-block"
              >
                <h3 className="quiz-question-text">{currentQ.question}</h3>

                <div className="quiz-options-list">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isRightOption = idx === currentQ.correctIndex;

                    let stateClass = '';
                    if (!submitted) {
                      stateClass = isSelected ? 'selected' : '';
                    } else if (isRightOption) {
                      stateClass = 'correct';
                    } else if (isSelected && !isRightOption) {
                      stateClass = 'incorrect';
                    } else {
                      stateClass = 'dimmed';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={submitted}
                        onClick={() => handleSelectOption(idx)}
                        className={`quiz-option-btn ${stateClass}`}
                      >
                        <span className="quiz-option-letter">{optionLetters[idx]}</span>
                        <span className="quiz-option-text">{opt}</span>
                        {submitted && isRightOption && (
                          <CheckCircle2
                            size={18}
                            color="#34d399"
                            style={{ flexShrink: 0 }}
                          />
                        )}
                        {submitted && isSelected && !isRightOption && (
                          <XCircle
                            size={18}
                            color="#f87171"
                            style={{ flexShrink: 0 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Educational Feedback Box */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`quiz-feedback-box ${isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div className="quiz-feedback-header">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 size={18} color="#34d399" />
                          <span>
                            {lang === 'ar'
                              ? 'إجابة صحيحة!'
                              : 'Correct Answer!'}
                          </span>
                        </>
                      ) : (
                        <>
                          <HelpCircle size={18} color="#fbbf24" />
                          <span>
                            {lang === 'ar'
                              ? `إجابة غير صحيحة — الخيار الصحيح: (${optionLetters[currentQ.correctIndex]})`
                              : `Incorrect — Correct Answer: Option ${optionLetters[currentQ.correctIndex]}`}
                          </span>
                        </>
                      )}
                    </div>
                    {!isCorrect && (
                      <p className="quiz-feedback-correct-line">
                        <strong>
                          {lang === 'ar' ? 'الإجابة الصحيحة:' : 'Right answer:'}
                        </strong>{' '}
                        {currentQ.options[currentQ.correctIndex]}
                      </p>
                    )}
                    <p className="quiz-feedback-explanation">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer Action Button */}
            <div className="quiz-footer">
              {!submitted ? (
                <button
                  type="button"
                  disabled={selectedIndex === null}
                  onClick={handleSubmitAnswer}
                  className="quiz-action-btn primary"
                >
                  {lang === 'ar' ? 'تأكيد الإجابة' : 'Submit Answer'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="quiz-action-btn primary"
                >
                  {currentIndex + 1 < total
                    ? t.quiz.nextQuestion
                    : t.quiz.viewMissionResults}
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Quiz Completion Summary */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="quiz-summary"
          >
            <div className="quiz-summary-emblem">
              <Award size={36} color="#ffd166" />
            </div>

            <div className="quiz-summary-badge">{perf.badge}</div>
            <h3 className="quiz-summary-score">
              {correctCount} / {total} <span>({finalPct}%)</span>
            </h3>
            <p className="quiz-summary-message">{perf.message}</p>

            <div className="quiz-stats-grid">
              <div className="quiz-stat-box correct">
                <span className="quiz-stat-num">{correctCount}</span>
                <span className="quiz-stat-label">{t.quiz.correctAnswersStat}</span>
              </div>
              <div className="quiz-stat-box incorrect">
                <span className="quiz-stat-num">{incorrectCount}</span>
                <span className="quiz-stat-label">
                  {lang === 'ar' ? 'إجابات خاطئة' : 'INCORRECT'}
                </span>
              </div>
              <div className="quiz-stat-box xp">
                <span className="quiz-stat-num">
                  {xpAwardedThisRun > 0 ? `+${xpAwardedThisRun}` : '✓'}
                </span>
                <span className="quiz-stat-label">{t.quiz.xpRewardStat}</span>
              </div>
            </div>

            {xpAwardedThisRun === 0 && (previousRecord?.xpAwarded ?? 0) > 0 && (
              <p className="quiz-xp-note">
                <Sparkles size={13} />
                {t.quiz.previousBestNote(
                  previousRecord?.bestCorrect ?? 0,
                  total,
                  previousRecord?.xpAwarded ?? 0
                )}
              </p>
            )}

            <div className="quiz-summary-actions">
              <button
                type="button"
                onClick={handleRetry}
                className="quiz-action-btn secondary"
              >
                <RotateCcw size={16} />
                {t.quiz.retryQuizBtn}
              </button>
              <button
                type="button"
                onClick={onBackToExploration}
                className="quiz-action-btn primary"
              >
                <Compass size={16} />
                {t.hologram.backToPlanet(planetName)}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
