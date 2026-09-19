import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-brand-950 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo variant="light" />
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} Emergent Technologies. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
