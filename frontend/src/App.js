import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
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
  ChevronDown
} from 'lucide-react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

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

// Products Section
const ProductsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const products = [
    {
      name: "Nexus",
      tagline: "Threat Intelligence Platform",
      description: "Advanced threat detection and intelligence aggregation platform. Centralize your security data, correlate threats across sources, and respond faster with AI-powered insights.",
      icon: Network,
      features: ["Real-time threat correlation", "Multi-source intelligence", "Automated response workflows", "Custom threat feeds"],
      image: "https://images.unsplash.com/photo-1660836814985-8523a0d713b5?crop=entropy&cs=srgb&fm=jpg&w=800&q=85"
    },
    {
      name: "OSINT",
      tagline: "Open Source Intelligence Tool",
      description: "Comprehensive open-source intelligence gathering and analysis. Discover, collect, and analyze publicly available data to protect your organization.",
      icon: Eye,
      features: ["Automated data collection", "Dark web monitoring", "Social media intelligence", "Entity relationship mapping"],
      image: "https://images.unsplash.com/photo-1675627453084-505806a00406?crop=entropy&cs=srgb&fm=jpg&w=800&q=85"
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
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Our Products</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            Security solutions that<br />
            <span className="text-slate-500">defend your perimeter</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              className="product-card group relative bg-beskar-paper border border-slate-800 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              data-testid={`product-${product.name.toLowerCase()}`}
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
                  data-testid={`product-${product.name.toLowerCase()}-learn-more`}
                >
                  Learn more 
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const frameworks = [
    { category: "Information & AI", items: ["ISO 27001", "ISO 42001"], icon: Server },
    { category: "Privacy", items: ["GDPR", "CCPA", "India's DPDP Act"], icon: Lock },
    { category: "Healthcare & Finance", items: ["HIPAA", "HITRUST", "PCI DSS"], icon: Shield },
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
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Our Expertise</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
            Compliance frameworks<br />
            <span className="text-slate-500">aligned to your needs</span>
          </h2>
          <p className="text-lg text-slate-400">
            We help align multiple frameworks to reduce duplicate work, audit fatigue, and overall cost.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {frameworks.map((framework, index) => (
            <motion.div
              key={framework.category}
              className="service-card p-8 bg-beskar-bg border border-slate-800 hover:border-slate-700 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              data-testid={`service-${framework.category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="p-3 bg-beskar-cyan/10 border border-beskar-cyan/30 w-fit mb-6">
                <framework.icon className="w-6 h-6 text-beskar-cyan" />
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-white mb-4">
                {framework.category}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {framework.items.map((item) => (
                  <span 
                    key={item}
                    className="framework-badge px-3 py-1.5 text-sm text-slate-400 border border-slate-700 bg-slate-900/50"
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
      label: "Phishing Reduction",
      description: "Significant drops in phishing attempts for retail partners",
      icon: AlertTriangle
    },
    { 
      value: 30, 
      suffix: "%", 
      label: "Admin Savings",
      description: "Internal tool modernization to cut administrative drain",
      icon: Activity
    },
    { 
      value: 100, 
      suffix: "%", 
      label: "Proactive Defense",
      description: "Targeted management of ransomware risks and post-breach recovery",
      icon: Shield
    },
  ];

  return (
    <section 
      id="impact" 
      className="py-32 relative overflow-hidden"
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
          <span className="text-beskar-cyan font-mono text-sm mb-4 block">Proven Impact</span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-white">
            Results that speak<br />
            <span className="text-slate-500">for themselves</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const StatCard = () => {
              const cardRef = useRef(null);
              const cardInView = useInView(cardRef, { once: true });
              const count = useCounter(stat.value, 2000, cardInView);
              
              return (
                <motion.div
                  ref={cardRef}
                  className="stat-card p-10 bg-beskar-paper border border-slate-800 text-center card-glow"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute w-20 h-20 bg-beskar-cyan/10 rounded-full pulse-ring" />
                    <div className="p-4 bg-beskar-cyan/10 border border-beskar-cyan/30 relative z-10">
                      <stat.icon className="w-8 h-8 text-beskar-cyan" />
                    </div>
                  </div>
                  
                  <div className="font-heading text-6xl md:text-8xl font-bold text-white mb-2">
                    {count}{stat.suffix}
                  </div>
                  
                  <h3 className="font-heading text-xl font-semibold text-white mb-3">
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
        setStatus({ type: 'success', message: data.message });
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
      className="py-32 bg-beskar-paper/50 relative"
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
            
            <div className="space-y-4">
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
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_04619072-dd18-466a-b051-872e26ea17cf/artifacts/8uottcra_logo.png" 
                alt="Beskar IT" 
                className="h-10 w-auto"
              />
              <span className="font-heading font-bold text-xl text-white">Beskar IT</span>
            </div>
            <p className="text-slate-500 mb-4 max-w-md">
              The standards we create serve as powerful ambassadors for the company. 
              Unified Compliance & Risk Reduction.
            </p>
            <p className="text-beskar-cyan italic">"This is the way"</p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2">
              <li><a href="#products" className="text-slate-500 hover:text-white transition-colors">Nexus</a></li>
              <li><a href="#products" className="text-slate-500 hover:text-white transition-colors">OSINT</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Compliance</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-500">ISO 27001</span></li>
              <li><span className="text-slate-500">ISO 42001</span></li>
              <li><span className="text-slate-500">GDPR</span></li>
              <li><span className="text-slate-500">HIPAA</span></li>
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
        <ImpactSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
