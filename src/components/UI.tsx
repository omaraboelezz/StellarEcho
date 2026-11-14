// src/components/UI.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sim } from '../lib/cinematic';
import type { CinematicTimeline } from '../lib/CinematicTimeline';
import type { CelebrationEvent, DailyMission, ExplorationState } from '../lib/streak';
import CinematicOverlay from '../components/CinematicOverlay';
import {
  StreakCelebrationToast,
  StreakModal,
  StreakTrigger,
} from '../components/StreakPanel';
import {
  Info,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Play,
  Pause,
  Compass,
  Orbit,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ResourcesSection from '../components/ResourceSection/ResourcesSection';
import AstroChat from '../components/AstroChat/AstroChat';
import PlanetNavigator from '../components/PlanetNavigator';
import HologramEquipmentPanel from '../components/HologramEquipmentPanel';
import LanguageSwitcher from '../components/LanguageSwitcher';
import type { HologramDisplayMode } from '../lib/hologramShader';
import { useLanguage } from '../i18n/LanguageContext';

interface UIProps {
  isExploring: boolean;
  selectedBodyId: string | null;
  inspectedLandmarkId?: string | null;
  activeLandmarkId: string | null;
  hologramDisplayMode?: HologramDisplayMode;
  onChangeHologramMode?: (mode: HologramDisplayMode) => void;
  onTriggerRescan?: () => void;
  timeline: CinematicTimeline;
  streakState: ExplorationState;
  activeCelebration: CelebrationEvent | null;
  onDismissCelebration: () => void;
  onStartExplore: () => void;
  onSelectBody?: (id: string) => void;
  onBackClick: () => void;
  onInspectLandmark?: (landmarkId: string | null) => void;
  onLandmarkSelect: (landmarkId: string) => void;
  onExitCinematic: () => void;
  onFactDiscover: (key: string) => void;
  onQuizComplete: (
    landmarkId: string,
    bodyId: string,
    correct: number,
    total: number,
    maxXp: number
  ) => void;
  onLaunchDailyMission: (mission: DailyMission) => void;
}

export default function UI({
  isExploring,
  selectedBodyId,
  inspectedLandmarkId = null,
  activeLandmarkId,
  hologramDisplayMode = 'hologram',
  onChangeHologramMode,
  onTriggerRescan,
  timeline,
  streakState,
  activeCelebration,
  onDismissCelebration,
  onStartExplore,
  onSelectBody,
  onBackClick,
  onInspectLandmark,
  onLandmarkSelect,
  onExitCinematic,
  onFactDiscover,
  onQuizComplete,
  onLaunchDailyMission,
}: UIProps) {
  const {
    lang,
    isRtl,
    t,
    getLocalizedBody,
    getLocalizedLandmark,
    getLocalizedLandmarksForBody,
  } = useLanguage();

  const [paused, setPaused] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const selectedBody = getLocalizedBody(selectedBodyId) ?? null;
  const inspectedLandmark = getLocalizedLandmark(inspectedLandmarkId);
  const activeLandmark = getLocalizedLandmark(activeLandmarkId);
  const bodyLandmarks = selectedBodyId ? getLocalizedLandmarksForBody(selectedBodyId) : [];

  // Expand drawer whenever a new planet is selected
  useEffect(() => {
    setPanelCollapsed(false);
  }, [selectedBodyId]);

  const factKey = selectedBody ? `fact-${selectedBody.id}` : '';
  const factLogged = factKey ? streakState.discoveredFacts.includes(factKey) : false;

  const toggleOrbits = () => {
    const next = !paused;
    setPaused(next);
    sim.targetTimeScale = next ? 0 : 1;
  };

  const getBodyTypeLabel = (type: string) => {
    if (type === 'star') return t.inspector.typeBadges.star;
    if (type === 'moon') return t.inspector.typeBadges.moon;
    return t.inspector.typeBadges.planet;
  };

  return (
    <div className="ui-container">
      {/* Celebration Toast */}
      <StreakCelebrationToast event={activeCelebration} onDismiss={onDismissCelebration} />

      <AnimatePresence>
        {!isExploring && (
          <motion.div
            key="hero"
            className="interactive hero-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top-right Streak & Language Switcher on Welcome Screen */}
            <div className="hero-topbar-right" dir="ltr">
              <StreakTrigger state={streakState} onClick={() => setStreakOpen(true)} />
              <LanguageSwitcher />
            </div>

            <div className="hero-badge">
              <img
                src="/stellarecho.png"
                alt="StellarEcho"
                className="hero-brand-logo"
              />
              <span>StellarEcho · {t.hero.eyebrow}</span>
            </div>

            <h1 className="hero-title">
              {lang === 'ar' ? 'استكشف الفضاء' : 'EXPLORE SPACE'}
            </h1>

            <p className="hero-subtitle">{t.hero.subtitle}</p>

            <button onClick={onStartExplore} className="primary-cta">
              <Compass size={18} />
              {lang === 'ar' ? 'ابدأ الاستكشاف الآن' : 'START EXPLORING'}
            </button>
          </motion.div>
        )}

        {isExploring && !activeLandmark && (
          <motion.header
            key="topbar"
            className={`hud-topbar ${selectedBody ? 'with-panel' : ''}`}
            dir="ltr"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45 }}
          >
            <div className="glass-panel hud-brand interactive" dir={isRtl ? 'rtl' : 'ltr'}>
              <img
                src="/stellarecho.png"
                alt="StellarEcho"
                className="hud-brand-logo"
              />
              <div>
                <div className="hud-brand-title">{t.topbar.brandTitle}</div>
                <div className="hud-brand-sub">
                  {inspectedLandmark
                    ? `${lang === 'ar' ? 'هولوغرام //' : 'HOLOGRAM //'} ${inspectedLandmark.name}`
                    : selectedBody
                      ? `${lang === 'ar' ? 'الهدف //' : 'TARGET //'} ${selectedBody.name}`
                      : t.topbar.brandSubOverview}
                </div>
              </div>
            </div>

            <div className="hud-topbar-right" dir="ltr">
              <StreakTrigger state={streakState} onClick={() => setStreakOpen(true)} />
              <LanguageSwitcher />

              <div className="glass-panel hud-controls interactive" dir={isRtl ? 'rtl' : 'ltr'}>
                <button
                  type="button"
                  className={`hud-chip-btn ${paused ? 'active' : ''}`}
                  onClick={toggleOrbits}
                  title={
                    paused
                      ? lang === 'ar'
                        ? 'استئناف حركة المدارات'
                        : 'Resume orbital motion'
                      : lang === 'ar'
                        ? 'إيقاف حركة المدارات مؤقتاً'
                        : 'Pause orbital motion'
                  }
                >
                  {paused ? <Play size={13} /> : <Pause size={13} />}
                  <span className="hud-chip-label">
                    {paused
                      ? lang === 'ar'
                        ? 'متوقف مؤقتاً'
                        : 'PAUSED'
                      : lang === 'ar'
                        ? 'مدارات حية'
                        : 'LIVE ORBITS'}
                  </span>
                </button>

                {selectedBodyId && (
                  <button
                    type="button"
                    className="hud-chip-btn"
                    onClick={onBackClick}
                    title={
                      lang === 'ar'
                        ? 'العودة إلى النظرة الشاملة للمجموعة الشمسية'
                        : 'Return to full Solar System view'
                    }
                  >
                    <Orbit size={13} />
                    <span className="hud-chip-label">{t.topbar.solarOverviewBtn}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.header>
        )}

        {isExploring && !activeLandmark && (
          <PlanetNavigator
            key="dock"
            selectedBodyId={selectedBodyId}
            visitedBodies={streakState.visitedBodies}
            onSelectBody={onSelectBody}
            onBackClick={onBackClick}
          />
        )}

        {/* Futuristic Holographic Equipment Information Panel & 3D Stage Controls */}
        {inspectedLandmark && !activeLandmark && (
          <HologramEquipmentPanel
            key="hologram-equipment-panel"
            landmark={inspectedLandmark}
            displayMode={hologramDisplayMode}
            onChangeDisplayMode={(mode) => onChangeHologramMode?.(mode)}
            onTriggerRescan={() => onTriggerRescan?.()}
            onSelectEquipment={(id) => onInspectLandmark?.(id)}
            onLaunchTimeline={(id) => onLandmarkSelect(id)}
            onClose={() => onInspectLandmark?.(null)}
          />
        )}

        {selectedBody && !inspectedLandmark && !activeLandmark && (
          <motion.aside
            key="panel"
            dir={isRtl ? 'rtl' : 'ltr'}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 180 }}
            className={`interactive glass-panel inspector-panel ${panelCollapsed ? 'collapsed' : ''}`}
          >
            <div className="inspector-nav">
              <button onClick={onBackClick} className="back-btn">
                {isRtl ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}
                {lang === 'ar' ? 'العودة إلى النظام الشمسي' : 'Back to System'}
              </button>

              <div className="inspector-nav-right">
                <span className="type-pill">{getBodyTypeLabel(selectedBody.type)}</span>
                <button
                  type="button"
                  className="mobile-collapse-btn"
                  onClick={() => setPanelCollapsed((c) => !c)}
                  aria-label={
                    panelCollapsed
                      ? lang === 'ar'
                        ? 'توسيع تفاصيل الكوكب'
                        : 'Expand planet details'
                      : lang === 'ar'
                        ? 'تصغير التفاصيل لعرض الكوكب ثلاثي الأبعاد'
                        : 'Minimize planet details to view 3D planet'
                  }
                >
                  {panelCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span>
                    {panelCollapsed
                      ? lang === 'ar'
                        ? 'التفاصيل'
                        : 'Details'
                      : lang === 'ar'
                        ? 'العرض 3D'
                        : '3D View'}
                  </span>
                </button>
              </div>
            </div>

            <div className="inspector-header">
              <h2 className="inspector-title">{selectedBody.name}</h2>
              <Info size={22} color="var(--accent-cyan)" />
            </div>

            {!panelCollapsed && (
              <>
                <p className="inspector-description">{selectedBody.description}</p>

                <div className="telemetry-grid">
                  <InfoRow label={t.inspector.meanRadius} value={selectedBody.radius} />
                  <InfoRow
                    label={t.inspector.distanceFromSun}
                    value={selectedBody.distanceFromSun}
                  />
                  <InfoRow
                    label={t.inspector.orbitalVelocity}
                    value={selectedBody.orbitalSpeed}
                  />
                  {selectedBody.type !== 'star' && (
                    <InfoRow
                      label={t.inspector.knownMoons}
                      value={
                        selectedBody.moons === 0
                          ? t.inspector.none
                          : selectedBody.moons.toString()
                      }
                    />
                  )}
                  <InfoRow
                    label={t.inspector.atmosphereSection}
                    value={selectedBody.atmosphere}
                    fullSpan
                  />
                </div>

                {/* Landmarks on this body */}
                {bodyLandmarks.length > 0 && (
                  <div className="missions-block">
                    <div className="section-eyebrow">
                      {lang === 'ar' ? 'الاستطلاع والمهمات السطحية' : 'SURFACE RECONNAISSANCE'}
                    </div>
                    <h3 className="section-heading">
                      {t.inspector.missionsSectionTitle(selectedBody.name)}
                    </h3>
                    <p className="section-sub">{t.inspector.missionsHint}</p>
                    <div className="mission-list">
                      {bodyLandmarks.map((l) => {
                        const qRec = streakState.completedQuizzes?.[l.id];
                        const isFocused = inspectedLandmarkId === l.id;
                        return (
                          <div
                            key={l.id}
                            className={`mission-card ${isFocused ? 'focused' : ''}`}
                            onClick={() => onInspectLandmark?.(l.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onInspectLandmark?.(l.id);
                              }
                            }}
                          >
                            <span className="mission-pin">
                              <MapPin size={17} color="#ffd166" />
                            </span>
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.45rem',
                                  flexWrap: 'wrap',
                                  fontWeight: 600,
                                  fontSize: '0.95rem',
                                }}
                              >
                                {l.name}
                                {qRec && (
                                  <span className="mission-quiz-badge">
                                    {lang === 'ar'
                                      ? `الاختبار ${qRec.bestPercentage}%`
                                      : `Quiz ${qRec.bestPercentage}%`}
                                  </span>
                                )}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '0.76rem',
                                  color: 'var(--accent-cyan)',
                                  marginTop: '0.12rem',
                                }}
                              >
                                {l.missionName} • {l.landingDate}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '0.75rem',
                                  color: 'var(--text-secondary)',
                                  marginTop: '0.1rem',
                                }}
                              >
                                {l.landingSite}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onLandmarkSelect(l.id);
                              }}
                              className="mission-play"
                              title={t.hologram.launch3DStory}
                              aria-label={`${t.hologram.launch3DStory}: ${l.name}`}
                            >
                              <Play size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="fact-callout">
                  <div className="fact-header-row">
                    <h3 className="fact-title">
                      <Sparkles size={16} />
                      {t.inspector.didYouKnow}
                    </h3>
                    <button
                      type="button"
                      className={`fact-log-btn ${factLogged ? 'logged' : ''}`}
                      onClick={() => onFactDiscover(factKey)}
                    >
                      <CheckCircle2 size={13} />
                      {factLogged ? t.inspector.factLoggedXp : t.inspector.logDiscoveryXp}
                    </button>
                  </div>
                  <p className="fact-body">{selectedBody.funFact}</p>
                </div>

                <ResourcesSection
                  planetId={selectedBody.id}
                  planetName={selectedBody.name}
                  onResourceExplore={onFactDiscover}
                />
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Streak & Daily Missions Modal */}
      <StreakModal
        open={streakOpen}
        state={streakState}
        onClose={() => setStreakOpen(false)}
        onLaunchMission={(m) => {
          setStreakOpen(false);
          onLaunchDailyMission(m);
        }}
      />

      {/* cinematic HUD */}
      {activeLandmark && (
        <CinematicOverlay
          key={activeLandmark.id}
          landmark={activeLandmark}
          timeline={timeline}
          quizRecord={streakState.completedQuizzes?.[activeLandmark.id]}
          onQuizComplete={onQuizComplete}
          onExit={onExitCinematic}
        />
      )}

      {/* Astro AI Intelligent Space Assistant */}
      {isExploring && (
        <AstroChat
          isExploring={isExploring}
          selectedBodyId={selectedBodyId}
          activeLandmarkId={activeLandmarkId ?? inspectedLandmarkId}
          timelineProgress={timeline.progress}
          currentStreak={streakState.currentStreak}
          totalXp={streakState.totalXp}
        />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullSpan = false,
}: {
  label: string;
  value: string;
  fullSpan?: boolean;
}) {
  return (
    <div className={`telemetry-card ${fullSpan ? 'full-span' : ''}`}>
      <span className="telemetry-label">{label}</span>
      <span className="telemetry-value">{value}</span>
    </div>
  );
}
