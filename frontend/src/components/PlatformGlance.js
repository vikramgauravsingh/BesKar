import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Bug, Zap, Cloud, Eye, Database, BookOpen, FileText } from 'lucide-react';

const PlatformGlance = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const metrics = [
    { value: "50+", label: "Compliance Frameworks", desc: "ISO 27001, SOC 2, GDPR, PCI DSS, HIPAA, NIST, DPDPA", icon: Shield },
    { value: "176+", label: "Security Rules", desc: "SAST, secrets, API, crypto, IaC, frontend scanning", icon: Bug },
    { value: "250+", label: "Attack Payloads", desc: "SQLi, XSS, SSRF, SSTI across 8 categories", icon: Zap },
    { value: "185", label: "Cloud Checks", desc: "AWS, Azure, GCP multi-cloud security controls", icon: Cloud },
    { value: "15+", label: "Threat Intel Sources", desc: "Integrated OSINT APIs for comprehensive analysis", icon: Eye },
    { value: "14", label: "PII Categories", desc: "Multi-database personal data scanner", icon: Database },
    { value: "16", label: "Training Modules", desc: "Security awareness with quizzes and badges", icon: BookOpen },
    { value: "7", label: "Report Formats", desc: "PDF, HTML, JSON, CSV, CycloneDX, SPDX, Markdown", icon: FileText },
  ];

  return (
    <section id="platform" className="py-16 md:py-24 relative" ref={ref} data-testid="platform-glance-section">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          className="mb-10 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Platform v3.0</span>
          <h2 className="font-heading text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6">
            Enterprise security<br />
            <span className="text-slate-500">by the numbers</span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-3xl">
            A unified cybersecurity platform consolidating GRC, threat intelligence, vulnerability scanning, cloud security, and data privacy into one powerful interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="group p-4 md:p-6 bg-beskar-paper border border-slate-800 hover:border-beskar-cyan/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <metric.icon className="w-4 h-4 md:w-5 md:h-5 text-beskar-cyan mb-2 md:mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-heading text-2xl md:text-4xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-white text-xs md:text-sm font-medium mb-1">{metric.label}</div>
              <div className="text-slate-500 text-xs leading-relaxed hidden sm:block">{metric.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformGlance;
