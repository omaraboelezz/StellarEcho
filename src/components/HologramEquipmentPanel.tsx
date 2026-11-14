// src/components/HologramEquipmentPanel.tsx
//
// Futuristic NASA Holographic Equipment Information Interface & 3D Stage Controls.
// Appears beside the 3D holographic equipment projection when a user selects any
// equipment marker or mission item. Uses only verified data from src/data/landmarks.ts
// and src/data/planets.ts.

import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Building2,
  Calendar,
  Compass,
  Cpu,
  Eye,
  Globe2,
  Layers,
  MapPin,
  Play,
  RefreshCw,
  Rotate3d,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { type Landmark } from '../data/landmarks';
import type { HologramDisplayMode } from '../lib/hologramShader';
import { useLanguage } from '../i18n/LanguageContext';

interface HologramEquipmentPanelProps {
  landmark: Landmark;
  displayMode: HologramDisplayMode;
  onChangeDisplayMode: (mode: HologramDisplayMode) => void;
  onTriggerRescan: () => void;
  onSelectEquipment: (landmarkId: string) => void;
  onLaunchTimeline: (landmarkId: string) => void;
  onClose: () => void;
}

const KIND_LABELS_EN: Record<Landmark['kind'], string> = {
  rover: 'SURFACE ROVER',
  lander: 'PLANETARY LANDER',
  helicopter: 'AERIAL ROTORCRAFT',
  orbiter: 'ORBITAL SPACECRAFT',
  telescope: 'SPACE OBSERVATORY',
  wreck: 'IMPACT SITE',
  probe: 'ATMOSPHERIC PROBE',
};

const KIND_LABELS_AR: Record<Landmark['kind'], string> = {
  rover: 'عربة جوالة سطحية',
  lander: 'مركبة هبوط كوكبية',
  helicopter: 'مروحية فضائية',
  orbiter: 'مسبار مداري',
  telescope: 'مرصد فضائي',
  wreck: 'موقع اصطدام مداري',
  probe: 'مسبار غلاف جوي',
};

const HologramEquipmentPanel = memo(function HologramEquipmentPanel({
  landmark,
  displayMode,
  onChangeDisplayMode,
  onTriggerRescan,
  onSelectEquipment,
  onLaunchTimeline,
  onClose,
}: HologramEquipmentPanelProps) {
  const {
    lang,
    isRtl,
    t,
    getLocalizedBody,
    getLocalizedLandmarksForBody,
  } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'science' | 'facts'>('overview');

  const destinationBody = getLocalizedBody(landmark.bodyId);
  const bodyEquipment = getLocalizedLandmarksForBody(landmark.bodyId);

  // Reset to overview tab when switching equipment
  useEffect(() => {
    setActiveTab('overview');
  }, [landmark.id]);

  // Allow dismissing the hologram with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const kindLabel =
    lang === 'ar' ? KIND_LABELS_AR[landmark.kind] : KIND_LABELS_EN[landmark.kind];

  return (
    <>
      {/* Bottom-left 3D Hologram Stage Controls & Interaction Hint */}
      <motion.div
        key="holo-stage-hud"
        dir={isRtl ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 14 }}
        transition={{ duration: 0.35 }}
        className="holo-stage-controls interactive"
      >
        <div className="holo-stage-hint">
          <Rotate3d size={14} className="holo-pulse-icon" />
          <span>
            {lang === 'ar'
              ? 'اسحب للتدوير 360° • مرّر للتكبير والتصغير'
              : 'DRAG TO ROTATE 360° • SCROLL TO ZOOM'}
          </span>
        </div>

        <div
          className="holo-mode-bar"
          role="group"
          aria-label={t.hologram.stageControlsAria}
        >
          <button
            type="button"
            onClick={() => onChangeDisplayMode('hologram')}
            className={`holo-mode-btn ${displayMode === 'hologram' ? 'active' : ''}`}
            title={
              lang === 'ar'
                ? 'عرض هولوغرافي سياني كامل مع شبكة ثلاثية الأبعاد'
                : 'Full Cyan Holographic Projection + Wireframe Lattice'
            }
          >
            <Cpu size={12} />
            <span>{t.hologram.modeHologram}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDisplayMode('hybrid')}
            className={`holo-mode-btn ${displayMode === 'hybrid' ? 'active' : ''}`}
            title={
              lang === 'ar'
                ? 'مسح هجين: يدمج خطوط المسح الهولوغرافي مع الألوان الأصلية للمركبة'
                : 'Hybrid Scan: Blends holographic scanlines with original surface materials'
            }
          >
            <Layers size={12} />
            <span>{lang === 'ar' ? 'مسح هجين' : 'HYBRID SCAN'}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDisplayMode('physical')}
            className={`holo-mode-btn ${displayMode === 'physical' ? 'active' : ''}`}
            title={
              lang === 'ar'
                ? 'عرض المظهر الفيزيائي الأصلي للمركبة ثلاثية الأبعاد'
                : 'Inspect original physical 3D spacecraft appearance'
            }
          >
            <Eye size={12} />
            <span>{t.hologram.modePhysical}</span>
          </button>
          <button
            type="button"
            onClick={onTriggerRescan}
            className="holo-mode-btn holo-rescan-btn"
            title={t.hologram.rescanTitle}
          >
            <RefreshCw size={12} />
            <span>{t.hologram.rescan}</span>
          </button>
        </div>
      </motion.div>

      {/* Right-Side Futuristic Holographic Equipment Information Panel */}
      <motion.aside
        key="holo-info-panel"
        dir={isRtl ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, x: 42, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 36, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="holo-info-panel interactive"
        aria-label={`${t.hologram.headerStatusPrefix}: ${landmark.name}`}
      >
        {/* Corner HUD target brackets */}
        <span className="holo-corner holo-corner-tl" aria-hidden="true" />
        <span className="holo-corner holo-corner-tr" aria-hidden="true" />
        <span className="holo-corner holo-corner-bl" aria-hidden="true" />
        <span className="holo-corner holo-corner-br" aria-hidden="true" />

        {/* Subtle animated scanline overlay */}
        <div className="holo-panel-scanline" aria-hidden="true" />

        {/* Top Telemetry Bar */}
        <div className="holo-panel-topbar">
          <div className="holo-telemetry-status">
            <span className="holo-live-dot" />
            <span>
              {lang === 'ar'
                ? 'عرض هولوغرافي // قفل القياسات الحيوية'
                : 'HOLO-PROJECTION // TELEMETRY LOCK'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="holo-close-btn"
            aria-label={t.hologram.closeAria}
            title={t.hologram.closeAria}
          >
            <X size={16} />
          </button>
        </div>

        {/* Animated Content Transition when switching between equipment */}
        <AnimatePresence mode="wait">
          <motion.div
            key={landmark.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="holo-panel-body"
          >
            {/* Classification & Agency Pills */}
            <div className="holo-badge-row">
              <span className="holo-badge-kind">{kindLabel}</span>
              <span className="holo-badge-agency">{landmark.agency}</span>
              <span className="holo-badge-years">{landmark.years}</span>
            </div>

            {/* Equipment Name & Mission Title */}
            <h2 className="holo-equipment-name">{landmark.name}</h2>
            <div className="holo-mission-name">{landmark.missionName}</div>

            {/* Technical Telemetry Spec Grid */}
            <div className="holo-spec-grid">
              <div className="holo-spec-cell">
                <div className="holo-spec-label">
                  <Globe2 size={11} />
                  <span>{lang === 'ar' ? 'الجرم السماوي' : 'DESTINATION BODY'}</span>
                </div>
                <div className="holo-spec-value">
                  {destinationBody ? destinationBody.name : landmark.bodyId.toUpperCase()}
                </div>
              </div>

              <div className="holo-spec-cell">
                <div className="holo-spec-label">
                  <Building2 size={11} />
                  <span>{t.hologram.telemetryAgency}</span>
                </div>
                <div className="holo-spec-value">{landmark.agency}</div>
              </div>

              <div className="holo-spec-cell full-width">
                <div className="holo-spec-label">
                  <Calendar size={11} />
                  <span>{t.hologram.telemetryLandingDate}</span>
                </div>
                <div className="holo-spec-value">
                  {landmark.landingDate}{' '}
                  <span className="holo-spec-dim">({landmark.years})</span>
                </div>
              </div>

              <div className="holo-spec-cell full-width">
                <div className="holo-spec-label">
                  <MapPin size={11} />
                  <span>{t.hologram.telemetryLandingSite}</span>
                </div>
                <div className="holo-spec-value">{landmark.landingSite}</div>
              </div>

              <div className="holo-spec-cell full-width">
                <div className="holo-spec-label">
                  <Activity size={11} />
                  <span>{t.hologram.missionOutcomeTitle}</span>
                </div>
                <div className="holo-spec-value holo-status-highlight">
                  <ShieldCheck size={13} className="holo-status-icon" />
                  <span>{landmark.status}</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs for Description, Scientific Discoveries, and Mission Facts */}
            <div className="holo-subtabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`holo-subtab ${activeTab === 'overview' ? 'active' : ''}`}
              >
                {t.hologram.tabs.overview}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'science'}
                onClick={() => setActiveTab('science')}
                className={`holo-subtab ${activeTab === 'science' ? 'active' : ''}`}
              >
                {t.hologram.tabs.science}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'facts'}
                onClick={() => setActiveTab('facts')}
                className={`holo-subtab ${activeTab === 'facts' ? 'active' : ''}`}
              >
                {t.hologram.tabs.facts} ({landmark.story.facts.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="holo-description-box">
              {activeTab === 'overview' && (
                <>
                  <p className="holo-description-text">{landmark.shortDescription}</p>
                  <div className="holo-outcome-note">
                    <span className="holo-outcome-label">
                      {lang === 'ar' ? 'النتيجة التاريخية //' : 'HISTORICAL OUTCOME //'}
                    </span>{' '}
                    {landmark.story.fate}
                  </div>
                </>
              )}

              {activeTab === 'science' && (
                <>
                  <p className="holo-description-text">{landmark.story.science}</p>
                  <div className="holo-outcome-note">
                    <span className="holo-outcome-label">
                      {lang === 'ar'
                        ? 'سبب اختيار موقع الهبوط //'
                        : 'LANDING SITE SELECTION //'}
                    </span>{' '}
                    {landmark.story.why}
                  </div>
                </>
              )}

              {activeTab === 'facts' && (
                <ul className="holo-facts-list">
                  {landmark.story.facts.map((fact, idx) => (
                    <li key={idx} className="holo-fact-item">
                      <Sparkles size={12} className="holo-fact-bullet" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Equipment Quick-Switcher (strictly scoped to the currently selected celestial body) */}
        <div className="holo-switcher-section">
          <div className="holo-switcher-header">
            <span className="holo-switcher-title">
              <Compass size={11} />
              {lang === 'ar'
                ? `معدات ${destinationBody?.name ?? ''} (${bodyEquipment.length})`
                : `${destinationBody?.name.toUpperCase() ?? 'BODY'} EQUIPMENT (${bodyEquipment.length})`}
            </span>
          </div>

          <div className="holo-switcher-pills">
            {bodyEquipment.map((item) => {
              const isCurrent = item.id === landmark.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectEquipment(item.id)}
                  className={`holo-switch-pill ${isCurrent ? 'active' : ''}`}
                >
                  <span className="holo-switch-dot" />
                  <span className="holo-switch-name">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="holo-panel-actions">
          <button
            type="button"
            onClick={() => onLaunchTimeline(landmark.id)}
            className="holo-action-primary"
          >
            <Play size={14} />
            <span>
              {lang === 'ar'
                ? 'تشغيل القصة التفاعلية والاختبار'
                : 'Launch Mission Replay & Quiz'}
            </span>
          </button>
          <button type="button" onClick={onClose} className="holo-action-secondary">
            <span>{t.hologram.exitHologram}</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
});

export default HologramEquipmentPanel;
