import { Moon, Sun, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark"><GraduationCap size={18} strokeWidth={2.2} /></span>
      <span className="brand-name">Campus Assist</span>
    </div>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);
  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('campus_theme', next);
    setTheme(next);
  };
  return (
    <button className="icon-btn" onClick={flip} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
