import { ExternalLink } from "lucide-react";

// Wraps a heading fragment (company, school, project title) in a subtle
// external link when href is set; renders the children as-is otherwise.
const ExternalTextLink = ({ href, children }) =>
  href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-baseline gap-1 hover:text-blue-800 hover:underline decoration-slate-300 underline-offset-2 transition"
    >
      {children}
      <ExternalLink size={11} className="text-slate-400 self-center shrink-0" />
    </a>
  ) : (
    children
  );

export default ExternalTextLink;
