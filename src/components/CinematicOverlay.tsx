// src/components/CinematicOverlay.tsx
// HUD shown while a landmark story plays: title, chapter navigation, captions, progress,
// play/pause/mute/replay/exit, and the interactive Mission Knowledge Quiz that unlocks
// once the student reaches the end of the equipment timeline.
import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import type { Landmark } from '../data/landmarks';
import type { LandmarkQuiz } from '../data/quizzes';
import type { CinematicTimeline, TimelineSnapshot } from '../lib/CinematicTimeline';
import type { QuizRecord } from '../lib/streak';
import { useLanguage } from '../i18n/LanguageContext';

const MissionQuizModal = lazy(() => import('./MissionQuizModal'));

interface Props {
  landmark: Landmark;
  timeline: CinematicTimeline;
  quizRecord?: QuizRecord;
  onQuizComplete: (
    landmarkId: string,
    bodyId: string,
    correct: number,
    total: number,
    maxXp: number
  ) => void;
  onExit: () => void;
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: 'var(--text-primary)',
  width: 38,
  height: 38,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.2s ease, border-color 0.2s ease',
};

export default function CinematicOverlay({
  landmark,
  timeline,
  quizRecord,
  onQuizComplete,
  onExit,
}: Props) {
  const {
    lang,
    isRtl,
    t,
    getLocalizedBody,
    getLocalizedChapters,
  } = useLanguage();

  const [snap, setSnap] = useState<TimelineSnapshot>(() => timeline.snapshot());
  const [quizOpen, setQuizOpen] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [quiz, setQuiz] = useState<LandmarkQuiz | undefined>(undefined);

  // Lazily load quiz data (+ Arabic quiz translations only when lang === 'ar')
  useEffect(() => {
    let alive = true;
    Promise.all([
      import('../data/quizzes'),
      lang === 'ar' ? import('../i18n/arQuizzesAndResources') : Promise.resolve(null),
    ])
      .then(([quizMod, arMod]) => {
        if (!alive) return;
        const baseQuiz = quizMod.getQuizForLandmark(landmark.id);
        if (!baseQuiz) {
          setQuiz(undefined);
          return;
        }
        if (lang !== 'ar' || !arMod) {
          setQuiz(baseQuiz);
          return;
        }
        const arOverlay = arMod.arQuizzes[landmark.id];
        if (!arOverlay) {
          setQuiz(baseQuiz);
          return;
        }
        setQuiz({
          ...baseQuiz,
          title: arOverlay.title,
          description: arOverlay.description,
          questions: baseQuiz.questions.map((q, idx) => {
            const arQ = arOverlay.questions[idx];
            if (!arQ) return q;
            return {
              ...q,
              question: arQ.prompt,
              options: arQ.options,
              explanation: arQ.explanation,
            };
          }),
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [landmark.id, lang]);

  // Poll timeline snapshot only while quiz is closed and only re-render when visible fields change
  useEffect(() => {
    if (quizOpen) return;
    const id = setInterval(() => {
      const next = timeline.snapshot();
      setSnap((prev) => {
        if (
          prev.status === next.status &&
          prev.muted === next.muted &&
          prev.audioBlocked === next.audioBlocked &&
          prev.audioFailed === next.audioFailed &&
          prev.loading === next.loading &&
          Math.round(prev.progress * 250) === Math.round(next.progress * 250)
        ) {
          return prev;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [timeline, quizOpen]);

  const chapters = getLocalizedChapters(landmark);
  let idx = 0;
  chapters.forEach((c, i) => {
    if (snap.progress >= c.at) idx = i;
  });
  const chapter = chapters[idx];
  const ended = snap.status === 'ended';
  const isLastChapter = idx >= chapters.length - 1;

  // Unlock the quiz automatically once the student reaches the final chapter or timeline ends
  useEffect(() => {
    if (ended || isLastChapter) {
      setReachedEnd(true);
    }
  }, [ended, isLastChapter]);

  const localizedBody = getLocalizedBody(landmark.bodyId);
  const planetName =
    localizedBody?.name ??
    landmark.bodyId.charAt(0).toUpperCase() + landmark.bodyId.slice(1);

  const onPlayPause = () => (ended ? timeline.restart() : timeline.toggle());

  const jumpToChapter = (chapterIndex: number) => {
    const target = chapters[chapterIndex];
    if (!target) return;
    timeline.seek(Math.min(0.99, target.at + 0.005));
    setSnap(timeline.snapshot());
  };

  const handleOpenQuiz = () => {
    timeline.pause();
    setQuizOpen(true);
  };

  return (
    <div className="cinematic-hud" dir={isRtl ? 'rtl' : 'ltr'} aria-live="polite">
      {/* Top bar: mission title card + exit button */}
      <div className="cinematic-topbar">
        <motion.div
          initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel cinematic-title-card"
        >
          <div className="section-eyebrow">
            {lang === 'ar' ? 'سجل المهمة الفضائية' : 'SURFACE MISSION LOG'}
          </div>
          <h2 className="cinematic-title">{landmark.name}</h2>
          <p className="cinematic-meta">
            {landmark.agency} • {landmark.years}
          </p>
          <p className="cinematic-status">{landmark.status}</p>
        </motion.div>

        <button
          className="interactive cinematic-exit-btn"
          onClick={onExit}
          aria-label={t.cinematic.exitStoryLabel}
          style={iconBtn}
        >
          <X size={20} />
        </button>
      </div>

      {/* Sound / status notices */}
      {(snap.audioBlocked || snap.audioFailed || snap.loading) && (
        <div className="cinematic-notices">
          {snap.audioBlocked && (
            <button
              className="interactive cinematic-audio-btn"
              onClick={() => timeline.enableAudio()}
            >
              {lang === 'ar' ? 'انقر لتشغيل التعليق الصوتي' : 'Tap to play narration'}
            </button>
          )}
          {snap.audioFailed && (
            <span className="cinematic-notice-pill">
              {lang === 'ar'
                ? 'وضع الخط الزمني التفاعلي — استخدم الفصول أو أزرار التشغيل أدناه'
                : 'Interactive timeline mode — use chapters or play controls below'}
            </span>
          )}
          {snap.loading && (
            <span className="cinematic-notice-pill">
              {lang === 'ar' ? 'جارٍ تحميل التعليق الصوتي…' : 'Loading narration…'}
            </span>
          )}
        </div>
      )}

      {/* Bottom: quiz unlock prompt + chapter caption + timeline controls */}
      <div className="cinematic-bottom">
        {/* Quiz Unlock Banner (automatically appears once the final chapter or end is reached) */}
        <AnimatePresence>
          {quiz && reachedEnd && !quizOpen && (
            <motion.div
              key="quiz-unlock-banner"
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="interactive glass-panel cinematic-quiz-banner"
            >
              <div className="cinematic-quiz-banner-info">
                <span className="cinematic-quiz-icon">
                  <GraduationCap size={20} color="#ffd166" />
                </span>
                <div>
                  <div className="cinematic-quiz-banner-title">
                    {lang === 'ar'
                      ? 'اكتمل الخط الزمني — اختبر معلوماتك عن المهمة!'
                      : 'Timeline Complete — Test Your Mission Knowledge!'}
                  </div>
                  <div className="cinematic-quiz-banner-sub">
                    {quizRecord ? (
                      lang === 'ar' ? (
                        <>
                          أفضل نتيجة: {quizRecord.bestCorrect}/{quizRecord.total} (
                          {quizRecord.bestPercentage}%) • تم كسب {quizRecord.xpAwarded} XP
                        </>
                      ) : (
                        <>
                          Best score: {quizRecord.bestCorrect}/{quizRecord.total} (
                          {quizRecord.bestPercentage}%) • {quizRecord.xpAwarded} XP earned
                        </>
                      )
                    ) : lang === 'ar' ? (
                      <>
                        أجب عن {quiz.questions.length} أسئلة علمية لكسب ما يصل إلى +
                        {quiz.xpReward} XP
                      </>
                    ) : (
                      <>
                        Answer {quiz.questions.length} mission questions to earn up to +
                        {quiz.xpReward} XP
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="cinematic-quiz-banner-actions">
                <button
                  type="button"
                  onClick={handleOpenQuiz}
                  className="cinematic-start-quiz-btn"
                >
                  {quizRecord ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <GraduationCap size={16} />
                  )}
                  {quizRecord
                    ? lang === 'ar'
                      ? 'إعادة الاختبار'
                      : 'Retake Quiz'
                    : t.cinematic.startQuizBtn}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapter Caption Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${idx}-${chapter.title}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="interactive glass-panel cinematic-caption-card"
          >
            <div className="cinematic-caption-top">
              <h3 className="cinematic-chapter-title">
                <span className="cinematic-chapter-step">
                  {t.cinematic.chapterCounter(idx + 1, chapters.length)}
                </span>
                {chapter.title}
              </h3>

              {/* Step through chapters manually */}
              <div className="cinematic-chapter-arrows">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => jumpToChapter(idx - 1)}
                  className="cinematic-step-btn"
                  aria-label={t.cinematic.previousChapterTitle}
                >
                  {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                </button>
                <button
                  type="button"
                  disabled={idx >= chapters.length - 1}
                  onClick={() => jumpToChapter(idx + 1)}
                  className="cinematic-step-btn"
                  aria-label={t.cinematic.nextChapterTitle}
                >
                  {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                </button>
              </div>
            </div>

            <p className="cinematic-caption-text">{chapter.caption}</p>

            {/* Chapter dots / quick jump */}
            <div className="cinematic-chapter-pills">
              {chapters.map((c, i) => (
                <button
                  key={`${i}-${c.title}`}
                  type="button"
                  onClick={() => jumpToChapter(i)}
                  className={`cinematic-chapter-dot ${i === idx ? 'active' : i < idx ? 'passed' : ''}`}
                >
                  {i + 1}. {c.title}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Playback Controls */}
        <div className="interactive glass-panel cinematic-controls" dir="ltr">
          <button
            onClick={onPlayPause}
            style={iconBtn}
            aria-label={
              ended
                ? t.cinematic.restartStoryTitle
                : snap.status === 'playing'
                  ? t.cinematic.pauseTitle
                  : t.cinematic.playTitle
            }
          >
            {ended ? (
              <RotateCcw size={17} />
            ) : snap.status === 'playing' ? (
              <Pause size={17} />
            ) : (
              <Play size={17} />
            )}
          </button>

          <div
            className="cinematic-scrub-track"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / Math.max(1, rect.width);
              timeline.seek(ratio);
              setSnap(timeline.snapshot());
            }}
            title={lang === 'ar' ? 'انقر للتنقل عبر الخط الزمني' : 'Click to scrub timeline'}
          >
            <div
              className="cinematic-scrub-fill"
              style={{ width: `${snap.progress * 100}%` }}
            />
          </div>

          <button
            onClick={() => timeline.setMuted(!snap.muted)}
            style={iconBtn}
            aria-label={
              snap.muted
                ? t.cinematic.enableNarrationTitle
                : t.cinematic.muteNarrationTitle
            }
          >
            {snap.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {quiz && (
            <button
              type="button"
              onClick={handleOpenQuiz}
              className="cinematic-back-inline-btn cinematic-quiz-inline-btn"
              title={t.cinematic.takeMissionQuizTitle}
            >
              {t.cinematic.quizLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onExit}
            className="cinematic-back-inline-btn cinematic-exit-inline-btn"
          >
            {t.hologram.backToPlanet(planetName)}
          </button>
        </div>
      </div>

      {/* Interactive Quiz Modal */}
      {quiz && quizOpen && (
        <Suspense fallback={null}>
          <MissionQuizModal
            quiz={quiz}
            planetName={planetName}
            previousRecord={quizRecord}
            onComplete={(correct, total, maxXp) =>
              onQuizComplete(landmark.id, landmark.bodyId, correct, total, maxXp)
            }
            onClose={() => setQuizOpen(false)}
            onBackToExploration={() => {
              setQuizOpen(false);
              onExit();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
