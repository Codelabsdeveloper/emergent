export default function Hero() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-b border-slate-200/60"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45,212,191,0.18),_transparent_55%),linear-gradient(135deg,#0b3a4a_0%,#0f4c5c_45%,#146377_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto flex min-h-[200px] max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-8 md:min-h-[200px] md:py-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-400 animate-[fadeUp_0.6s_ease-out]">
          Company introduction
        </p>
        <h1
          id="hero-heading"
          className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl animate-[fadeUp_0.7s_ease-out]"
        >
          Emergent Technologies
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base animate-[fadeUp_0.8s_ease-out]">
          We design and deliver reliable digital platforms that help organizations modernize,
          scale, and create lasting impact.
        </p>
        <p className="mt-3 font-display text-base font-semibold text-accent-400 sm:text-lg animate-[fadeUp_0.9s_ease-out]">
          Building Innovative Digital Solutions for Tomorrow.
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
