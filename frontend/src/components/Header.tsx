import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const links = [
  { href: '#about', label: 'About Us' },
  { href: '#our-work', label: 'Our Work' },
  { href: '#register', label: 'Register' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition duration-300 ${
        scrolled
          ? 'border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm'
          : 'border-transparent bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" aria-label="Emergent Technologies home" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-brand-800"
            >
              {link.label}
            </a>
          ))}
          <Link to="/admin" className="btn-secondary !px-4 !py-2 text-xs">
            Admin
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="relative h-4 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 bg-brand-900 transition ${
                open ? 'top-1.5 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-5 bg-brand-900 transition ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-5 bg-brand-900 transition ${
                open ? 'top-1.5 -rotate-45' : 'top-3'
              }`}
            />
          </div>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`border-t border-slate-200 bg-white md:hidden ${open ? 'block' : 'hidden'}`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3" aria-label="Mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/admin"
            className="rounded-lg px-3 py-3 text-base font-semibold text-brand-800 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Admin Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
