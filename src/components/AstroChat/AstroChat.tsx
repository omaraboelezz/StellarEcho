// src/components/AstroChat/AstroChat.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  Minus,
  RotateCcw,
  AlertCircle,
  Compass,
  Bot,
  MessageSquarePlus,
} from 'lucide-react';
import {
  classifyQueryIntent,
  getContextualSuggestions,
  type ExplorationContextInput,
} from '../../lib/astro/contextBuilder';
import {
  clearConversationHistory,
  loadConversationHistory,
  saveConversationHistory,
  type AstroMessage,
} from '../../lib/astro/conversationStore';
import { sendAstroMessage } from '../../lib/astro/client';
import { useLanguage } from '../../i18n/LanguageContext';

interface Props {
  isExploring: boolean;
  selectedBodyId: string | null;
  activeLandmarkId: string | null;
  drawerCollapsed?: boolean;
  timelineProgress?: number;
  currentStreak: number;
  totalXp: number;
}

const DEFAULT_SUGGESTIONS_EN = [
  'Tell me about Mars.',
  'How do planetary rovers work?',
  'What is the most interesting mission to the Moon?',
  'Why do some spacecraft remain on planetary surfaces?',
  'Explain how NASA explores other planets.',
];

const DEFAULT_SUGGESTIONS_AR = [
  'حدثني عن كوكب المريخ.',
  'كيف تعمل العربات الفضائية الجوالة (Rovers)؟',
  'ما هي أشهر مهمة تاريخية إلى سطح القمر؟',
  'لماذا تبقى بعض المركبات الفضائية على أسطح الكواكب؟',
  'اشرح كيف تستكشف وكالة ناسا الكواكب الأخرى.',
];

/** Lightweight formatter for bold (**text**) and bullet/numbered lines with RTL/LTR auto-direction. */
function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={i} style={{ height: '0.45rem' }} />;
    }
    const isBullet = /^[-•*]\s+/.test(trimmed);
    const cleanLine = isBullet ? trimmed.replace(/^[-•*]\s+/, '') : line;

    // Split on **bold**
    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
    const inline = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });

    if (isBullet) {
      return (
        <div key={i} className="astro-msg-bullet" dir="auto">
          <span className="astro-bullet-dot">•</span>
          <span>{inline}</span>
        </div>
      );
    }

    return (
      <p key={i} className="astro-msg-para" dir="auto">
        {inline}
      </p>
    );
  });
}

export default function AstroChat({
  isExploring,
  selectedBodyId,
  activeLandmarkId,
  drawerCollapsed = false,
  timelineProgress,
  currentStreak,
  totalXp,
}: Props) {
  const { lang, isRtl, t, getLocalizedBody, getLocalizedLandmark } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AstroMessage[]>(() =>
    loadConversationHistory()
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState(t.astro.thinkingStatus);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [modeNotice, setModeNotice] = useState<string | null>(null);
  const [hasUnreadContextHint, setHasUnreadContextHint] = useState(false);

  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const explorationContext: ExplorationContextInput = useMemo(
    () => ({
      isExploring,
      selectedBodyId,
      activeLandmarkId,
      timelineProgress,
      currentStreak,
      totalXp,
      uiLanguage: lang,
    }),
    [
      isExploring,
      selectedBodyId,
      activeLandmarkId,
      timelineProgress,
      currentStreak,
      totalXp,
      lang,
    ]
  );

  const activeLandmark = getLocalizedLandmark(activeLandmarkId);
  const selectedBody = getLocalizedBody(selectedBodyId);

  const contextLabel = activeLandmark
    ? `${t.astro.contextBadge.missionPrefix} // ${activeLandmark.name}`
    : selectedBody
      ? `${t.astro.contextBadge.exploringPrefix} // ${selectedBody.name}`
      : t.astro.contextBadge.solarSystemOverview;

  const contextualSuggestions = useMemo(
    () =>
      getContextualSuggestions(
        explorationContext,
        lang,
        activeLandmark?.name ?? selectedBody?.name
      ),
    [explorationContext, lang, activeLandmark?.name, selectedBody?.name]
  );

  const defaultSuggestions =
    lang === 'ar' ? DEFAULT_SUGGESTIONS_AR : DEFAULT_SUGGESTIONS_EN;

  // Subtle notification dot on the launcher when the user selects a new planet or mission while closed
  useEffect(() => {
    if (!isOpen && (selectedBodyId || activeLandmarkId)) {
      setHasUnreadContextHint(true);
    }
  }, [selectedBodyId, activeLandmarkId, isOpen]);

  // Persist messages whenever they update
  useEffect(() => {
    saveConversationHistory(messages);
  }, [messages]);

  // Auto-scroll to bottom on new messages, streaming chunks, or loading state
  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, isLoading, errorText, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnreadContextHint(false);
    setTimeout(() => inputRef.current?.focus(), 120);
  };

  const handleClearConversation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    inFlightRef.current = false;
    setIsLoading(false);
    setStreamingText(null);
    clearConversationHistory();
    setMessages([]);
    setErrorText(null);
    setLastFailedPrompt(null);
  };

  const handleSend = async (promptText?: string, options?: { isRetry?: boolean }) => {
    const textToSend = (promptText ?? input).trim();
    if (!textToSend || inFlightRef.current || isLoading) return;

    inFlightRef.current = true;

    if (!promptText) {
      setInput('');
    }
    setErrorText(null);
    setLastFailedPrompt(null);
    setStreamingText(null);

    const intent = classifyQueryIntent(textToSend, explorationContext);
    if (intent === 'contextual_telemetry') {
      if (activeLandmark) {
        setLoadingLabel(
          lang === 'ar'
            ? `جارٍ فحص سجل مهمة ${activeLandmark.name}…`
            : `Checking ${activeLandmark.name} mission log…`
        );
      } else if (selectedBody) {
        setLoadingLabel(
          lang === 'ar'
            ? `جارٍ قراءة بيانات ${selectedBody.name}…`
            : `Reading ${selectedBody.name} data…`
        );
      } else {
        setLoadingLabel(
          lang === 'ar' ? 'جارٍ البحث في سجلات المهمات…' : 'Looking up mission records…'
        );
      }
    } else {
      setLoadingLabel(t.astro.thinkingStatus);
    }

    let historyBeforeSend = messages;
    if (options?.isRetry) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === 'user' && lastMsg.text === textToSend) {
        historyBeforeSend = messages.slice(0, -1);
      }
    } else {
      const userMsg: AstroMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: textToSend,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    setIsLoading(true);
    const reqController = new AbortController();
    abortControllerRef.current = reqController;

    try {
      const res = await sendAstroMessage({
        message: textToSend,
        history: historyBeforeSend,
        explorationContext,
        signal: reqController.signal,
        onStreamUpdate: (partialText) => {
          setStreamingText(partialText);
        },
      });

      if (res.notice) {
        setModeNotice(res.notice);
      } else {
        setModeNotice(null);
      }

      const botMsg: AstroMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: res.reply,
        timestamp: Date.now(),
        mode: res.mode,
      };
      setStreamingText(null);
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      if (reqController.signal.aborted && !inFlightRef.current) {
        return;
      }
      setStreamingText(null);
      setErrorText(
        err?.message ||
          (lang === 'ar'
            ? 'تعذر الاتصال بـ Astro AI حالياً. يرجى إعادة المحاولة.'
            : 'Unable to reach Astro AI right now.')
      );
      setLastFailedPrompt(textToSend);
    } finally {
      inFlightRef.current = false;
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (!lastFailedPrompt || inFlightRef.current || isLoading) return;
    handleSend(lastFailedPrompt, { isRetry: true });
  };

  // Shift left on desktop when the right-side planet inspector drawer is open
  const drawerOpen = !!selectedBodyId && !activeLandmarkId;

  return (
    <div
      className={`astro-root ${drawerOpen ? 'with-drawer' : ''} ${drawerOpen && drawerCollapsed ? 'drawer-collapsed' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="astro-launcher"
            type="button"
            onClick={handleOpen}
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="astro-launcher interactive"
            aria-label={t.astro.fabAria}
          >
            <span className="astro-launcher-orb">
              <Sparkles size={20} color="#ffffff" />
            </span>
            <span className="astro-launcher-text">
              <span className="astro-launcher-title">{t.astro.fabTitle}</span>
              <span className="astro-launcher-sub">
                {activeLandmark
                  ? lang === 'ar'
                    ? `اسأل عن ${activeLandmark.name}`
                    : `Ask about ${activeLandmark.name}`
                  : selectedBody
                    ? lang === 'ar'
                      ? `اسأل عن ${selectedBody.name}`
                      : `Ask about ${selectedBody.name}`
                    : t.astro.fabSubtitle}
              </span>
            </span>
            {hasUnreadContextHint && <span className="astro-launcher-dot" />}
          </motion.button>
        ) : (
          <motion.section
            key="astro-window"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="astro-window glass-panel interactive"
            aria-label={t.astro.headerSubtitle}
          >
            {/* Header */}
            <header className="astro-header">
              <div className="astro-header-brand">
                <div className="astro-avatar">
                  <Bot size={20} color="#67b7ff" />
                  <span className="astro-online-dot" />
                </div>
                <div>
                  <div className="astro-header-title-row">
                    <h3>Astro AI</h3>
                    <span className="astro-status-tag">
                      {lang === 'ar' ? 'متصل' : 'ONLINE'}
                    </span>
                  </div>
                  <div className="astro-context-badge">
                    <Compass size={11} />
                    <span>{contextLabel}</span>
                  </div>
                </div>
              </div>

              <div className="astro-header-actions">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearConversation}
                    className="astro-icon-btn"
                    title={t.astro.clearChatTitle}
                    aria-label={t.astro.clearChatAria}
                  >
                    <MessageSquarePlus size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="astro-icon-btn"
                  title={t.astro.minimizeTitle}
                  aria-label={t.astro.minimizeAria}
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="astro-icon-btn"
                  title={t.astro.minimizeAria}
                  aria-label={t.astro.minimizeAria}
                >
                  <X size={16} />
                </button>
              </div>
            </header>

            {/* Body / Messages */}
            <div className="astro-messages">
              {/* Welcome Card */}
              <div className="astro-welcome-card">
                <div className="astro-welcome-greeting">{t.astro.welcomeTitle}</div>
                <p>{t.astro.welcomeBody}</p>
              </div>

              {/* Suggested Prompts when conversation is empty */}
              {messages.length === 0 && (
                <div className="astro-suggestions">
                  <div className="astro-suggestions-label">
                    {t.astro.suggestedQuestionsLabel}
                  </div>
                  <div className="astro-suggestions-list">
                    {(selectedBody || activeLandmark
                      ? contextualSuggestions
                      : defaultSuggestions
                    ).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="astro-suggestion-chip"
                      >
                        <Sparkles size={12} color="#67b7ff" style={{ flexShrink: 0 }} />
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation History */}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`astro-msg-row ${m.role === 'user' ? 'user' : 'model'}`}
                >
                  {m.role === 'model' && (
                    <div className="astro-msg-avatar">
                      <Sparkles size={13} color="#67b7ff" />
                    </div>
                  )}
                  <div className={`astro-msg-bubble ${m.role}`}>
                    {renderFormattedText(m.text)}
                  </div>
                </div>
              ))}

              {/* Contextual Quick Follow-Ups when conversation is active */}
              {messages.length > 0 && !isLoading && !errorText && (
                <div className="astro-quick-chips">
                  {contextualSuggestions.slice(0, 2).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="astro-quick-chip"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Live Streaming Assistant Response */}
              {isLoading && streamingText && (
                <div className="astro-msg-row model">
                  <div className="astro-msg-avatar">
                    <Sparkles size={13} color="#67b7ff" />
                  </div>
                  <div className="astro-msg-bubble model">
                    {renderFormattedText(streamingText)}
                  </div>
                </div>
              )}

              {/* Typing Indicator (only shown before first streamed chunk arrives) */}
              {isLoading && !streamingText && (
                <div className="astro-msg-row model">
                  <div className="astro-msg-avatar">
                    <Sparkles size={13} color="#67b7ff" />
                  </div>
                  <div className="astro-msg-bubble model typing">
                    <span className="astro-typing-dots">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="astro-typing-label">{loadingLabel}</span>
                  </div>
                </div>
              )}

              {/* Error Banner + Retry */}
              {errorText && (
                <div className="astro-error-card">
                  <div className="astro-error-row">
                    <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
                    <span>{errorText}</span>
                  </div>
                  {lastFailedPrompt && (
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="astro-retry-btn"
                    >
                      <RotateCcw size={13} />
                      {t.astro.retryQuestion}
                    </button>
                  )}
                </div>
              )}

              {modeNotice && <div className="astro-mode-notice">{modeNotice}</div>}

              <div ref={listEndRef} />
            </div>

            {/* Input Form */}
            <form
              className="astro-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                dir="auto"
                value={input}
                disabled={isLoading}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.astro.inputPlaceholder(
                  activeLandmark?.name ??
                    selectedBody?.name ??
                    t.astro.contextBadge.solarSystemAtlas
                )}
                className="astro-input"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="astro-send-btn"
                aria-label={t.astro.sendAria}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
