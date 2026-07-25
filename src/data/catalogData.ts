export interface CatalogPage {
  pageNumber: number;
  title: string;
  subtitle?: string;
  category: string;
  imageAlt: string;
  content: {
    description?: string;
    bulletPoints?: string[];
    compatibleWith?: string[];
    applications?: string[];
    milestones?: { year: string; event: string }[];
    gradesTable?: { category: string; grades: string }[];
    contactInfo?: {
      address: string;
      mobiles: string[];
      landline: string;
      whatsapp: string;
      emails: string[];
      websites: string[];
      brandName: string;
    };
  };
}

export const grandCarbonCatalogPages: CatalogPage[] = [
  {
    pageNumber: 1,
    title: 'GRAND CARBON',
    subtitle: 'ENGINEERING CARBON SOLUTIONS SINCE 1995',
    category: 'Cover Page',
    imageAlt: 'Grand Carbon Official Cover',
    content: {
      description: 'Premium O.E.M. Manufacturer of Carbon Brushes & Graphite Engineering Solutions.',
      bulletPoints: [
        'Established 1995 in Lucknow, Uttar Pradesh, India',
        'Serving National & Global Markets',
        'O.E.M. Custom Development & Mass Production',
        'Website: www.grandcarbon.in'
      ]
    }
  },
  {
    pageNumber: 2,
    title: 'OUR STORY',
    subtitle: 'A Legacy of Manufacturing Excellence',
    category: 'Company Profile',
    imageAlt: 'Grand Carbon Manufacturing Plant',
    content: {
      description: 'Founded in the historic industrial hub of Lucknow, Uttar Pradesh, Grand Carbon has spent nearly three decades perfecting the science of carbon engineering. Registered as an MSME in 1999, our journey has been defined by a relentless pursuit of quality and precision. Today, as an O.E.M. manufacturer behind the renowned Blackduck brand, we deliver industrial-grade carbon brushes and graphite solutions designed to meet the rigorous demands of global markets.',
      milestones: [
        { year: '1995', event: 'Foundation of Grand Carbon in Lucknow, U.P.' },
        { year: '1999', event: 'Official MSME Registration & scale-up of production capabilities.' },
        { year: 'Present', event: 'Industry-leading O.E.M. manufacturing, IIA certifications, and an extensive portfolio of 5000+ designs.' }
      ]
    }
  },
  {
    pageNumber: 3,
    title: 'POWER TOOLS CARBON BRUSHES',
    subtitle: 'Uncompromising Durability',
    category: 'Power Tools',
    imageAlt: 'Power Tools Carbon Brushes',
    content: {
      description: 'Power tools demand exceptional endurance. Our carbon brushes are engineered to withstand extreme RPMs, high thermal fluctuations, and heavy loads, ensuring sustained performance for professional and industrial power tools without damaging the commutator.',
      compatibleWith: ['Bosch', 'Makita', 'Hitachi', 'Dewalt', 'KPT', 'Dong-cheng', 'Hilti'],
      bulletPoints: [
        'Low friction co-efficient',
        'Superior commutation stability',
        'Excellent spark resistance & long lifespan'
      ],
      applications: ['Angle grinders', 'Rotary hammers', 'Industrial drills', 'Heavy-duty cutters']
    }
  },
  {
    pageNumber: 4,
    title: 'INDUSTRIAL CARBON SOLUTIONS',
    subtitle: 'Powering Heavy Infrastructure',
    category: 'Industrial',
    imageAlt: 'Industrial Heavy Duty Carbon Brushes',
    content: {
      description: 'Industrial machinery requires fail-safe electrical transmission. We manufacture heavy-duty carbon brushes designed for critical national infrastructure, maintaining optimal conductivity under the most severe environmental conditions.',
      bulletPoints: [
        'BHEL Specification Brushes',
        'Slip Ring Motors & Heavy Alternators',
        'Traction Motors for Railways',
        'Wind Turbine Generators',
        'Steel Plant Heavy Drives'
      ]
    }
  },
  {
    pageNumber: 5,
    title: 'AUTOMOBILE & HOME APPLIANCES',
    subtitle: 'Automotive Excellence & Home Appliance Dominance',
    category: 'Automotive & Home',
    imageAlt: 'Starter Motors and Mixer Grinder Brushes',
    content: {
      description: 'We supply O.E.M. grade starter motor kits designed to deliver instant, high-current ignition for the demanding modern automotive sector. Grand Carbon is also a renowned name across India for home appliance components, setting the industry benchmark for longevity and noise-reduction.',
      bulletPoints: [
        '2-Wheeler & 4-Wheeler Starter Brushes',
        'Commercial Truck Starter Motors',
        'Vacuum Cleaner & Washing Machine Motors',
        "India's Leading Mixer Grinder Brushes"
      ]
    }
  },
  {
    pageNumber: 6,
    title: 'GRAPHITE ENGINEERING & GRADES',
    subtitle: '1000+ Premium Carbon & Graphite Formulations',
    category: 'Graphite Engineering',
    imageAlt: 'Customized Graphite Components',
    content: {
      description: 'Beyond traditional brushes, Grand Carbon specializes in customized graphite machining, specialized sealing solutions, and manufacturing from over 1000+ premium carbon grades.',
      bulletPoints: [
        'Graphite Rods & Bushes',
        'Mechanical Seals',
        'Carbon & Fiber Vanes (Pumps / Compressors)',
        'Customized AC and DC Carbon Brushes'
      ],
      gradesTable: [
        { category: 'Electrographite', grades: 'EG224, EG34D, EG14D' },
        { category: 'Metal Graphite', grades: 'M14R, M145E, MC-70' },
        { category: 'Resin Bonded', grades: 'BM-51, B14Z1' },
        { category: 'Specialized / Silver', grades: 'E49X, ASG1' },
        { category: 'Custom Formulations', grades: 'Over 1000+ targeted formulations' }
      ]
    }
  },
  {
    pageNumber: 7,
    title: 'THE GRAND CARBON ADVANTAGE',
    subtitle: 'Why Partner With Grand Carbon',
    category: 'Advantages',
    imageAlt: 'The Grand Carbon Advantage',
    content: {
      description: 'Partnering with Grand Carbon means securing a reliable, high-volume O.E.M. manufacturer capable of translating complex specifications into mass-produced perfection.',
      bulletPoints: [
        '5000+ Pre-Engineered Designs — Extensive, ready-to-deploy library of molds allowing rapid production without tooling delays.',
        'Quality & Certifications — Fully compliant with industry and IIA standards, maintaining rigorous zero-defect quality control across all batches.',
        'Custom Development — Expert prototyping for customized AC/DC brushes matched from client drawings and samples.',
        'Global O.E.M. Supply — Proudly manufactured in India with premium metallic industrial finishes, trusted by domestic leaders and international buyers.'
      ]
    }
  },
  {
    pageNumber: 8,
    title: 'GET IN TOUCH',
    subtitle: 'Contact Grand Carbon Engineering Team',
    category: 'Contact',
    imageAlt: 'Grand Carbon Contact Details & QR Code',
    content: {
      contactInfo: {
        address: '395/15 Kashmiri Mohallah Road Area, Chowk, Lucknow - 226003 (U.P.) INDIA',
        mobiles: ['9335905251', '9580868774', '9936762125'],
        landline: '0522-4058824',
        whatsapp: '+91-9580868774',
        emails: ['care@grandcarbon.com', 'grandcarbon@gmail.com'],
        websites: ['www.grandcarbon.in', 'www.grandcarbon.com'],
        brandName: 'BLACKDUCK'
      }
    }
  }
];
