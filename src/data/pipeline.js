export const filteringData = [
  { id: 1, recall: 92, relevance: 0.78, source: "Site A" },
  { id: 2, recall: 85, relevance: 0.82, source: "Site B" },
  { id: 3, recall: 97, relevance: 0.55, source: "Site C" },
  { id: 4, recall: 60, relevance: 0.90, source: "Site D" },
  { id: 5, recall: 75, relevance: 0.65, source: "Site E" },
  { id: 6, recall: 88, relevance: 0.72, source: "Site F" },
];

export const pipelineStages = [
  { id: "ingestion", title: "Ingestion", desc: "Continuous crawling from selected sources with deduplication and basic validation." },
  { id: "scoring", title: "Semantic Scoring", desc: "LLM-assisted and embedding-based scoring with explainable features." },
  { id: "threshold", title: "Thresholding", desc: "System-level operating constraints." },
  { id: "extraction", title: "Extraction", desc: "Paragraph-level semantic extraction with traceability." },
  { id: "export", title: "Delivery", desc: "Structured export to downstream systems." },
  { id: "monitoring", title: "Monitoring", desc: "Drift detection and coverage tracking." },
];