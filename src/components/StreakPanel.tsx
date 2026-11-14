// src/components/StreakPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Trophy,
  CheckCircle2,
  Circle,
  Sparkles,
  Award,
  X,
  ArrowUpRight,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import {
  getDailyMissions,
  getLastSevenDays,
  getMissionProgress,
  getMotivationalMessage,
  getStreakMilestones,
  toDateKey,
  type CelebrationEvent,
  type DailyMission,
  type ExplorationState,
} from '../lib/streak';
import { useLanguage } from '../i18n/LanguageContext';

interface TriggerProps {
  state: ExplorationState;
  onClick: () => void;
}

export function StreakTrigger({ state, onClick }: TriggerProps) {
  const { lang, t } = useLanguage();
  const today = toDateKey();
  const activeToday = state.lastStreakDate === today;
  const missions = getDailyMissions(today, lang);
  const completedMissions = missions.filter((m) =>
    state.completedMissionIds.includes(m.id)
  ).length;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`streak-pill interactive ${activeToday ? 'active-today' : ''}`}
      title={t.streak.triggerTitle}
      aria-label={t.streak.triggerAria(state.currentStreak)}
    >
      <span className="streak-flame-wrap">
        <Flame
          size={16}
          className="streak-flame-icon"
          fill={activeToday ? '#ff9f1c' : 'none'}
          color={activeToday ? '#ffd166' : '#94a3b8'}
        />
      </span>
      <span className="streak-pill-count">
        {lang === 'ar'
          ? `سلسلة ${state.currentStreak} ${state.currentStreak === 1 ? 'يوم' : 'أيام'}`
          : `${state.currentStreak}-Day Streak`}
      </span>
      <span className="streak-pill-divider" />
      <span
        className="streak-pill-missions"
        title={t.streak.completedCount(completedMissions, missions.length)}
      >
        {completedMissions}/{missions.length}
      </span>
    </motion.button>
  );
}

export function StreakCelebrationToast({
  event,
  onDismiss,
}: {
  event: CelebrationEvent | null;
  onDismiss: () => void;
}) {
  const { isRtl } = useLanguage();
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          dir={isRtl ? 'rtl' : 'ltr'}
          initial={{ opacity: 0, y: -28, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="streak-toast glass-panel interactive"
          onClick={onDismiss}
        >
          <div className={`streak-toast-icon kind-${event.kind}`}>
            {event.kind === 'milestone' ? (
              <Trophy size={20} color="#ffd166" />
            ) : event.kind === 'streak' ? (
              <Flame size={20} color="#ffd166" fill="#ff9f1c" />
            ) : (
              <Sparkles size={20} color="#67b7ff" />
            )}
          </div>
          <div className="streak-toast-body">
            <div className="streak-toast-title">{event.title}</div>
            <div className="streak-toast-sub">{event.subtitle}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ModalProps {
  open: boolean;
  state: ExplorationState;
  onClose: () => void;
  onLaunchMission: (mission: DailyMission) => void;
}

export function StreakModal({ open, state, onClose, onLaunchMission }: ModalProps) {
  const { lang, isRtl, t } = useLanguage();
  const today = toDateKey();
  const activeToday = state.lastStreakDate === today;
  const days = getLastSevenDays(state.completedDates, today, lang);
  const missions = getDailyMissions(today, lang);
  const milestones = getStreakMilestones(lang);
  const motivation = getMotivationalMessage(state.currentStreak, activeToday, lang);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="streak-backdrop"
          dir={isRtl ? 'rtl' : 'ltr'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="streak-modal-backdrop interactive"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 240 }}
            className="streak-modal glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="streak-modal-header">
              <div>
                <div className="section-eyebrow">{t.streak.modalBadge}</div>
                <h2 className="streak-modal-title">{t.streak.modalTitle}</h2>
              </div>
              <button
                type="button"
                className="streak-close-btn"
                onClick={onClose}
                aria-label={t.streak.closeAria}
              >
                <X size={18} />
              </button>
            </div>

            {/* Hero Streak Banner */}
            <div className={`streak-hero-card ${activeToday ? 'lit' : ''}`}>
              <div className="streak-hero-left">
                <div className={`streak-hero-emblem ${activeToday ? 'lit' : ''}`}>
                  <Flame
                    size={34}
                    color={activeToday ? '#ffd166' : '#94a3b8'}
                    fill={activeToday ? '#ff9f1c' : 'none'}
                  />
                </div>
                <div>
                  <div className="streak-hero-number">
                    {state.currentStreak}
                    <span>
                      {lang === 'ar'
                        ? ` ${state.currentStreak === 1 ? 'يوم' : 'أيام'} متتالية`
                        : '-Day Streak'}
                    </span>
                  </div>
                  <div className="streak-hero-status">
                    {activeToday
                      ? t.streak.activeTodayBadge
                      : t.streak.completeActionBadge}
                  </div>
                </div>
              </div>

              <div className="streak-hero-stats">
                <div className="streak-mini-stat">
                  <span className="streak-mini-label">{t.streak.bestStreakLabel}</span>
                  <span className="streak-mini-value">
                    {lang === 'ar' ? `${state.longestStreak}ي` : `${state.longestStreak}d`}
                  </span>
                </div>
                <div className="streak-mini-stat">
                  <span className="streak-mini-label">{t.streak.worldsVisitedLabel}</span>
                  <span className="streak-mini-value">{state.visitedBodies.length}/10</span>
                </div>
                <div className="streak-mini-stat">
                  <span className="streak-mini-label">{t.streak.totalXpLabel}</span>
                  <span className="streak-mini-value">{state.totalXp}</span>
                </div>
              </div>
            </div>

            <p className="streak-motivation">{motivation}</p>

            {/* 7-Day Activity Bar */}
            <div className="streak-section">
              <div className="streak-section-header">
                <span className="streak-section-label">{t.streak.last7DaysTitle}</span>
                <span className="streak-section-sub">
                  {lang === 'ar'
                    ? `${state.completedDates.length} إجمالي الأيام النشطة`
                    : `${state.completedDates.length} total active ${state.completedDates.length === 1 ? 'day' : 'days'}`}
                </span>
              </div>

              <div className="streak-week-grid">
                {days.map((d) => (
                  <div
                    key={d.key}
                    className={`streak-day-cell ${d.completed ? 'completed' : ''} ${d.isToday ? 'today' : ''}`}
                  >
                    <span className="streak-day-name">{d.label}</span>
                    <div className="streak-day-circle">
                      {d.completed ? (
                        <Flame size={15} color="#ffd166" fill="#ff9f1c" />
                      ) : (
                        <span>{d.dayNum}</span>
                      )}
                    </div>
                    {d.isToday && (
                      <span className="streak-today-tag">
                        {lang === 'ar' ? 'اليوم' : 'TODAY'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Exploration Objectives */}
            <div className="streak-section">
              <div className="streak-section-header">
                <span className="streak-section-label">{t.streak.dailyMissionsTitle}</span>
                <span className="streak-section-sub">
                  {t.streak.completedCount(
                    missions.filter((m) => state.completedMissionIds.includes(m.id))
                      .length,
                    missions.length
                  )}
                </span>
              </div>

              <div className="streak-mission-list">
                {missions.map((m) => {
                  const prog = getMissionProgress(state, m);
                  const done =
                    state.completedMissionIds.includes(m.id) || prog >= m.targetCount;
                  const pct = Math.min(100, Math.round((prog / m.targetCount) * 100));

                  return (
                    <div
                      key={m.id}
                      className={`streak-mission-card ${done ? 'done' : ''}`}
                    >
                      <div className="streak-mission-top">
                        <div className="streak-mission-check">
                          {done ? (
                            <CheckCircle2 size={19} color="#34d399" />
                          ) : (
                            <Circle size={19} color="#64748b" />
                          )}
                        </div>
                        <div className="streak-mission-info">
                          <div className="streak-mission-title-row">
                            <h4>{m.title}</h4>
                            <span className="streak-xp-pill">+{m.xp} XP</span>
                          </div>
                          <p>{m.description}</p>
                        </div>
                        {!done && (m.actionBodyId || m.actionLandmarkId) && (
                          <button
                            type="button"
                            className="streak-go-btn"
                            onClick={() => onLaunchMission(m)}
                          >
                            <Compass size={13} />
                            {t.streak.goBtn}
                            <ArrowUpRight size={13} />
                          </button>
                        )}
                      </div>

                      <div className="streak-progress-row">
                        <div className="streak-progress-track">
                          <div
                            className="streak-progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="streak-progress-text">
                          {prog}/{m.targetCount}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones & Badges */}
            <div className="streak-section">
              <div className="streak-section-header">
                <span className="streak-section-label">{t.streak.milestonesTitle}</span>
                <span className="streak-section-sub">
                  {lang === 'ar'
                    ? '3 • 7 • 14 • 30 • 100 يوم'
                    : '3 • 7 • 14 • 30 • 100 days'}
                </span>
              </div>

              <div className="streak-milestone-grid">
                {milestones.map((b) => {
                  const unlocked = state.longestStreak >= b.days;
                  const pct = Math.min(
                    100,
                    Math.round((state.currentStreak / b.days) * 100)
                  );
                  return (
                    <div
                      key={b.id}
                      className={`streak-badge-card ${unlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="streak-badge-top">
                        <div className="streak-badge-icon">
                          {unlocked ? (
                            <ShieldCheck size={20} color="#ffd166" />
                          ) : (
                            <Award size={20} color="#64748b" />
                          )}
                        </div>
                        <div>
                          <div className="streak-badge-title">{b.title}</div>
                          <div className="streak-badge-sub">{b.subtitle}</div>
                        </div>
                        <span
                          className={`streak-badge-status ${unlocked ? 'unlocked' : ''}`}
                        >
                          {unlocked
                            ? lang === 'ar'
                              ? 'مفتوح'
                              : 'UNLOCKED'
                            : lang === 'ar'
                              ? `${state.currentStreak}/${b.days} يوم`
                              : `${state.currentStreak}/${b.days}d`}
                        </span>
                      </div>
                      <p className="streak-badge-desc">{b.rewardText}</p>
                      {!unlocked && (
                        <div
                          className="streak-progress-track"
                          style={{ marginTop: '0.55rem' }}
                        >
                          <div
                            className="streak-progress-fill"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
