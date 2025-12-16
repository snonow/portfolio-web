function Hero() {
    return (
        <section className="mb-32 pt-8">
            {/* Badge */}
            <span className="inline-block mb-6 px-4 py-2 text-xs font-semibold tracking-wide bg-blue-100 text-blue-800 rounded-full">
            DATA ENGINEER · BUSINESS INTELLIGENCE · AUTOMATION
            </span>

            {/* Name */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-none">
            Arno Wilhelm
            </h1>

            {/* Core value proposition */}
            <p className="text-xl md:text-2xl text-slate-700 max-w-4xl leading-relaxed mb-6">
            I design <strong>reliable data pipelines</strong>,{" "}
            <strong>decision-ready dashboards</strong>, and{" "}
            <strong>controlled AI-assisted workflows</strong> for teams that need
            correctness, traceability, and business impact.
            </p>

            {/* Subtitle / role clarification */}
            <p className="text-md md:text-lg text-slate-500 max-w-3xl">
            Freelance Data Engineer / BI Engineer — experience in consulting (PwC),
            academic research, and client-facing delivery.  
            Working with international teams, remote-first.
            </p>
        </section>
    );
}

export default Hero