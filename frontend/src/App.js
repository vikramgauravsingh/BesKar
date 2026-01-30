import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Globe, 
  Activity, 
  CheckCircle, 
  Server, 
  Eye, 
  Network, 
  FileSearch, 
  AlertTriangle,
  ArrowRight,
  Send,
  Menu,
  X,
  ChevronDown,
  Cloud,
  Code,
  FileText,
  Newspaper,
  Calculator,
  Bug,
  Layers,
  ClipboardCheck,
  Building,
  Briefcase,
  Target,
  Zap,
  Mail
} from 'lucide-react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const SUPPORT_EMAIL = 'support@beskarit.com';

// Smooth scroll hook
const useSmoothScroll = () => {
  useEffect(() => {
    let lenis;
    const initLenis = async () => {
      const Lenis = (await import('lenis')).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };
    initLenis();
    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);
};

// Animated counter hook
const useCounter = (end, duration = 2000, inView) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, inView]);
  
  return count;
};

// Navigation Component
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Products', href: '#products' },
    { name: 'Services', href: '#services' },
    { name: 'Compliance', href: '#compliance' },
    { name: 'Impact', href: '#impact' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav 
      data-testid="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3" data-testid="logo-link">
          <img 
            src="https://customer-assets.emergentagent.com/job_04619072-dd18-466a-b051-872e26ea17cf/artifacts/8uottcra_logo.png" 
            alt="Beskar IT" 
            className="h-10 w-auto"
          />
          <span className="font-heading font-bold text-xl text-white">Beskar IT</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href} 
              className="nav-link text-slate-400 hover:text-white transition-colors font-medium"
              data-testid={`nav-${item.name.toLowerCase()}`}
            >
              {item.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="btn-primary bg-slate-100 text-slate-900 hover:bg-white px-6 py-2.5 font-medium transition-colors"
            data-testid="nav-cta"
          >
            Get Started
          </a>
        </div>

        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass mt-4 mx-4 p-6 rounded-sm"
          data-testid="mobile-menu"
        >
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href} 
              className="block py-3 text-slate-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <a 
            href="#contact" 
            className="block mt-4 bg-slate-100 text-slate-900 text-center py-3 font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Get Started
          </a>
        </motion.div>
      )}
    </nav>
  );
};

// Hero Section
const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient"
      data-testid="hero-section"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-beskar-cyan/5 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: useTransform(scrollY, [0, 500], [0, 100]) }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-beskar-primary/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div 
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block px-4 py-2 mb-8 text-sm font-mono text-beskar-cyan border border-beskar-cyan/30 bg-beskar-cyan/5">
            Unified Compliance & Risk Reduction
          </span>
        </motion.div>

        <motion.h1 
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          data-testid="hero-title"
        >
          <span className="text-white">The standards we create</span>
          <br />
          <span className="gradient-text">serve as powerful ambassadors</span>
        </motion.h1>

        <motion.p 
          className="font-heading text-2xl md:text-4xl text-slate-400 mb-4 italic"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          data-testid="hero-tagline"
        >
          "This is the way"
        </motion.p>

        <motion.p 
          className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          We help align multiple frameworks to reduce duplicate work, audit fatigue, and overall cost.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <a 
            href="#products" 
            className="btn-primary inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-900 hover:bg-white px-8 py-4 font-medium text-lg transition-colors"
            data-testid="hero-cta-primary"
          >
            Explore Products
            <ArrowRight size={20} />
          </a>
          <a 
            href="#contact" 
            className="inline-flex items-center justify-center gap-2 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white px-8 py-4 font-medium text-lg transition-colors"
            data-testid="hero-cta-secondary"
          >
            Contact Us
          </a>
        </motion.div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <ChevronDown className="w-8 h-8 text-slate-600 animate-bounce" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Product Detail Modal
const ProductDetailModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        data-testid={`modal-${product.id}`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-beskar-paper border border-slate-800 p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
            data-testid="modal-close-button"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-beskar-cyan/10 border border-beskar-cyan/30">
              <product.icon className="w-8 h-8 text-beskar-cyan" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-white">{product.name}</h2>
              <p className="text-beskar-cyan">{product.tagline}</p>
            </div>
          </div>

          <p className="text-slate-400 mb-8 text-lg leading-relaxed">{product.fullDescription}</p>

          <h3 className="font-heading text-xl font-semibold text-white mb-4">Key Features</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {product.detailedFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-beskar-bg/50 border border-slate-800">
                <CheckCircle className="w-5 h-5 text-beskar-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">{feature.title}</h4>
                  <p className="text-slate-500 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {product.useCases && (
            <>
              <h3 className="font-heading text-xl font-semibold text-white mb-4">Use Cases</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {product.useCases.map((useCase, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-400">
                    <Target className="w-4 h-4 text-beskar-cyan flex-shrink-0" />
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <a 
            href="#contact" 
            onClick={onClose}
            className="btn-primary inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-900 hover:bg-white px-6 py-3 font-medium transition-colors"
            data-testid="modal-contact-button"
          >
            Request Demo
            <ArrowRight size={18} />
          </a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Products Section
const ProductsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    {
      id: "grc-nexus",
      name: "GRC Nexus",
      tagline: "Compliance Management Platform",
      description: "Comprehensive GRC platform supporting 8+ compliance frameworks with custom framework builder, policy management, and executive dashboards.",
      fullDescription: "GRC Nexus is your centralized compliance management solution supporting ISO 27001, SOC 2, GDPR, CCPA, PCI DSS, HIPAA, ISO 42001, and USPCF frameworks. With cross-framework mappings, automated policy generation, and real-time compliance tracking, reduce audit preparation time by 70%.",
      icon: ClipboardCheck,
      features: ["8+ compliance frameworks", "Custom framework builder", "Policy management", "Executive dashboards"],
      detailedFeatures: [
        { title: "Multi-Framework Support", description: "ISO 27001, SOC 2, GDPR, CCPA, PCI DSS, HIPAA, ISO 42001, USPCF with cross-framework mappings" },
        { title: "Custom Framework Builder", description: "Create custom frameworks or use pre-built templates for Startup Security, Healthcare, Fintech, SaaS" },
        { title: "Policy Management", description: "Rich text editor, pre-built templates, version control, and approval workflows" },
        { title: "Document & Evidence Management", description: "Chunked file upload, approval workflows, audit trail, and overdue indicators" },
        { title: "Executive GRC Dashboard", description: "Real-time compliance visibility, framework metrics, and pending approvals widget" },
        { title: "Compliance Trends", description: "Chart.js visualizations with historical data and AI-driven recommendations" }
      ],
      useCases: [
        "Reduce audit preparation time by 70%",
        "Ensure no controls are missed",
        "Leverage common controls across frameworks",
        "Maintain continuous compliance",
        "Single source of truth for compliance"
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&w=800&q=85"
    },
    {
      id: "beskar-osint",
      name: "Beskar OSINT Toolkit",
      tagline: "Open Source Intelligence Platform",
      description: "Comprehensive OSINT gathering and analysis with IOC Analyzer, Email Analyzer, IOC Extractor, and integrated threat intelligence from 15+ sources.",
      fullDescription: "The Beskar OSINT Toolkit provides comprehensive open-source intelligence capabilities including IOC analysis against 15+ threat intelligence sources, email threat extraction, bulk IOC processing, cybersecurity newsfeed aggregation, and CVSS 3.1 calculator.",
      icon: Eye,
      features: ["15+ threat intel sources", "IOC & Email analyzer", "Cybersecurity newsfeed", "CVSS calculator"],
      detailedFeatures: [
        { title: "IOC Analyzer", description: "Analyze IPv4, IPv6, Domain, URL, MD5, SHA1, SHA256, Email, CVE against VirusTotal, AbuseIPDB, Shodan, and 12+ more sources" },
        { title: "Email Analyzer", description: "Extract threat indicators from suspicious emails, analyze SPF/DKIM/DMARC, attachment hashes, and extracted URLs" },
        { title: "IOC Extractor", description: "Bulk extract IPs, domains, URLs, emails, file hashes from text or files with 50 IOCs per request" },
        { title: "Cybersecurity Newsfeed", description: "Aggregated news from 16 trusted sources including SecurityWeek, Dark Reading, Krebs on Security" },
        { title: "CVSS 3.1 Calculator", description: "Calculate vulnerability severity with Base, Temporal, and Environmental metrics per FIRST.org spec" },
        { title: "Reputation Color Coding", description: "Visual threat level indicators: Red (High), Yellow (Medium), Green (Low), Blue (Pending)" }
      ],
      useCases: [
        "Get comprehensive threat context in seconds",
        "Make faster incident response decisions",
        "Reduce false positives with multi-source validation",
        "Quickly triage phishing reports",
        "Build IOC lists for blocking"
      ],
      image: "https://images.unsplash.com/photo-1675627453084-505806a00406?crop=entropy&cs=srgb&fm=jpg&w=800&q=85"
    },
    {
      id: "litesabre",
      name: "LiteSabre Scanner",
      tagline: "Vulnerability & Secret Scanner",
      description: "Code, container, IaC, and secrets vulnerability scanning with 122 security rules, SBOM generation, and integration with NVD/OSV databases.",
      fullDescription: "LiteSabre is a comprehensive vulnerability scanner covering code dependencies, Docker containers, Infrastructure as Code, and secrets detection. With 122 security rules covering OWASP Top 10, CWE Top 25, and 40 secret detection patterns for AWS, GCP, Azure, and more.",
      icon: Bug,
      features: ["122 security rules", "SBOM generation", "Secret detection", "Multi-format export"],
      detailedFeatures: [
        { title: "Multi-Type Scanning", description: "Dependency files, Git repositories, Docker containers, Terraform/K8s YAML, and source code" },
        { title: "Secret Detection", description: "40 patterns for AWS, GCP, Azure, GitHub, Slack, Stripe, databases, private keys, AI services" },
        { title: "Security Rules Library", description: "122 rules covering API Security, Cryptography, Serialization, IaC, Frontend, Headers, SAST" },
        { title: "Vulnerability Database", description: "Live integration with NVD CVE API and OSV API for CVSS scores and package-specific data" },
        { title: "SBOM Generation", description: "CycloneDX, SPDX, CSV, JSON formats with package health metrics and license information" },
        { title: "Export Capabilities", description: "JSON, PDF, Markdown reports for compliance documentation" }
      ],
      useCases: [
        "Shift security left in development",
        "Reduce production security issues",
        "Detect hardcoded secrets before commit",
        "Supply chain security monitoring",
        "Link vulnerabilities to compliance controls"
      ],
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?crop=entropy&cs=srgb&fm=jpg&w=800&q=85"
    },
    {
      id: "amidala-cspm",
      name: "Amidala CSPM",
      tagline: "Cloud Security Posture Management",
      description: "Multi-cloud security for AWS, Azure, GCP with 50+ pre-built checks, compliance mapping to CIS/NIST/PCI-DSS, and real-time alerts.",
      fullDescription: "Amidala CSPM provides comprehensive cloud security posture management for AWS, Azure, and GCP. With 50+ pre-built security checks across IAM, Storage, Logging, Network, Encryption, Database, and Compute categories, mapped to CIS Benchmarks, NIST 800-53, PCI-DSS, SOC2, GDPR, HIPAA, and ISO 27001.",
      icon: Cloud,
      features: ["AWS, Azure, GCP support", "50+ security checks", "CIS/NIST/PCI mapping", "Real-time alerts"],
      detailedFeatures: [
        { title: "Multi-Cloud Support", description: "AWS (25+ checks), Azure (20+ checks), GCP (15+ checks) with unified dashboard" },
        { title: "Scan Categories", description: "IAM, Storage, Logging, Network, Encryption, Database, Compute security assessments" },
        { title: "Compliance Mapping", description: "Findings mapped to CIS Benchmarks, NIST 800-53, PCI-DSS, SOC2, GDPR, HIPAA, ISO 27001" },
        { title: "Real-time Notifications", description: "WebSocket-powered scan progress and security alerts with expandable findings" },
        { title: "Prowler-Inspired Dashboard", description: "Security score, risk pipeline, service watchlist with detailed remediation steps" },
        { title: "Role-Based Access", description: "Admin, Security Analyst, Auditor, Viewer roles with async scanning via Redis/Celery" }
      ],
      useCases: [
        "Identify cloud misconfigurations before exploitation",
        "Maintain continuous multi-framework compliance",
        "Reduce manual audit preparation by 70%",
        "Get actionable remediation guidance",
        "Track security posture improvements"
      ],
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=srgb&fm=jpg&w=800&q=85"
    }
  ];

  return (
    <section 
      id="products" 
      className="py-32 relative"
      ref={ref}
      data-testid="products-section"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Beskar Security Platform</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            Unified GRC, Cloud Security<br />
            <span className="text-slate-500">& Open Source Intelligence</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl">
            A comprehensive platform for cybersecurity professionals, compliance officers, threat hunters, and security analysts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="product-card group relative bg-beskar-paper border border-slate-800 overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              onClick={() => setSelectedProduct(product)}
              data-testid={`product-${product.id}`}
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-beskar-paper via-beskar-paper/50 to-transparent" />
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-beskar-cyan/10 border border-beskar-cyan/30">
                    <product.icon className="w-6 h-6 text-beskar-cyan" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-white">{product.name}</h3>
                    <p className="text-beskar-cyan text-sm">{product.tagline}</p>
                  </div>
                </div>

                <p className="text-slate-400 mb-6 leading-relaxed">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle className="w-4 h-4 text-beskar-cyan flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className="inline-flex items-center gap-2 text-white hover:text-beskar-cyan transition-colors group/btn"
                  data-testid={`product-${product.id}-learn-more`}
                >
                  Learn more 
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      category: "Security Auditing",
      description: "Comprehensive security assessments and audits",
      icon: FileSearch,
      items: ["Internal Audits", "External Audits", "Gap Analysis", "Risk Assessments", "Third-Party Audits"]
    },
    {
      category: "VAPT Services",
      description: "Vulnerability Assessment & Penetration Testing",
      icon: Target,
      items: ["Network Penetration Testing", "Web Application Testing", "Mobile App Testing", "API Security Testing", "Red Team Exercises"]
    },
    {
      category: "Secure Code Review",
      description: "In-depth source code security analysis",
      icon: Code,
      items: ["Static Code Analysis", "Dynamic Testing", "OWASP Top 10 Review", "Secure SDLC Integration", "DevSecOps Consulting"]
    },
    {
      category: "CSPM & Cloud Security",
      description: "Cloud Security Posture Management",
      icon: Cloud,
      items: ["AWS Security Review", "Azure Security Assessment", "GCP Security Audit", "Multi-Cloud Strategy", "Cloud Compliance"]
    },
    {
      category: "Framework Implementation",
      description: "End-to-end compliance framework deployment",
      icon: Layers,
      items: ["Policy Development", "Control Implementation", "Documentation", "Training & Awareness", "Audit Preparation"]
    },
    {
      category: "Managed Security",
      description: "Ongoing security operations support",
      icon: Shield,
      items: ["24/7 Monitoring", "Incident Response", "Threat Intelligence", "Security Operations", "Continuous Compliance"]
    }
  ];

  return (
    <section 
      id="services" 
      className="py-32 bg-beskar-paper/50 relative"
      ref={ref}
      data-testid="services-section"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="max-w-3xl mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Professional Services</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            Expert security services<br />
            <span className="text-slate-500">for your organization</span>
          </h2>
          <p className="text-lg text-slate-400">
            From auditing to implementation, our team of certified experts helps you achieve and maintain security excellence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.category}
              className="service-card p-8 bg-beskar-bg border border-slate-800 hover:border-slate-700 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              data-testid={`service-${service.category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="p-3 bg-beskar-cyan/10 border border-beskar-cyan/30 w-fit mb-6">
                <service.icon className="w-6 h-6 text-beskar-cyan" />
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-white mb-2">
                {service.category}
              </h3>
              <p className="text-slate-500 text-sm mb-4">{service.description}</p>
              
              <div className="space-y-2">
                {service.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="w-3 h-3 text-beskar-cyan flex-shrink-0" />
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

// Compliance Frameworks Section
const ComplianceSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const frameworks = [
    { 
      category: "Information Security", 
      items: ["ISO 27001", "ISO 27002", "ISO 27017", "ISO 27018", "ISO 27701"],
      icon: Lock,
      description: "International standards for information security management"
    },
    { 
      category: "AI & Technology", 
      items: ["ISO 42001", "NIST AI RMF", "EU AI Act"],
      icon: Zap,
      description: "Frameworks for artificial intelligence governance"
    },
    { 
      category: "Privacy Regulations", 
      items: ["GDPR", "CCPA", "DPDPA (India)", "LGPD", "POPIA"],
      icon: Eye,
      description: "Global data privacy and protection laws"
    },
    { 
      category: "Healthcare", 
      items: ["HIPAA", "HITRUST", "HITECH", "NHS DSP Toolkit"],
      icon: Activity,
      description: "Healthcare industry compliance standards"
    },
    { 
      category: "Financial Services", 
      items: ["PCI DSS", "SOX", "GLBA", "FFIEC", "MAS TRM"],
      icon: Building,
      description: "Financial industry regulatory requirements"
    },
    { 
      category: "SOC Reports", 
      items: ["SOC 1", "SOC 2 Type I", "SOC 2 Type II", "SOC 3"],
      icon: FileText,
      description: "Service organization control reports"
    },
    { 
      category: "Regional Standards", 
      items: ["SAMA (Saudi)", "NESA (UAE)", "PDPL (Qatar)", "CBK (Kuwait)"],
      icon: Globe,
      description: "Middle East regional compliance frameworks"
    },
    { 
      category: "Government & Defense", 
      items: ["NIST 800-53", "NIST CSF", "FedRAMP", "CMMC", "CIS Controls"],
      icon: Shield,
      description: "Government and critical infrastructure standards"
    },
    { 
      category: "Industry Specific", 
      items: ["NERC CIP", "IEC 62443", "TISAX", "CSA STAR"],
      icon: Server,
      description: "Sector-specific security frameworks"
    }
  ];

  return (
    <section 
      id="compliance" 
      className="py-32 relative"
      ref={ref}
      data-testid="compliance-section"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="max-w-3xl mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Compliance Expertise</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            Frameworks & standards<br />
            <span className="text-slate-500">we help you achieve</span>
          </h2>
          <p className="text-lg text-slate-400">
            We help align multiple frameworks to reduce duplicate work, audit fatigue, and overall cost through unified compliance management.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map((framework, index) => (
            <motion.div
              key={framework.category}
              className="compliance-card p-6 bg-beskar-paper border border-slate-800 hover:border-slate-700 transition-all"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              data-testid={`compliance-${framework.category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-beskar-cyan/10 border border-beskar-cyan/30">
                  <framework.icon className="w-5 h-5 text-beskar-cyan" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white">
                  {framework.category}
                </h3>
              </div>
              
              <p className="text-slate-500 text-sm mb-4">{framework.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {framework.items.map((item) => (
                  <span 
                    key={item}
                    className="framework-badge px-3 py-1.5 text-xs text-slate-400 border border-slate-700 bg-slate-900/50"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Impact Stats Section
const ImpactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { 
      value: 70, 
      suffix: "%+", 
      label: "Audit Time Reduction",
      description: "Reduce audit preparation time with unified compliance management",
      icon: Activity
    },
    { 
      value: 50, 
      suffix: "+", 
      label: "Security Checks",
      description: "Pre-built cloud security checks across AWS, Azure, and GCP",
      icon: Shield
    },
    { 
      value: 122, 
      suffix: "", 
      label: "Security Rules",
      description: "Comprehensive vulnerability and secret detection rules",
      icon: Bug
    },
    { 
      value: 15, 
      suffix: "+", 
      label: "Threat Intel Sources",
      description: "Integrated threat intelligence for comprehensive analysis",
      icon: Eye
    },
  ];

  return (
    <section 
      id="impact" 
      className="py-32 bg-beskar-paper/50 relative overflow-hidden"
      ref={ref}
      data-testid="impact-section"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-beskar-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Platform Capabilities</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white">
            Built for enterprise<br />
            <span className="text-slate-500">security teams</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const StatCard = () => {
              const cardRef = useRef(null);
              const cardInView = useInView(cardRef, { once: true });
              const count = useCounter(stat.value, 2000, cardInView);
              
              return (
                <motion.div
                  ref={cardRef}
                  className="stat-card p-8 bg-beskar-bg border border-slate-800 text-center card-glow"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute w-16 h-16 bg-beskar-cyan/10 rounded-full pulse-ring" />
                    <div className="p-3 bg-beskar-cyan/10 border border-beskar-cyan/30 relative z-10">
                      <stat.icon className="w-6 h-6 text-beskar-cyan" />
                    </div>
                  </div>
                  
                  <div className="font-heading text-5xl md:text-6xl font-bold text-white mb-2">
                    {count}{stat.suffix}
                  </div>
                  
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">
                    {stat.label}
                  </h3>
                  
                  <p className="text-slate-500 text-sm">
                    {stat.description}
                  </p>
                </motion.div>
              );
            };
            
            return <StatCard key={stat.label} />;
          })}
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `Thank you for reaching out. We'll contact you at ${SUPPORT_EMAIL} soon.` });
        setFormState({ name: '', email: '', company: '', message: '' });
      } else {
        setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to send message. Please try again later.' });
    }

    setIsSubmitting(false);
  };

  return (
    <section 
      id="contact" 
      className="py-32 relative"
      ref={ref}
      data-testid="contact-section"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-beskar-cyan font-mono text-sm mb-4 block">Get in Touch</span>
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to secure<br />
              <span className="text-slate-500">your future?</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Let's discuss how Beskar IT can help align your compliance frameworks 
              and strengthen your security posture.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="p-2 bg-beskar-cyan/10 border border-beskar-cyan/30">
                  <Mail className="w-5 h-5 text-beskar-cyan" />
                </div>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-beskar-cyan transition-colors" data-testid="contact-email">
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="p-2 bg-beskar-cyan/10 border border-beskar-cyan/30">
                  <Shield className="w-5 h-5 text-beskar-cyan" />
                </div>
                <span>Enterprise-grade security solutions</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="p-2 bg-beskar-cyan/10 border border-beskar-cyan/30">
                  <FileSearch className="w-5 h-5 text-beskar-cyan" />
                </div>
                <span>Comprehensive compliance alignment</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="p-2 bg-beskar-cyan/10 border border-beskar-cyan/30">
                  <Globe className="w-5 h-5 text-beskar-cyan" />
                </div>
                <span>Global standards expertise</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form 
              onSubmit={handleSubmit}
              className="glass p-8 space-y-6"
              data-testid="contact-form"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-beskar-bg border border-slate-700 focus:border-beskar-cyan px-4 py-3 text-white outline-none transition-colors"
                    placeholder="John Doe"
                    data-testid="contact-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-beskar-bg border border-slate-700 focus:border-beskar-cyan px-4 py-3 text-white outline-none transition-colors"
                    placeholder="john@company.com"
                    data-testid="contact-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Company</label>
                <input
                  type="text"
                  value={formState.company}
                  onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                  className="w-full bg-beskar-bg border border-slate-700 focus:border-beskar-cyan px-4 py-3 text-white outline-none transition-colors"
                  placeholder="Your company name"
                  data-testid="contact-company-input"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full bg-beskar-bg border border-slate-700 focus:border-beskar-cyan px-4 py-3 text-white outline-none transition-colors resize-none"
                  placeholder="Tell us about your security and compliance needs..."
                  data-testid="contact-message-input"
                />
              </div>

              {status.message && (
                <div 
                  className={`p-4 ${
                    status.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                  data-testid="contact-status"
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 hover:bg-white py-4 font-medium transition-colors disabled:opacity-50"
                data-testid="contact-submit-button"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="py-16 border-t border-slate-800" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_04619072-dd18-466a-b051-872e26ea17cf/artifacts/8uottcra_logo.png" 
                alt="Beskar IT" 
                className="h-10 w-auto"
              />
              <span className="font-heading font-bold text-xl text-white">Beskar IT</span>
            </div>
            <p className="text-slate-500 mb-4">
              Unified Compliance & Risk Reduction Platform.
            </p>
            <p className="text-beskar-cyan italic mb-4">"This is the way"</p>
            <a 
              href={`mailto:${SUPPORT_EMAIL}`} 
              className="text-slate-400 hover:text-beskar-cyan transition-colors flex items-center gap-2"
              data-testid="footer-email"
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2">
              <li><a href="#products" className="text-slate-500 hover:text-white transition-colors">GRC Nexus</a></li>
              <li><a href="#products" className="text-slate-500 hover:text-white transition-colors">OSINT Toolkit</a></li>
              <li><a href="#products" className="text-slate-500 hover:text-white transition-colors">LiteSabre Scanner</a></li>
              <li><a href="#products" className="text-slate-500 hover:text-white transition-colors">Amidala CSPM</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="text-slate-500 hover:text-white transition-colors">Security Auditing</a></li>
              <li><a href="#services" className="text-slate-500 hover:text-white transition-colors">VAPT Services</a></li>
              <li><a href="#services" className="text-slate-500 hover:text-white transition-colors">Secure Code Review</a></li>
              <li><a href="#services" className="text-slate-500 hover:text-white transition-colors">CSPM & Cloud Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Compliance</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-500">ISO 27001 / ISO 42001</span></li>
              <li><span className="text-slate-500">SOC 2 / SOC 3</span></li>
              <li><span className="text-slate-500">GDPR / CCPA / DPDPA</span></li>
              <li><span className="text-slate-500">PCI DSS / HIPAA</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} Beskar IT. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-slate-600 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-600 hover:text-white transition-colors">Terms of Service</a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-slate-600 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  useSmoothScroll();

  return (
    <div className="grain">
      <Navigation />
      <main>
        <HeroSection />
        <ProductsSection />
        <ServicesSection />
        <ComplianceSection />
        <ImpactSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
