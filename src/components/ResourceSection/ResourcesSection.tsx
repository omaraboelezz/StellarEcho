import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Camera,
  FlaskConical,
  GraduationCap,
  Orbit,
  Rocket,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  planetResources,
  RESOURCE_CATEGORIES,
  type PlanetResource,
  type ResourceType,
} from '../../data/resources';
import { useLanguage } from '../../i18n/LanguageContext';
import './ResourcesSection.css';

interface ResourcesSectionProps {
  planetId?: string;
  planetName: string;
  onResourceExplore?: (resourceKey: string) => void;
}

type FilterOption = 'All' | ResourceType;

const CATEGORY_CLASS_MAP: Record<ResourceType, string> = {
  'Scientific Articles': 'cat-articles',
  'Space Missions': 'cat-missions',
  'Research & Discoveries': 'cat-research',
  'Images & Media': 'cat-media',
  'Educational Materials': 'cat-education',
  '3D & Interactive': 'cat-interactive',
};

function renderCategoryIcon(type: ResourceType, size = 13) {
  switch (type) {
    case 'Scientific Articles':
      return <BookOpen size={size} />;
    case 'Space Missions':
      return <Rocket size={size} />;
    case 'Research & Discoveries':
      return <FlaskConical size={size} />;
    case 'Images & Media':
      return <Camera size={size} />;
    case 'Educational Materials':
      return <GraduationCap size={size} />;
    case '3D & Interactive':
      return <Orbit size={size} />;
  }
}

export default function ResourcesSection({
  planetId,
  planetName,
  onResourceExplore,
}: ResourcesSectionProps) {
  const { lang, isRtl, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [search, setSearch] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [arResourceMap, setArResourceMap] = useState<
    Record<string, { title: string; description: string }> | null
  >(null);

  const planetKey = (planetId ?? planetName).toLowerCase().trim();

  // Lazily load Arabic resource translations only when Arabic is active
  useEffect(() => {
    if (lang !== 'ar' || arResourceMap) return;
    let alive = true;
    import('../../i18n/arQuizzesAndResources')
      .then((mod) => {
        if (alive) setArResourceMap(mod.arResourcesByTitle);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [lang, arResourceMap]);

  // Automatically reset filter and search when switching between planets
  useEffect(() => {
    setActiveFilter('All');
    setSearch('');
  }, [planetKey]);

  const resources: PlanetResource[] = useMemo(() => {
    const list = planetResources[planetKey] ?? [];
    if (lang !== 'ar' || !arResourceMap) return list;
    return list.map((res) => {
      const arRes = arResourceMap[res.title];
      if (!arRes) return res;
      return {
        ...res,
        title: arRes.title,
        description: arRes.description,
      };
    });
  }, [planetKey, lang, arResourceMap]);

  // Only include categories that have actual relevant resources for the selected planet
  const availableCategories = useMemo(() => {
    return RESOURCE_CATEGORIES.filter((category) =>
      resources.some((resource) => resource.type === category)
    );
  }, [resources]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: resources.length };
    for (const category of RESOURCE_CATEGORIES) {
      counts[category] = resources.filter((r) => r.type === category).length;
    }
    return counts;
  }, [resources]);

  const filterLabels: Record<FilterOption, string> = useMemo(
    () => ({
      All: t.resources.filterAll,
      'Scientific Articles': t.resources.types.scientificArticles,
      'Space Missions': t.resources.types.spaceMissions,
      'Research & Discoveries': t.resources.types.researchDiscoveries,
      'Images & Media': t.resources.types.imagesMedia,
      'Educational Materials': t.resources.types.educationalMaterials,
      '3D & Interactive': t.resources.types.interactive3D,
    }),
    [t]
  );

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesFilter = activeFilter === 'All' || resource.type === activeFilter;
      if (!matchesFilter) return false;
      if (!query) return true;

      const localizedTypeLabel = filterLabels[resource.type]?.toLowerCase() ?? '';
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.source.toLowerCase().includes(query) ||
        localizedTypeLabel.includes(query)
      );
    });
  }, [resources, activeFilter, search, filterLabels]);

  const handleImageError = (imageKey: string) => {
    setFailedImages((prev) => (prev[imageKey] ? prev : { ...prev, [imageKey]: true }));
  };

  const handleOpenResource = (resource: PlanetResource) => {
    onResourceExplore?.(`resource-${planetKey}-${resource.id}`);
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const resetFilters = () => {
    setActiveFilter('All');
    setSearch('');
  };

  return (
    <section className="resources-section" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="resources-header">
        <div className="resources-header-text">
          <div className="resources-eyebrow-row">
            <span className="resources-eyebrow">
              <Sparkles size={12} />
              {t.resources.sectionTitle}
            </span>
            <span className="resources-verified-pill">
              <ShieldCheck size={12} />
              {t.resources.verifiedBadge}
            </span>
          </div>

          <h2>{t.resources.sectionHeading(planetName)}</h2>

          <p>{t.resources.sectionSubtitle(planetName)}</p>
        </div>

        <div className="resources-count" aria-label={t.resources.countBadge(resources.length)}>
          <span>{resources.length}</span>
          <small>{t.resources.resourcesLabel}</small>
        </div>
      </div>

      {/* Search & Category Filters Toolbar */}
      <div className="resources-toolbar">
        <div className="resources-search">
          <Search size={15} className="resources-search-icon" />

          <input
            type="text"
            placeholder={t.resources.searchPlaceholder(planetName)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search.length > 0 && (
            <button
              type="button"
              className="resources-search-clear"
              onClick={() => setSearch('')}
              aria-label={t.resources.clearSearchAria}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dynamic Category Filters — only shown when relevant resources exist */}
        <div className="resources-filters" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'All'}
            className={`resource-filter-chip ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            <span>{filterLabels.All}</span>
            <span className="filter-chip-count">{categoryCounts.All}</span>
          </button>

          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeFilter === category}
              className={`resource-filter-chip ${CATEGORY_CLASS_MAP[category]} ${
                activeFilter === category ? 'active' : ''
              }`}
              onClick={() => setActiveFilter(category)}
            >
              {renderCategoryIcon(category, 12)}
              <span>{filterLabels[category]}</span>
              <span className="filter-chip-count">{categoryCounts[category]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="resources-grid">
          {filteredResources.map((resource) => {
            const imageKey = `${planetKey}-${resource.id}`;
            const imageFailed = Boolean(failedImages[imageKey]);
            const categoryClass = CATEGORY_CLASS_MAP[resource.type];

            return (
              <article
                className={`resource-card ${categoryClass}`}
                key={imageKey}
              >
                {/* Thumbnail Preview & Category Overlay */}
                <div className="resource-image">
                  {!imageFailed ? (
                    <img
                      src={resource.image}
                      alt={resource.title}
                      loading="lazy"
                      decoding="async"
                      onError={() => handleImageError(imageKey)}
                    />
                  ) : (
                    <div className="resource-image-fallback">
                      {renderCategoryIcon(resource.type, 32)}
                      <span>{resource.source}</span>
                    </div>
                  )}

                  <div className="resource-image-gradient" />

                  <span className={`resource-type resource-type-badge ${categoryClass}`}>
                    {renderCategoryIcon(resource.type, 12)}
                    <span>{filterLabels[resource.type]}</span>
                  </span>
                </div>

                {/* Card Body */}
                <div className="resource-content">
                  <div className="resource-source resource-source-row">
                    <span className="resource-source-badge">
                      <span className="source-dot" />
                      {resource.source}
                    </span>
                  </div>

                  <h3 className="resource-card-title">{resource.title}</h3>

                  <p className="resource-card-desc">{resource.description}</p>

                  <div className="resource-card-footer">
                    <button
                      type="button"
                      className={`resource-explore-btn resource-cta-btn resource-link ${categoryClass}`}
                      onClick={() => handleOpenResource(resource)}
                    >
                      <span className="resource-explore-btn-label">
                        {t.resources.exploreResourceBtn}
                      </span>
                      <span className="resource-explore-btn-icon" aria-hidden="true">
                        <ArrowUpRight size={15} />
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="resources-empty">
          <div className="resources-empty-icon">
            <Orbit size={28} />
          </div>
          <h3>{t.resources.emptyTitle}</h3>
          <p>
            {search.trim()
              ? t.resources.noMatchText(search.trim())
              : t.resources.emptySubtitle}
          </p>
          <button
            type="button"
            className="resources-reset-btn"
            onClick={resetFilters}
          >
            <RotateCcw size={13} />
            <span>{t.resources.resetFiltersBtn}</span>
          </button>
        </div>
      )}
    </section>
  );
}
