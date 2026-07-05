import { motion } from "framer-motion";
import { ExternalLink, Maximize2, X, FileText } from "lucide-react";

const ProjectExpandableCard = ({
  project,
  expanded = false,
  onOpen,
  onClose,
}) => {
  const {
    name,
    description,
    url,
    language,
    topics = [],
    readme_images = [],
    releases = [],
  } = project;

  return (
    <motion.div
      layout
      onClick={expanded ? (e) => e.stopPropagation() : onOpen}
      className={`group bg-white rounded-xl border border-slate-200 shadow-sm cursor-pointer ${
        expanded
          ? "w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          : "hover:border-blue-300 hover:shadow-md transition-shadow"
      }`}
    >
      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{name}</h3>
            {description && (
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {expanded ? (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          ) : (
            <Maximize2
              size={15}
              className="shrink-0 mt-1 text-slate-300 group-hover:text-blue-600 transition-colors"
              aria-hidden="true"
            />
          )}
        </div>

        {/* META */}
        <div className="flex flex-wrap gap-2 mb-4">
          {language && (
            <span className="text-xs px-2 py-1 bg-slate-100 rounded">
              {language}
            </span>
          )}
          {topics.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
            >
              {t}
            </span>
          ))}
        </div>

        {/* EXPANDED CONTENT */}
        {expanded && (
          <>
            {/* IMAGES */}
            {readme_images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {readme_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${name} visual ${idx}`}
                    className="rounded-lg border"
                  />
                ))}
              </div>
            )}

            {/* RELEASES */}
            {releases.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Releases
                </h4>
                <ul className="space-y-3">
                  {releases.map((r) => (
                    <li
                      key={r.tag}
                      className="border border-slate-200 rounded-lg p-3"
                    >
                      <div className="font-semibold">{r.tag}</div>
                      <p className="text-sm text-slate-600 mt-1">
                        {r.notes}
                      </p>
                      {(r.assets ?? []).map((a) => (
                        <a
                          key={a}
                          href={a}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-700 mt-2"
                        >
                          <FileText size={14} />
                          Release asset
                        </a>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* LINKS */}
            <div className="flex gap-4 mt-6">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
              >
                <ExternalLink size={14} />
                View repository
              </a>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectExpandableCard;
