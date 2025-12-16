import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
// On garde Lucide pour les icônes d'interface (Mail, Globe, etc.)
import { Briefcase, Database, Globe, Award, Mail } from 'lucide-react';
// On importe les icônes de marque depuis simple-icons
import { siGithub, siLinkedin } from 'simple-icons/icons';
import { motion } from 'framer-motion';

// --- COMPOSANT UTILITAIRE POUR SIMPLE ICONS ---
// Ce composant transforme les données brutes de simple-icons en SVG React
const BrandIcon = ({ icon, size = 24, className = "" }) => (
  <svg 
    role="img" 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    className={`fill-current ${className}`} // fill-current permet d'utiliser la couleur du texte parent (Tailwind)
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{icon.title}</title>
    <path d={icon.path} />
  </svg>
);

// --- DONNÉES SIMULÉES (EARTHQUAKES) ---
const earthquakeData = [
  { id: 1, depth: 10, magnitude: 2.5, location: "Tokyo Bay" },
  { id: 2, depth: 30, magnitude: 4.2, location: "Chiba" },
  { id: 3, depth: 14, magnitude: 3.1, location: "Saitama" },
  { id: 4, depth: 50, magnitude: 5.8, location: "Pacific Ocean" },
  { id: 5, depth: 20, magnitude: 2.9, location: "Kanagawa" },
  { id: 6, depth: 80, magnitude: 6.1, location: "Hokkaido" },
  { id: 7, depth: 15, magnitude: 3.5, location: "Kyoto" },
  { id: 8, depth: 45, magnitude: 4.9, location: "Fukushima" },
  { id: 9, depth: 5, magnitude: 1.8, location: "Shinjuku" },
  { id: 10, depth: 60, magnitude: 5.2, location: "Sendai" },
];

// --- DONNÉES PROJETS ---
const projects = [
  {
    id: 1,
    title: "Pipeline MLOps Hybride",
    company: "Kagawa University (Japon)",
    role: "Research Intern",
    desc: "Conception d'un pipeline MLOps complet et publication d'un papier de recherche sur l'optimisation des modèles.",
    tags: ["Python", "MLOps", "Research", "Docker"],
    metrics: "1 Publication Académique"
  },
  {
    id: 2,
    title: "Gestion & Stratégie",
    company: "Junior PAC (Junior Entreprise)",
    role: "Président",
    desc: "Pilotage d'une équipe d'ingénieurs et gestion de la relation client. Garantie de la qualité des livrables.",
    tags: ["Management", "Relation Client", "Gestion Budget"],
    metrics: "~60k€ de CA géré"
  },
  {
    id: 3,
    title: "BI & Data Engineering",
    company: "PwC Luxembourg",
    role: "Incoming Trainee",
    desc: "Préparation de pipelines ETL complexes (SSIS) et dashboards décisionnels (Power BI) pour le secteur financier.",
    tags: ["SSIS", "Power BI", "SQL Server", "Finance"],
    metrics: "High-stakes Data"
  }
];

const Portfolio = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 h-16 flex items-center justify-between px-6 lg:px-12">
        <div className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white font-mono text-sm">AW</div>
          <span>Arno Wilhelm</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <a href="#dashboard" className="hover:text-blue-900 transition-colors">Dashboard</a>
          <a href="#demo" className="hover:text-blue-900 transition-colors">Live Demo</a>
          <a href="#projects" className="hover:text-blue-900 transition-colors">Projets</a>
        </div>
        <button className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-medium transition-all shadow-lg shadow-blue-900/20">
          Me Contacter
        </button>
      </nav>

      <main className="pt-24 px-6 lg:px-12 max-w-7xl mx-auto pb-20">
        
        {/* HERO */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-4">
            DATA ENGINEER FREELANCE
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Je transforme la donnée brute <br />
            <span className="text-blue-900">en intelligence business.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Spécialisé en Business Intelligence et Automatisation. 
            Une approche rigoureuse acquise chez PwC et en recherche académique.
          </p>
        </motion.div>

        {/* KPI GRID */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          <KpiCard icon={<Briefcase size={20}/>} title="Budget Géré (JE)" value="~60k €" color="bg-blue-50 text-blue-900" />
          <KpiCard icon={<Award size={20}/>} title="Recherche" value="1 Paper" color="bg-emerald-50 text-emerald-900" />
          <KpiCard icon={<Database size={20}/>} title="Stack Technique" value="Full BI/Data" color="bg-indigo-50 text-indigo-900" />
          <KpiCard icon={<Globe size={20}/>} title="Mobilité" value="3 Pays" color="bg-amber-50 text-amber-900" />
        </motion.div>

        {/* LIVE DEMO SECTION */}
        <section id="demo" className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-900 rounded-sm"></span>
              Live Data Visualization
            </h2>
            <span className="text-sm text-slate-500 bg-white border px-3 py-1 rounded-full">
              Source: Mock Earthquake Data
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-600 mb-6 max-w-3xl">
              Démonstration interactive (React + Recharts). Visualisation de la corrélation entre 
              <strong> profondeur</strong> et <strong>magnitude</strong> des séismes.
              <br/><span className="text-sm italic text-slate-400">Passez la souris sur les points pour voir les détails.</span>
            </p>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="depth" name="Profondeur" unit="km" stroke="#64748b" label={{ value: 'Profondeur (km)', position: 'bottom', offset: 0 }} />
                  <YAxis type="number" dataKey="magnitude" name="Magnitude" stroke="#64748b" label={{ value: 'Magnitude (Richter)', angle: -90, position: 'left' }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="Séismes" data={earthquakeData} fill="#1e293b">
                    {earthquakeData.map((entry, index) => (
                       <circle key={`cell-${index}`} cx="0" cy="0" r={entry.magnitude * 2} className="fill-blue-600 opacity-70 hover:opacity-100 transition-opacity" />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-8">
            <span className="w-2 h-8 bg-blue-900 rounded-sm"></span>
            Expériences Clés
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER MODIFIÉ AVEC SIMPLE ICONS */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-6 mb-8">
            
            {/* Github via Simple Icons */}
            <a href="https://github.com/TonUser" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <BrandIcon icon={siGithub} size={24} />
            </a>

            {/* LinkedIn via Simple Icons */}
            <a href="https://linkedin.com/in/TonUser" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <BrandIcon icon={siLinkedin} size={24} />
            </a>

            {/* Mail via Lucide (Car "Email" n'est pas une marque, c'est mieux d'utiliser un icône générique) */}
            <a href="mailto:arnowilhelm3@icloud.com" className="hover:text-white transition-colors">
              <Mail size={24} />
            </a>

          </div>
          <p className="text-sm">
            © 2025 Arno Wilhelm. Conçu comme un Dashboard React.
          </p>
        </div>
      </footer>
    </div>
  );
};

// --- SUBSIDIARY COMPONENTS ---

const KpiCard = ({ title, value, icon, color }) => (
  <motion.div 
    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
      {icon}
    </div>
    <div className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-1">{title}</div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
  </motion.div>
);

const ProjectCard = ({ project, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white rounded-xl overflow-hidden border border-slate-200 flex flex-col hover:border-blue-300 transition-colors group"
  >
    <div className="h-2 bg-slate-100 group-hover:bg-blue-600 transition-colors w-full"></div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{project.title}</h3>
          <p className="text-sm text-slate-500 font-medium">{project.company}</p>
        </div>
        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
          {project.role}
        </span>
      </div>
      
      <p className="text-slate-600 text-sm mb-6 flex-1 leading-relaxed">
        {project.desc}
      </p>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600">
              {tag}
            </span>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center text-blue-700 text-sm font-semibold">
           <Award size={16} className="mr-2" />
           {project.metrics}
        </div>
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white text-xs p-3 rounded shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{data.location}</p>
        <p>Magnitude: <span className="text-blue-300">{data.magnitude}</span></p>
        <p>Profondeur: {data.depth} km</p>
      </div>
    );
  }
  return null;
};

export default Portfolio;