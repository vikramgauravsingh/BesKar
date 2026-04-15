import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GitBranch, Database, Shield, Cloud, Zap, ChevronRight, Brain, Cpu, Sparkles } from 'lucide-react';

const WhatsNew = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const highlights = [
    { title: "STRIDE Threat Modeling", desc: "Interactive drag-and-drop data flow diagrams with React Flow for comprehensive threat analysis", icon: GitBranch },
    { title: "DPDPA Consent Manager", desc: "Full India DPDPA 2023 compliance suite with consent tracking, DSR management, and PII scanning", icon: Shield },
    { title: "Multi-Database PII Scanner", desc: "Scans PostgreSQL, MySQL, SQL Server, MongoDB for 14 PII categories with violation checks", icon: Database },
    { title: "Consent Banner Builder", desc: "Visual builder for DPDPA consent banners with embeddable JS and React component exports", icon: Sparkles },
    { title: "Breach Notification Tracker", desc: "72-hour DPB countdown timer with auto-generated notification letters for DPB and data principals", icon: Zap },
    { title: "185 Cloud Security Controls", desc: "Expanded Amidala CSPM catalog with multi-cloud controls across AWS, Azure, and GCP", icon: Cloud },
  ];

  const roadmap = [
    {
      phase: "Phase 1 - v3.0",
      title: "AI-Powered GRC Automation",
      items: ["AI Policy Generator with framework-aware generation", "AI Evidence Collector with audit-ready packaging", "Cross-framework harmonization and gap analysis", "Natural language compliance summaries"],
      icon: Brain,
      status: "planned"
    },
    {
      phase: "Phase 2 - v3.5",
      title: "AI Vulnerability Assessment",
      items: ["Shannon-inspired autonomous penetration testing", "Risk score impact analysis integrated with GRC", "Evidence auto-generation for compliance", "Continuous testing with remediation tracking"],
      icon: Cpu,
      status: "planned"
    },
    {
      phase: "Phase 3 - v4.0",
      title: "AI Cloud Security Advisor",
      items: ["Intelligent cloud-provider-specific remediation scripts", "Drift detection and blast radius analysis", "Cost-optimized security recommendations", "Compliance prediction and proactive alerts"],
      icon: Cloud,
      status: "future"
    },
    {
      phase: "Phase 4 - v5.0",
      title: "Unified AI Security Platform",
      items: ["Natural language interface for security queries", "Predictive risk modeling with ML", "GitOps-based Compliance-as-Code", "Autonomous remediation with approval workflows"],
      icon: Sparkles,
      status: "future"
    },
  ];

  return (
    <section id="whats-new" className="py-32 bg-beskar-paper/50 relative" ref={ref} data-testid="whats-new-section">
      <div className="max-w-7xl mx-auto px-6">
        {/* Latest Release */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Latest Release</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            What's new in<br />
            <span className="text-slate-500">Beskar v3.0</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl">
            Our biggest release yet - introducing STRIDE threat modeling, comprehensive India DPDPA compliance, multi-database PII scanning, and expanded cloud security controls.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              className="group p-6 bg-beskar-bg border border-slate-800 hover:border-beskar-cyan/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-testid={`release-feature-${index}`}
            >
              <div className="p-2 bg-beskar-cyan/10 border border-beskar-cyan/30 w-fit mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 text-beskar-cyan" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Roadmap */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">AI-Enhanced Roadmap</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
            The future of<br />
            <span className="text-slate-500">autonomous security</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl">
            Our Shannon-inspired AI roadmap brings autonomous intelligence to every module of the platform - from policy generation to penetration testing to cloud remediation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {roadmap.map((phase, index) => (
            <motion.div
              key={phase.phase}
              className={`p-8 border transition-all ${phase.status === 'planned' ? 'bg-beskar-bg border-beskar-cyan/20 hover:border-beskar-cyan/40' : 'bg-beskar-bg/50 border-slate-800 hover:border-slate-700'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.12 }}
              data-testid={`roadmap-phase-${index + 1}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 border ${phase.status === 'planned' ? 'bg-beskar-cyan/10 border-beskar-cyan/30' : 'bg-slate-800/50 border-slate-700'}`}>
                  <phase.icon className={`w-5 h-5 ${phase.status === 'planned' ? 'text-beskar-cyan' : 'text-slate-500'}`} />
                </div>
                <div>
                  <span className={`font-mono text-xs ${phase.status === 'planned' ? 'text-beskar-cyan' : 'text-slate-600'}`}>{phase.phase}</span>
                  <h3 className="font-heading text-lg font-semibold text-white">{phase.title}</h3>
                </div>
                {phase.status === 'planned' && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-mono bg-beskar-cyan/10 text-beskar-cyan border border-beskar-cyan/30">Planned</span>
                )}
              </div>
              <div className="space-y-2">
                {phase.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <ChevronRight className={`w-3 h-3 flex-shrink-0 ${phase.status === 'planned' ? 'text-beskar-cyan' : 'text-slate-600'}`} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatsNew;
