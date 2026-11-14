import { useMemo, useState } from 'react';
import type { ResourceType, PlanetResource } from '../../data/resources';
import { useLanguage } from '../../i18n/LanguageContext';
import './ResourcesSection.css';

interface ResourcesSectionProps {
  planetId?: string;
  planetName: string;
  onResourceExplore?: (resourceKey: string) => void;
}

const filters = ['All', 'Article', 'Video', 'Explore', 'Research'] as const;

const typeIcons: Record<ResourceType, string> = {
  Article: '📖',
  Video: '▶',
  Explore: '🌍',
  Research: '🔬',
};

export default function ResourcesSection({
  planetId,
  planetName,
  onResourceExplore,
}: ResourcesSectionProps) {
  const { lang, isRtl, t, getLocalizedResources } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [search, setSearch] = useState('');

  const planetKey = (planetId ?? planetName).toLowerCase().trim();

  const resources: PlanetResource[] = useMemo(
    () => getLocalizedResources(planetKey),
    [planetKey, getLocalizedResources]
  );

  const filterLabels: Record<(typeof filters)[number], string> = {
    All: t.resources.filterAll,
    Article: t.resources.types.article,
    Video: t.resources.types.video,
    Explore: t.resources.types.interactive,
    Research: t.resources.types.research,
  };

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesFilter = activeFilter === 'All' || resource.type === activeFilter;
      const query = search.toLowerCase();

      const matchesSearch =
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.source.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [resources, activeFilter, search]);

  return (
    <section className="resources-section" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="resources-header">
        <div>
          <span className="resources-eyebrow">{t.resources.sectionTitle}</span>

          <h2>{lang === 'ar' ? 'استكشف وتعلّم' : 'Explore & Learn'}</h2>

          <p>
            {lang === 'ar'
              ? `اكتشف المعرفة العلمية، والتجارب التفاعلية، والمهمات الفضائية المرتبطة بـ ${planetName}.`
              : `Discover scientific knowledge, interactive experiences, and space missions related to ${planetName}.`}
          </p>
        </div>

        <div className="resources-count">
          <span>{resources.length}</span>
          <small>{lang === 'ar' ? 'مصادر' : 'RESOURCES'}</small>
        </div>
      </div>

      {/* Search */}
      <div className="resources-toolbar">
        <div className="resources-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder={t.resources.searchPlaceholder(planetName)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="resources-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? 'active' : ''}
              onClick={() => setActiveFilter(filter)}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      {filteredResources.length > 0 ? (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <article className="resource-card" key={resource.id}>
              {/* Image */}
              <div className="resource-image">
                <img src={resource.image} alt={resource.title} loading="lazy" />

                <span
                  className={`resource-type type-${resource.type.toLowerCase()}`}
                >
                  {typeIcons[resource.type]}{' '}
                  {filterLabels[resource.type as (typeof filters)[number]]}
                </span>
              </div>

              {/* Content */}
              <div className="resource-content">
                <div className="resource-source">
                  <span className="source-dot" />
                  {resource.source}
                </div>

                <h3>{resource.title}</h3>

                <p>{resource.description}</p>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link"
                  onClick={() =>
                    onResourceExplore?.(`resource-${planetKey}-${resource.id}`)
                  }
                >
                  {lang === 'ar' ? 'استعرض المصدر' : 'Explore Resource'}
                  <span>{isRtl ? '↖' : '↗'}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="resources-empty">
          <span>🔭</span>
          <h3>{lang === 'ar' ? 'لم يتم العثور على مصادر' : 'No resources found'}</h3>
          <p>
            {lang === 'ar'
              ? 'جرّب عبارة بحث أخرى أو اختر تصنيفاً مختلفاً.'
              : 'Try another search or select a different category.'}
          </p>
        </div>
      )}
    </section>
  );
}
