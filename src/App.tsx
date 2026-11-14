import { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import Scene from './components/Scene';
import UI from './components/UI';
import { getLandmark } from './data/landmarks';
import { CinematicTimeline } from './lib/CinematicTimeline';
import type { HologramDisplayMode } from './lib/hologramShader';
import {
  loadExplorationState,
  recordActivity,
  type CelebrationEvent,
  type DailyMission,
  type ExplorationState,
} from './lib/streak';

function App() {
  const [isExploring, setIsExploring] = useState(false);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [inspectedLandmarkId, setInspectedLandmarkId] = useState<string | null>(null);
  const [activeLandmarkId, setActiveLandmarkId] = useState<string | null>(null);
  const [hologramDisplayMode, setHologramDisplayMode] = useState<HologramDisplayMode>('hologram');
  const [rescanKey, setRescanKey] = useState(0);
  const [streakState, setStreakState] = useState<ExplorationState>(() => loadExplorationState());
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);
  const timeline = useMemo(() => new CinematicTimeline(), []);

  const pushActivity = useCallback(
    (
      activity:
        | { type: 'planet'; bodyId: string }
        | { type: 'landmark'; landmarkId: string; bodyId: string; kind: string }
        | { type: 'fact'; key: string }
        | {
            type: 'quiz';
            landmarkId: string;
            bodyId: string;
            correct: number;
            total: number;
            maxXp: number;
          }
    ) => {
      setStreakState((prev) => {
        const { state, celebrations: newEvents } = recordActivity(prev, activity);
        if (newEvents.length > 0) {
          setCelebrations((q) => [...q, ...newEvents]);
        }
        return state;
      });
    },
    []
  );

  // Auto-advance celebration toast queue every 4.2 seconds
  useEffect(() => {
    if (celebrations.length === 0) return;
    const timer = setTimeout(() => {
      setCelebrations((q) => q.slice(1));
    }, 4200);
    return () => clearTimeout(timer);
  }, [celebrations]);

  const handleStartExplore = useCallback(() => {
    setIsExploring(true);
  }, []);

  const selectBody = useCallback(
    (id: string) => {
      setSelectedBodyId(id);
      setInspectedLandmarkId(null);
      pushActivity({ type: 'planet', bodyId: id });
    },
    [pushActivity]
  );

  const handleBodyClick = useCallback(
    (id: string, position?: THREE.Vector3) => {
      void position;
      if (isExploring) {
        selectBody(id);
      }
    },
    [isExploring, selectBody]
  );

  const handleBackClick = useCallback(() => {
    setInspectedLandmarkId(null);
    setSelectedBodyId(null);
  }, []);

  const handleInspectLandmark = useCallback(
    (landmarkId: string | null) => {
      if (!landmarkId) {
        setInspectedLandmarkId(null);
        return;
      }
      const landmark = getLandmark(landmarkId);
      if (!landmark) return;
      setSelectedBodyId(landmark.bodyId);
      setInspectedLandmarkId(landmarkId);
      setHologramDisplayMode('hologram');
      setRescanKey((k) => k + 1);
      pushActivity({
        type: 'landmark',
        landmarkId: landmark.id,
        bodyId: landmark.bodyId,
        kind: landmark.kind,
      });
    },
    [pushActivity]
  );

  const handleLandmarkSelect = useCallback(
    (landmarkId: string) => {
      const landmark = getLandmark(landmarkId);
      if (!landmark) return;

      setSelectedBodyId(landmark.bodyId);
      setInspectedLandmarkId(landmarkId);
      timeline.start(landmark.audioUrl, landmark.fallbackDuration);
      setActiveLandmarkId(landmarkId);
      pushActivity({
        type: 'landmark',
        landmarkId: landmark.id,
        bodyId: landmark.bodyId,
        kind: landmark.kind,
      });
    },
    [pushActivity, timeline]
  );

  const handleExitCinematic = useCallback(() => {
    timeline.stop();
    setActiveLandmarkId(null);
  }, [timeline]);

  const handleFactDiscover = useCallback(
    (key: string) => {
      pushActivity({ type: 'fact', key });
    },
    [pushActivity]
  );

  const handleQuizComplete = useCallback(
    (landmarkId: string, bodyId: string, correct: number, total: number, maxXp: number) => {
      pushActivity({ type: 'quiz', landmarkId, bodyId, correct, total, maxXp });
    },
    [pushActivity]
  );

  const handleLaunchDailyMission = useCallback(
    (mission: DailyMission) => {
      if (mission.actionLandmarkId) {
        handleLandmarkSelect(mission.actionLandmarkId);
      } else if (mission.actionBodyId) {
        selectBody(mission.actionBodyId);
      }
    },
    [handleLandmarkSelect, selectBody]
  );

  const handleChangeHologramMode = useCallback((mode: HologramDisplayMode) => {
    setHologramDisplayMode(mode);
    if (mode !== 'physical') setRescanKey((k) => k + 1);
  }, []);

  const handleTriggerRescan = useCallback(() => {
    setHologramDisplayMode('hologram');
    setRescanKey((k) => k + 1);
  }, []);

  const handleDismissCelebration = useCallback(() => {
    setCelebrations((q) => q.slice(1));
  }, []);

  return (
    <div className="app-shell">
      <Scene
        selectedBodyId={selectedBodyId}
        inspectedLandmarkId={inspectedLandmarkId}
        activeLandmarkId={activeLandmarkId}
        hologramDisplayMode={hologramDisplayMode}
        rescanKey={rescanKey}
        timeline={timeline}
        onBodyClick={handleBodyClick}
        onLandmarkClick={handleInspectLandmark}
      />
      <UI
        isExploring={isExploring}
        selectedBodyId={selectedBodyId}
        inspectedLandmarkId={inspectedLandmarkId}
        activeLandmarkId={activeLandmarkId}
        hologramDisplayMode={hologramDisplayMode}
        onChangeHologramMode={handleChangeHologramMode}
        onTriggerRescan={handleTriggerRescan}
        timeline={timeline}
        streakState={streakState}
        activeCelebration={celebrations[0] ?? null}
        onDismissCelebration={handleDismissCelebration}
        onStartExplore={handleStartExplore}
        onSelectBody={selectBody}
        onBackClick={handleBackClick}
        onInspectLandmark={handleInspectLandmark}
        onLandmarkSelect={handleLandmarkSelect}
        onExitCinematic={handleExitCinematic}
        onFactDiscover={handleFactDiscover}
        onQuizComplete={handleQuizComplete}
        onLaunchDailyMission={handleLaunchDailyMission}
      />
    </div>
  );
}

export default App;
