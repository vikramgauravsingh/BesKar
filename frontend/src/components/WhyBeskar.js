import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, CheckCircle, ArrowRight, ArrowDown } from 'lucide-react';

const WhyBeskar = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const comparisons = [
    { before: "10+ separate tools for security operations", after: "One unified platform with 6 integrated modules" },
    { before: "Manual IOC extraction from emails and logs", after: "Automated extraction with multi-source reputation scoring" },
    { before: "Spreadsheets for compliance tracking", after: "Framework-based management with 50+ compliance frameworks" },
    { before: "No visibility into code vulnerabilities", after: "176+ security rules with SAST, DAST, dependency & IaC analysis" },
    { before: "Hours spent on threat research daily", after: "Real-time aggregated threat intelligence from 15+ sources" },
    { before: "Manual penetration testing only", after: "AI Pentest Agent with autonomous testing & HackerOne import" },
    { before: "Manual risk assessment spreadsheets", after: "Interactive risk heatmaps with KRI monitoring" },
    { before: "No cloud security visibility", after: "Amidala CSPM with 185 checks across AWS, Azure, GCP" },
  ];

  const costStats = [
    { value: "$4.45M", label: "Avg. data breach cost", source: "IBM Security" },
    { value: "207", label: "Days to identify a breach", source: "Industry Average" },
    { value: "70%", label: "Audit time reduction", source: "With Beskar Platform" },
    { value: "40%", label: "Tool licensing savings", source: "Platform Consolidation" },
  ];

  return (
    <section id="why-beskar" className="py-20 md:py-32 relative" ref={ref} data-testid="why-beskar-section">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          className="max-w-3xl mb-12 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Why Beskar</span>
          <h2 className="font-heading text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6">
            The problem we solve<br />
            <span className="text-slate-500">and the difference we make</span>
          </h2>
          <p className="text-base md:text-lg text-slate-400">
            Modern cybersecurity teams juggle 10-50+ tools daily. Beskar unifies security operations, compliance, vulnerability scanning, and threat intelligence into one platform.
          </p>
        </motion.div>

        {/* Cost Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16">
          {costStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="p-4 md:p-6 bg-beskar-paper border border-slate-800 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-testid={`cost-stat-${index}`}
            >
              <div className="font-heading text-2xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-xs md:text-sm mb-1">{stat.label}</div>
              <div className="text-slate-600 text-xs hidden sm:block">{stat.source}</div>
            </motion.div>
          ))}
        </div>

        {/* Before/After Comparison - Desktop */}
        <div className="hidden md:block space-y-3">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4 px-4">
            <span className="text-red-400/80 font-mono text-xs uppercase tracking-wider">Before</span>
            <span className="w-4"></span>
            <span className="text-emerald-400/80 font-mono text-xs uppercase tracking-wider">After Beskar</span>
          </div>
          {comparisons.map((item, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 bg-beskar-paper/50 border border-slate-800/50 hover:border-slate-700 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
              data-testid={`comparison-${index}`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">{item.before}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-beskar-cyan flex-shrink-0" />
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{item.after}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Before/After Comparison - Mobile */}
        <div className="md:hidden space-y-4">
          {comparisons.map((item, index) => (
            <motion.div
              key={index}
              className="p-4 bg-beskar-paper/50 border border-slate-800/50 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.06 }}
              data-testid={`comparison-mobile-${index}`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-500 text-sm">{item.before}</span>
              </div>
              <div className="flex justify-center">
                <ArrowDown className="w-4 h-4 text-beskar-cyan" />
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400/70 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{item.after}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBeskar;
