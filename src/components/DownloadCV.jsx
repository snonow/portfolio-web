import { useEffect, useRef, useState } from "react";
import { Download, ChevronDown } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

const FILES = [
  { label: "English (PDF)", href: `${BASE}resume/Arno-Wilhelm-CV-EN.pdf` },
  { label: "Français (PDF)", href: `${BASE}resume/Arno-Wilhelm-CV-FR.pdf` },
];

const DownloadCV = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 bg-blue-900 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-blue-800 transition shadow-sm"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download size={16} />
        Download CV
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute z-30 mt-2 right-0 min-w-[200px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          {FILES.map((f) => (
            <li key={f.href} role="none">
              <a
                role="menuitem"
                href={f.href}
                download
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-800"
                onClick={() => setOpen(false)}
              >
                <Download size={14} />
                {f.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DownloadCV;
