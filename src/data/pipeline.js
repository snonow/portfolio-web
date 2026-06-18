export const pipelineStages = [
  { id: "ingestion",  title: "Ingestion",        desc: "Continuous crawling from selected sources with deduplication and basic validation." },
  { id: "scoring",    title: "Semantic Scoring", desc: "LLM-assisted and embedding-based scoring with explainable features." },
  { id: "threshold",  title: "Thresholding",     desc: "System-level operating constraints." },
  { id: "extraction", title: "Extraction",       desc: "Paragraph-level semantic extraction with traceability." },
  { id: "export",     title: "Delivery",         desc: "Structured export to downstream systems." },
  { id: "monitoring", title: "Monitoring",       desc: "Drift detection and coverage tracking." },
];
