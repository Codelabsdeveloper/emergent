import { useCallback, useEffect, useRef, useState } from 'react';

const projects = [
  {
    title: 'Cloud Migration Suite',
    description: 'Secure lift-and-shift tooling that reduces downtime during enterprise cloud moves.',
    accent: 'from-teal-500/20 to-cyan-600/10',
  },
  {
    title: 'Smart Operations Hub',
    description: 'Unified dashboards that surface operational insights across distributed teams.',
    accent: 'from-sky-500/20 to-brand-700/10',
  },
  {
    title: 'Secure Identity Portal',
    description: 'Modern authentication experiences with strong session and access controls.',
    accent: 'from-emerald-500/20 to-teal-700/10',
  },
  {
    title: 'Data Insight Engine',
    description: 'Analytics pipelines that turn raw business events into actionable reports.',
    accent: 'from-cyan-400/20 to-slate-700/10',
  },
  {
    title: 'Digital Experience Platform',
    description: 'Responsive customer portals crafted for speed, accessibility, and trust.',
    accent: 'from-brand-600/20 to-accent-500/10',
  },
];

function useVisibleCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCount(1);
      else if (window.innerWidth < 1024) setCount(2);
      else setCount(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return count;
}

export default function WorkCarousel() {
  const visible = useVisibleCount();
  const maxIndex = Math.max(0, projects.length - visible);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    if (delta < -50) next();
    touchStartX.current = null;
  };

  return (
    <section id="our-work" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="work-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="work-heading" className="font-display text-2xl font-bold text-brand-900 sm:text-3xl">
            Our Work
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            A selection of platforms and services that reflect our approach to practical innovation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="btn-secondary !px-3"
            aria-label="Previous projects"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index === maxIndex}
            className="btn-secondary !px-3"
            aria-label="Next projects"
          >
            ›
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Project showcase"
      >
        <div
          className="flex gap-4 transition-transform duration-500 ease-out"
          style={{
            width: `${(projects.length / visible) * 100}%`,
            transform: `translateX(-${(index / projects.length) * 100}%)`,
          }}
        >
          {projects.map((project) => (
            <article
              key={project.title}
              className="card-surface flex h-full min-h-[260px] flex-col overflow-hidden"
              style={{ width: `${100 / projects.length}%` }}
            >
              <div className={`h-28 bg-gradient-to-br ${project.accent}`}>
                <div className="flex h-full items-center justify-center">
                  <div className="h-12 w-12 rounded-xl border border-white/40 bg-white/30 backdrop-blur-sm" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-brand-900">{project.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>
                <button type="button" className="btn-secondary mt-4 self-start !px-3 !py-2 text-xs">
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Carousel pagination">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === index ? 'bg-accent-600' : 'bg-slate-300 hover:bg-slate-400'
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
