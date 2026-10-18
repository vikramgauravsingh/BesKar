/**
 * JSON-LD SoftwareApplication structured data for all 6 Beskar products.
 * Helps Google emit rich product cards / sitelinks for queries like
 * "ISO 27001 compliance platform", "CSPM AWS Azure GCP", etc.
 */

const BASE = 'https://www.beskarit.com';
const LOGO =
  'https://customer-assets.emergentagent.com/job_04619072-dd18-466a-b051-872e26ea17cf/artifacts/8uottcra_logo.png';
const PUBLISHER = {
  '@type': 'Organization',
  name: 'Beskar',
  url: BASE,
  logo: LOGO,
};

const products = [
  {
    id: 'grc-nexus',
    name: 'GRC Nexus',
    tagline: 'Governance, Risk & Compliance Platform',
    description:
      'Comprehensive GRC platform supporting 50+ compliance frameworks (ISO 27001, SOC 2, GDPR, PCI DSS, HIPAA, NIST, DPDPA, USPCF) with risk management, audit management, STRIDE threat modeling, policy management, and executive dashboards.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    keywords: 'GRC, compliance, ISO 27001, SOC 2, GDPR, HIPAA, PCI DSS, risk management, audit management, STRIDE',
    version: '3.0',
    category: 'BusinessApplication',
    featureList: [
      '50+ compliance frameworks',
      'Risk management with 5x5 heatmap',
      'Audit management with engagements and findings',
      'STRIDE threat modeling',
      'Policy management with version control',
      'Executive GRC dashboard',
    ],
  },
  {
    id: 'beskar-osint',
    name: 'Beskar OSINT Toolkit',
    tagline: 'Open Source Intelligence Platform',
    description:
      'Comprehensive OSINT gathering and analysis with IOC Analyzer, Email Analyzer, IOC Extractor, and integrated threat intelligence from 15+ sources including VirusTotal, AbuseIPDB, and Shodan.',
    image: 'https://images.unsplash.com/photo-1675627453084-505806a00406?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    keywords: 'OSINT, threat intelligence, IOC analyzer, email analyzer, VirusTotal, AbuseIPDB, Shodan, CVSS',
    category: 'SecurityApplication',
    featureList: [
      'IOC analysis across 15+ threat intel sources',
      'Email threat extraction (SPF/DKIM/DMARC)',
      'Bulk IOC extraction',
      'Cybersecurity newsfeed (16 sources)',
      'CVSS 3.1 calculator',
    ],
  },
  {
    id: 'litesabre',
    name: 'LiteSabre Scanner',
    tagline: 'SAST & Dependency Vulnerability Scanner',
    description:
      'Comprehensive SAST, dependency, IaC, container, and secrets scanning with 176+ security rules, 250+ attack payloads, CI/CD integration (GitHub Actions, GitLab CI, Jenkins), and SBOM generation (CycloneDX, SPDX).',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    keywords: 'SAST, vulnerability scanner, dependency scanning, secret detection, IaC scanning, CI/CD security, SBOM',
    version: '3.0',
    category: 'DeveloperApplication',
    featureList: [
      'Multi-type scanning (deps, Git, Docker, IaC, source, CI/CD)',
      '40 secret detection patterns',
      '176+ SAST security rules',
      'CI/CD pipeline integration',
      'Confidence scoring 0-100%',
      'SBOM and multi-format reports',
    ],
  },
  {
    id: 'amidala-cspm',
    name: 'Amidala CSPM',
    tagline: 'Cloud Security Posture Management',
    description:
      'Multi-cloud security for AWS, Azure, GCP with 185 security checks, automated evidence collection, compliance mapping to CIS Benchmarks, NIST 800-53, PCI-DSS, SOC 2, GDPR, HIPAA, and ISO 27001.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    keywords: 'CSPM, cloud security, AWS security, Azure security, GCP security, CIS, NIST, multi-cloud compliance',
    version: '3.0',
    category: 'SecurityApplication',
    featureList: [
      '185 multi-cloud security checks',
      'AWS, Azure, GCP support',
      'Automated evidence collection',
      'CIS, NIST, PCI-DSS, SOC2, GDPR, HIPAA, ISO 27001 mapping',
      '50 misconfiguration patterns',
      'Real-time WebSocket scan progress',
    ],
  },
  {
    id: 'litesabre-pro',
    name: 'LiteSabre Pro',
    tagline: 'Automated Penetration Testing',
    description:
      'Enterprise-grade DAST for web, mobile (APK/IPA), and desktop (PE/ELF/Mach-O/DMG) applications. AI Pentest Agent with autonomous testing using 12+ simulated Kali tools, HackerOne scope integration, and Frida-based mobile dynamic analysis.',
    image: 'https://images.unsplash.com/photo-1760199789455-49098afd02f0?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    keywords: 'penetration testing, DAST, AI pentest, mobile security, APK scanning, IPA scanning, HackerOne, Frida',
    category: 'SecurityApplication',
    featureList: [
      'AI Pentest Agent with Think-Act-Observe loop',
      'Web DAST with 35 YAML rules and 250+ payloads',
      'Mobile APK/IPA scanning with Frida (27 runtime checks)',
      'Desktop scanning (PE, ELF, Mach-O, DMG)',
      'HackerOne Bug Bounty scope import',
      'Professional PDF reports with one-click rescan',
    ],
  },
  {
    id: 'dpdpa-consent',
    name: 'DPDPA Consent Manager',
    tagline: 'India Data Privacy Compliance',
    description:
      'Complete India DPDPA 2023 compliance suite with consent management, PII scanning across PostgreSQL/MySQL/SQL Server/MongoDB (14 PII categories), 72-hour breach notification tracking, and Data Subject Request (DSR) management.',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?crop=entropy&cs=srgb&fm=jpg&w=800&q=85',
    keywords: 'DPDPA 2023, India data privacy, consent management, PII scanner, breach notification, DSR, GDPR',
    category: 'BusinessApplication',
    featureList: [
      'Consent banner builder (JS + React exports)',
      'Multi-database PII scanner (14 categories)',
      '72-hour DPB breach notification countdown',
      'DSR management (Access, Correction, Erasure, Grievance, Nomination)',
      'DPDPA compliance dashboard',
      'Jira integration for workflow automation',
    ],
  },
];

const buildSoftwareApplication = (p) => ({
  '@type': 'SoftwareApplication',
  '@id': `${BASE}/#${p.id}`,
  name: p.name,
  alternateName: p.tagline,
  description: p.description,
  image: p.image,
  url: `${BASE}/#${p.id}`,
  applicationCategory: p.category,
  applicationSubCategory: 'CybersecurityApplication',
  operatingSystem: 'Web, Linux, Windows, macOS',
  keywords: p.keywords,
  ...(p.version ? { softwareVersion: p.version } : {}),
  featureList: p.featureList,
  publisher: PUBLISHER,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: `${BASE}/#contact`,
    description: 'Contact Beskar for enterprise licensing and demo.',
  },
});

const productsGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ItemList',
      '@id': `${BASE}/#products-list`,
      name: 'Beskar Security Platform Modules',
      description:
        'Six integrated cybersecurity modules: GRC Nexus, Beskar OSINT Toolkit, LiteSabre Scanner, Amidala CSPM, LiteSabre Pro, and DPDPA Consent Manager.',
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE}/#${p.id}`,
        name: p.name,
      })),
    },
    ...products.map(buildSoftwareApplication),
  ],
};

export default productsGraph;
