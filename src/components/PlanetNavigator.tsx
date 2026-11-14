// src/components/PlanetNavigator.tsx
import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Orbit,
  X,
  CheckCircle2,
  MapPin,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getLandmarksForBody } from '../data/landmarks';
import { preloadModelsForBody } from './EquipmentSite';
import { useLanguage } from '../i18n/LanguageContext';

interface PlanetNavigatorProps {
  selectedBodyId: string | null;
  visitedBodies: string[];
  onSelectBody?: (id: string) => void;
  onBackClick: () => void;
}

type FilterCategory = 'all' | 'inner' | 'outer' | 'missions';

interface BodyNavMeta {
  id: string;
  region: 'inner' | 'outer';
  tagEn: string;
  tagAr: string;
  distanceTagEn: string;
  distanceTagAr: string;
  texture: string;
  glowColor: string;
  hasRing?: 'saturn' | 'uranus';
  isStar?: boolean;
}

const ORDERED_BODY_META: BodyNavMeta[] = [
  {
    id: 'sun',
    region: 'inner',
    tagEn: 'Yellow Dwarf Star',
    tagAr: 'نجم قزم أصفر',
    distanceTagEn: '0 AU • System Core',
    distanceTagAr: '0 وحدة فلكية • مركز النظام',
    texture: '/textures/2k/2k_sun.jpg',
    glowColor: '#FDB813',
    isStar: true,
  },
  {
    id: 'mercury',
    region: 'inner',
    tagEn: 'Terrestrial Planet',
    tagAr: 'كوكب صخري',
    distanceTagEn: '0.39 AU',
    distanceTagAr: '0.39 وحدة فلكية',
    texture: '/textures/2k/2k_mercury.jpg',
    glowColor: '#9ca3af',
  },
  {
    id: 'venus',
    region: 'inner',
    tagEn: 'Terrestrial Planet',
    tagAr: 'كوكب صخري',
    distanceTagEn: '0.72 AU',
    distanceTagAr: '0.72 وحدة فلكية',
    texture: '/textures/2k/2k_venus_atmosphere.jpg',
    glowColor: '#e3bb76',
  },
  {
    id: 'earth',
    region: 'inner',
    tagEn: 'Home World',
    tagAr: 'كوكبنا الأم',
    distanceTagEn: '1.00 AU',
    distanceTagAr: '1.00 وحدة فلكية',
    texture: '/textures/2k/2k_earth_daymap.jpg',
    glowColor: '#38bdf8',
  },
  {
    id: 'moon',
    region: 'inner',
    tagEn: 'Lunar Satellite',
    tagAr: 'قمر طبيعي',
    distanceTagEn: '384,400 km',
    distanceTagAr: '384,400 كم',
    texture: '/textures/2k/2k_moon.jpg',
    glowColor: '#cbd5e1',
  },
  {
    id: 'mars',
    region: 'inner',
    tagEn: 'The Red Planet',
    tagAr: 'الكوكب الأحمر',
    distanceTagEn: '1.52 AU',
    distanceTagAr: '1.52 وحدة فلكية',
    texture: '/textures/2k/2k_mars.jpg',
    glowColor: '#ef6c44',
  },
  {
    id: 'jupiter',
    region: 'outer',
    tagEn: 'Gas Giant',
    tagAr: 'عملاق غازي',
    distanceTagEn: '5.20 AU',
    distanceTagAr: '5.20 وحدة فلكية',
    texture: '/textures/2k/2k_jupiter.jpg',
    glowColor: '#d39c7e',
  },
  {
    id: 'saturn',
    region: 'outer',
    tagEn: 'Ringed Gas Giant',
    tagAr: 'عملاق غازي ذو حلقات',
    distanceTagEn: '9.58 AU',
    distanceTagAr: '9.58 وحدة فلكية',
    texture: '/textures/2k/2k_saturn.jpg',
    glowColor: '#ead6b8',
    hasRing: 'saturn',
  },
  {
    id: 'uranus',
    region: 'outer',
    tagEn: 'Ice Giant',
    tagAr: 'عملاق جليدي',
    distanceTagEn: '19.2 AU',
    distanceTagAr: '19.2 وحدة فلكية',
    texture: '/textures/2k/2k_uranus.jpg',
    glowColor: '#7dd3fc',
    hasRing: 'uranus',
  },
  {
    id: 'neptune',
    region: 'outer',
    tagEn: 'Ice Giant',
    tagAr: 'عملاق جليدي',
    distanceTagEn: '30.1 AU',
    distanceTagAr: '30.1 وحدة فلكية',
    texture: '/textures/2k/2k_neptune.jpg',
    glowColor: '#3b82f6',
  },
];

const PlanetNavigator = memo(function PlanetNavigator({
  selectedBodyId,
  visitedBodies,
  onSelectBody,
  onBackClick,
}: PlanetNavigatorProps) {
  const { lang, isRtl, t, getLocalizedBody } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedMeta = useMemo(
    () => ORDERED_BODY_META.find((m) => m.id === selectedBodyId) ?? null,
    [selectedBodyId]
  );
  const selectedBody = getLocalizedBody(selectedBodyId) ?? null;

  const filteredBodies = useMemo(() => {
    return ORDERED_BODY_META.filter((meta) => {
      if (filter === 'inner') return meta.region === 'inner';
      if (filter === 'outer') return meta.region === 'outer';
      if (filter === 'missions') return getLandmarksForBody(meta.id).length > 0;
      return true;
    });
  }, [filter]);

  // Close on Escape key or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('touchstart', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  const handleCardSelect = (id: string) => {
    setIsOpen(false);
    if (selectedBodyId === id) {
      onBackClick();
    } else {
      onSelectBody?.(id);
    }
  };

  const handleStepBody = (direction: -1 | 1, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = ORDERED_BODY_META.findIndex((m) => m.id === selectedBodyId);
    if (currentIndex === -1) {
      onSelectBody?.(ORDERED_BODY_META[0].id);
      return;
    }
    const nextIndex =
      (currentIndex + direction + ORDERED_BODY_META.length) % ORDERED_BODY_META.length;
    onSelectBody?.(ORDERED_BODY_META[nextIndex].id);
  };

  const exploredCount = visitedBodies.filter((id) =>
    ORDERED_BODY_META.some((m) => m.id === id)
  ).length;

  return (
    <div
      ref={containerRef}
      className={`hud-bottom ${selectedBody ? 'with-panel' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Popup Atlas Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="planet-atlas-popup"
            initial={{ opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 290 }}
            className="glass-panel planet-atlas-popup interactive"
            aria-label={t.navigator.exploreSolarSystemTitle}
          >
            {/* Popup Header */}
            <div className="planet-atlas-header">
              <div className="planet-atlas-title-group">
                <div className="planet-atlas-eyebrow">
                  <Sparkles size={12} color="#67b7ff" />
                  <span>
                    {lang === 'ar'
                      ? 'أطلس الملاحة الفلكية'
                      : 'CELESTIAL NAVIGATION ATLAS'}
                  </span>
                  <span className="planet-atlas-progress">
                    {lang === 'ar'
                      ? `تم استكشاف ${exploredCount}/${ORDERED_BODY_META.length}`
                      : `${exploredCount}/${ORDERED_BODY_META.length} EXPLORED`}
                  </span>
                </div>
                <h3 className="planet-atlas-heading">
                  {lang === 'ar'
                    ? 'اختر وجهتك في المجموعة الشمسية'
                    : 'Select Destination World'}
                </h3>
              </div>

              <div className="planet-atlas-header-actions">
                {selectedBodyId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onBackClick();
                    }}
                    className="planet-atlas-overview-btn"
                    title={t.navigator.resetToOverview}
                  >
                    <Orbit size={13} />
                    <span>{t.topbar.solarOverviewBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="planet-atlas-close-btn"
                  aria-label={t.navigator.closeAria}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div
              className="planet-atlas-filters"
              role="tablist"
              aria-label={t.navigator.exploreSolarSystemTitle}
            >
              {(
                [
                  {
                    id: 'all',
                    label:
                      lang === 'ar'
                        ? `${t.navigator.filters.all} (10)`
                        : 'All Worlds (10)',
                  },
                  {
                    id: 'inner',
                    label:
                      lang === 'ar'
                        ? `${t.navigator.filters.inner} (6)`
                        : 'Inner System (6)',
                  },
                  {
                    id: 'outer',
                    label:
                      lang === 'ar'
                        ? `${t.navigator.filters.outer} (4)`
                        : 'Outer Giants (4)',
                  },
                  {
                    id: 'missions',
                    label:
                      lang === 'ar' ? 'مواقع المهمات (6)' : 'Mission Sites (6)',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`planet-filter-tab ${filter === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Celestial Cards Grid */}
            <div className="planet-atlas-grid">
              {filteredBodies.map((meta, idx) => {
                const body = getLocalizedBody(meta.id);
                if (!body) return null;
                const isSelected = selectedBodyId === meta.id;
                const isVisited = visitedBodies.includes(meta.id);
                const missionCount = getLandmarksForBody(meta.id).length;
                const tag = lang === 'ar' ? meta.tagAr : meta.tagEn;
                const distanceTag =
                  lang === 'ar' ? meta.distanceTagAr : meta.distanceTagEn;

                return (
                  <motion.button
                    key={meta.id}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025, duration: 0.22 }}
                    onMouseEnter={() => {
                      if (missionCount > 0) preloadModelsForBody(meta.id);
                    }}
                    onClick={() => handleCardSelect(meta.id)}
                    className={`planet-atlas-card ${isSelected ? 'selected' : ''}`}
                    style={
                      {
                        '--planet-glow': meta.glowColor,
                      } as React.CSSProperties
                    }
                  >
                    {/* Top status badges */}
                    <div className="planet-card-top-badges">
                      <span className="planet-card-distance">{distanceTag}</span>
                      {isVisited && (
                        <span
                          className="planet-card-visited"
                          title={lang === 'ar' ? 'تمت زيارته' : 'Visited'}
                        >
                          <CheckCircle2 size={12} />
                        </span>
                      )}
                    </div>

                    {/* Visual 3D-shaded miniature sphere */}
                    <div className="planet-sphere-stage">
                      {meta.hasRing && (
                        <span className={`planet-mini-ring ${meta.hasRing}`} />
                      )}
                      <span
                        className={`planet-mini-sphere ${meta.isStar ? 'is-star' : ''}`}
                        style={{
                          backgroundImage: `url(${meta.texture})`,
                          backgroundColor: body.color ?? '#ffffff',
                        }}
                      />
                    </div>

                    {/* Name & Subtitle */}
                    <div className="planet-card-info">
                      <div className="planet-card-name-row">
                        <span className="planet-card-name">{body.name}</span>
                        {isSelected && <span className="planet-card-active-dot" />}
                      </div>
                      <span className="planet-card-tag">{tag}</span>
                    </div>

                    {/* Footer telemetry chip */}
                    <div className="planet-card-footer">
                      {missionCount > 0 ? (
                        <span className="planet-card-mission-pill">
                          <MapPin size={10} />
                          {lang === 'ar'
                            ? `${missionCount} ${missionCount === 1 ? 'مهمة' : 'مهمات'}`
                            : `${missionCount} ${missionCount === 1 ? 'Mission' : 'Missions'}`}
                        </span>
                      ) : (
                        <span className="planet-card-moons-pill">
                          {body.type === 'star'
                            ? lang === 'ar'
                              ? '99.8% من كتلة النظام'
                              : '99.8% System Mass'
                            : lang === 'ar'
                              ? body.moons === 0
                                ? 'بلا أقمار'
                                : body.moons === 1
                                  ? 'قمر واحد'
                                  : `${body.moons} أقمار`
                              : `${body.moons} ${body.moons === 1 ? 'Moon' : 'Moons'}`}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Subtle hint when in System Overview and popup is closed */}
      {!selectedBodyId && !isOpen && (
        <p className="hud-hint">
          {lang === 'ar'
            ? 'انقر على أي جرم في الفضاء ثلاثي الأبعاد أو افتح أطلس الكواكب أدناه.'
            : 'Click any world in 3D space or open the Celestial Atlas below.'}
        </p>
      )}

      {/* Compact Floating Navigation Bar / Launcher */}
      <div className="planet-launcher-bar interactive">
        {selectedBodyId && (
          <button
            type="button"
            onClick={(e) => handleStepBody(-1, e)}
            className="planet-step-btn"
            title={lang === 'ar' ? 'الجرم السماوي السابق' : 'Previous celestial body'}
            aria-label={lang === 'ar' ? 'الجرم السماوي السابق' : 'Previous celestial body'}
          >
            {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`planet-launcher-btn ${isOpen ? 'open' : ''} ${selectedBody ? 'has-target' : ''}`}
          aria-expanded={isOpen}
          aria-label={t.navigator.openAria}
        >
          {/* Orb Preview */}
          <span className="planet-launcher-orb-wrap">
            {selectedMeta ? (
              <span
                className={`planet-launcher-mini-sphere ${selectedMeta.isStar ? 'is-star' : ''}`}
                style={{
                  backgroundImage: `url(${selectedMeta.texture})`,
                  backgroundColor: selectedBody?.color ?? '#67b7ff',
                  boxShadow: `0 0 14px ${selectedMeta.glowColor}66`,
                }}
              />
            ) : (
              <span className="planet-launcher-compass">
                <Compass size={18} color="#67b7ff" />
              </span>
            )}
          </span>

          {/* Text Content */}
          <span className="planet-launcher-meta">
            <span className="planet-launcher-eyebrow">
              {selectedBody
                ? lang === 'ar'
                  ? 'الهدف النشط // تبديل العالم'
                  : 'ACTIVE TARGET // SWITCH WORLD'
                : lang === 'ar'
                  ? 'مستكشف الكواكب الفلكي'
                  : 'CELESTIAL NAVIGATOR'}
            </span>
            <span className="planet-launcher-label">
              {selectedBody && selectedMeta ? (
                <>
                  <strong>{selectedBody.name}</strong>
                  <span className="planet-launcher-sep">•</span>
                  <span className="planet-launcher-subtag">
                    {lang === 'ar' ? selectedMeta.tagAr : selectedMeta.tagEn}
                  </span>
                </>
              ) : (
                <>
                  <strong>{t.navigator.exploreSolarSystemTitle}</strong>
                  <span className="planet-launcher-count">
                    {t.navigator.bodiesCountBadge}
                  </span>
                </>
              )}
            </span>
          </span>

          {/* Quick mini dots preview of planets */}
          <span className="planet-launcher-dots" aria-hidden="true">
            {ORDERED_BODY_META.map((m) => (
              <span
                key={m.id}
                className={`planet-launcher-dot ${selectedBodyId === m.id ? 'active' : ''}`}
                style={{ backgroundColor: m.glowColor }}
              />
            ))}
          </span>

          {/* Toggle Chevron */}
          <span className={`planet-launcher-chevron ${isOpen ? 'open' : ''}`}>
            <ChevronUp size={16} />
          </span>
        </button>

        {selectedBodyId && (
          <button
            type="button"
            onClick={(e) => handleStepBody(1, e)}
            className="planet-step-btn"
            title={lang === 'ar' ? 'الجرم السماوي التالي' : 'Next celestial body'}
            aria-label={lang === 'ar' ? 'الجرم السماوي التالي' : 'Next celestial body'}
          >
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
    </div>
  );
});

export default PlanetNavigator;
