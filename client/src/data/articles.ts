export interface JournalArticle {
  id: string;
  serialNumber: string;
  title: string;
  authors: {
    name: string;
    isCorresponding?: boolean;
    role?: string;
    department: string;
    institution: string;
    email?: string;
  }[];
  section: string;
  pages: string;
  doi: string;
  pdfUrl: string;
  abstract: string;
  keywords: string[];
  volume: string;
  issue: string;
  year: string;
  date: string;
}

export const currentIssueArticles: JournalArticle[] = [
  {
    id: "01",
    serialNumber: "01",
    title: "Technology, Digital Inclusion and Market Access: Evaluating the Role of Digital Platforms and E-Commerce in Empowering Traditional Workers and Artisans of Andhra Pradesh",
    section: "Original Research Article",
    pages: "1–10",
    doi: "https://doi.org/10.XXXXX/jpsg.2027.0101",
    pdfUrl: "/articles/01_Digital_Inclusion_Artisans_AP.pdf",
    volume: "Volume 1",
    issue: "Issue 1",
    year: "2027",
    date: "January–March 2027",
    authors: [
      {
        name: "A. Pavan Kumar",
        isCorresponding: true,
        role: "Guest Faculty",
        department: "Department of Commerce and Management (MHRM)",
        institution: "Andhra University, Visakhapatnam, Andhra Pradesh, India",
        email: "pavankumardora@gmail.com",
      },
    ],
    keywords: [
      "Digital Inclusion",
      "Traditional Artisans",
      "E-commerce",
      "Andhra Pradesh",
      "Market Access",
      "Handloom",
      "Digital Platforms",
    ],
    abstract:
      "Traditional artisans constitute an indispensable component of India’s cultural economy, preserving centuries old craft traditions while contributing significantly to employment generation, rural livelihoods and sustainable development. Andhra Pradesh (AP), known for its rich heritage of handloom and handicraft products such as Uppada and Venkatagiri sarees, Dharmavaram silk, Kondapalli toys, Etikoppaka lacquerware, Kalamkari textiles and Narsapur lace, presents a compelling case for examining the role of digital transformation in artisan empowerment. The rapid expansion of digital technologies, including e-commerce platforms, digital payment systems, social media and mobile applications, has fundamentally altered how artisans access markets, interact with consumers and establish entrepreneurial identities. Simultaneously, national initiatives such as Digital India, the Open Network for Digital Commerce (ONDC), Government e-Marketplace (GeM) and specialized artisan focused platforms have created new opportunities for inclusive economic participation.\n\nThis paper combines contemporary literature, government reports and policy initiatives to evaluate how digital inclusion and technology influence market access for traditional workers and artisans in AP. It argues that digital platforms have evolved beyond commercial marketplaces to become instruments of entrepreneurship, financial inclusion, cultural preservation and livelihood diversification. However, the paper also highlights persistent barriers including digital literacy gaps, infrastructural disparities, branding limitations, logistical challenges and unequal access to digital resources that continue to restrict the equitable benefits of digital transformation. The study concludes that sustainable empowerment requires an integrated ecosystem where technological innovation is complemented by institutional support, capacity building, digital skills and collaborative governance. Strengthening such an ecosystem will not only improve artisans’ economic resilience but also contribute to preserving AP’s unique cultural heritage in an increasingly digital economy.",
  },
  {
    id: "02",
    serialNumber: "02",
    title: "Environmental Governance in India: Political Accountability, Regulatory Enforcement and Sustainable Development",
    section: "Original Research Article",
    pages: "11–17",
    doi: "https://doi.org/10.XXXXX/jpsg.2027.0102",
    pdfUrl: "/articles/02_Environmental_Governance_in_India.pdf",
    volume: "Volume 1",
    issue: "Issue 1",
    year: "2027",
    date: "January–March 2027",
    authors: [
      {
        name: "Petikam Sailaja",
        role: "Professor of Law and Director",
        department: "Centre for Lifelong Learning, Saveetha School of Law",
        institution: "SIMATS, Chennai, Tamil Nadu, India",
        email: "sailaja.petikam@gmail.com",
      },
    ],
    keywords: [
      "Environmental Governance",
      "Political Accountability",
      "Regulatory Enforcement",
      "Sustainable Development",
      "National Green Tribunal",
      "Environmental Impact Assessment",
      "India",
    ],
    abstract:
      "India's environmental governance rests on an unusual combination: an expansive constitutional commitment to a healthy environment, a dense statutory framework, and a judiciary that has at times acted as the principal environmental regulator. Yet air, water and land indicators remain among the world's poorest, and enforcement outcomes lag far behind legislative ambition. This paper argues that the gap between law and outcome is best explained by weak political accountability and under-resourced, captured or discretion-heavy regulatory institutions, and that recent reforms privilege speed of clearance over answerability. Using a doctrinal and analytical method, it examines the constitutional foundations, the institutional design of regulators and the National Green Tribunal (NGT), the role of the Supreme Court, and the tension between development and ecological limits. It concludes with reforms aimed at statutory independence of regulators, transparent and participatory decision-making, credible penalties, and a constitutionally grounded duty of climate-aware, rights-based development.",
  },
  {
    id: "03",
    serialNumber: "03",
    title: "Role of Microfinance and Role of Women in Poverty Reduction through Self-Help Groups in Guntur District of Andhra Pradesh",
    section: "Original Research Article",
    pages: "18–23",
    doi: "https://doi.org/10.XXXXX/jpsg.2027.0103",
    pdfUrl: "/articles/03_Microfinance_Women_SHGs_Guntur.pdf",
    volume: "Volume 1",
    issue: "Issue 1",
    year: "2027",
    date: "January–March 2027",
    authors: [
      {
        name: "G. Saritha",
        isCorresponding: true,
        role: "Research Scholar",
        department: "Department of Economics",
        institution: "Acharya Nagarjuna University, Guntur, Andhra Pradesh, India",
        email: "sarithagallikonda@gmail.com",
      },
    ],
    keywords: [
      "Microfinance",
      "Bargaining Power",
      "Development Strategies",
      "Potentiality",
      "Poverty Alleviation",
      "Self-Help Groups (SHGs)",
    ],
    abstract:
      "In India, the history of microfinance dates back to the establishment of Syndicate Bank in 1921 in the private sector. During the early years, Syndicate Bank concentrated on raising micro deposits in the form of daily/weekly basis and sanctioned micro loans to its clients for shorter periods of time. But microfinance came to the limelight only when Dr. Yunus gave it a mass movement in the Grameen Bank experiment. Microfinance can be called a novel approach to provide saving and investment facilities to the poor around the world. Improved access and efficient provision of savings, credit, and insurance facilities in particular can enable the poor to smoothen their consumption, manage their risks better, gradually build their asset base, develop their business, enhance their income earning capacity, and enjoy an improved quality of life. In India, microfinance mainly operates through Self Help Groups (SHGs), Non-Governmental Organizations (NGOs), and Credit Agencies. It provides poor people with the means to find their own way out of poverty, putting the power squarely in their hands. Women, who form half of the population and constitute substantial productive and economic resources in our country, have been the silent sufferers of inadequate developmental attention. This paper analyzes the role of women in rural poverty reduction and examines the participation of women from sociological and economic points of view based on random sample empirical analysis of 82 respondents in Nidubrolu, Guntur District of Andhra Pradesh.",
  },
  {
    id: "04",
    serialNumber: "04",
    title: "Global Harmony through Consciousness: From Self to Cosmos — An Advaitic Perspective on Universal Unity and Social Action",
    section: "Original Research Article",
    pages: "24–28",
    doi: "https://doi.org/10.XXXXX/jpsg.2027.0104",
    pdfUrl: "/articles/04_Global_Harmony_Through_Consciousness.pdf",
    volume: "Volume 1",
    issue: "Issue 1",
    year: "2027",
    date: "January–March 2027",
    authors: [
      {
        name: "Drākshāyaṇi Manḍuva",
        isCorresponding: true,
        role: "Guest Faculty",
        department: "Department of Philosophy",
        institution: "Āndhra University, Visakhapatnam, Andhra Pradesh, India",
        email: "drakshayanimanduva@gmail.com",
      },
    ],
    keywords: [
      "Atma bodha to Viswa bodha",
      "Inward to Outward",
      "Self to Cosmos",
      "Vasudhaiva Kutumbakam",
      "Advaita Vedanta",
      "Universal Consciousness",
    ],
    abstract:
      "India’s greatest contribution to humanity is not technology or empire, but the science of inner transformation. The entire Indian tradition begins with one critical foundational question: 'Who am I?' (Ko’ham?). The movement from 'Self to Cosmos', 'From inward to outward', and 'Atma bodha to Viswa bodha' defines the central trajectory of Indian philosophy. This trajectory is not an escape from the world, but an organic expansion of the individual self until the structural boundary between 'I' and 'Universe' completely dissolves. The Upaniṣads define this existential state as 'Tat Tvam Asi' ('That Thou Art'). Sri Aurobindo maps this as 'The Evolution of Consciousness,' while the Bhagavad Gῑta frames it as 'Yoga' or divine Union. Ultimately, this realization culminates in the global ideal of Vasudhaiva Kutumbakam—the absolute recognition that the whole world is one single family.",
  },
];

export function getCitation(article: JournalArticle, style: "APA" | "MLA" | "Chicago" | "BibTeX"): string {
  const authorNames = article.authors.map((a) => a.name).join(", ");
  switch (style) {
    case "APA":
      return `${authorNames} (${article.year}). ${article.title}. Journal of Politics, Society and Governance, 1(1), ${article.pages}. ${article.doi}`;
    case "MLA":
      return `${authorNames}. \"${article.title}.\" Journal of Politics, Society and Governance, vol. 1, no. 1, ${article.year}, pp. ${article.pages}.`;
    case "Chicago":
      return `${authorNames}. \"${article.title}.\" Journal of Politics, Society and Governance 1, no. 1 (${article.year}): ${article.pages}.`;
    case "BibTeX":
      return `@article{jpsg_${article.id}_${article.year},
  title={${article.title}},
  author={${authorNames}},
  journal={Journal of Politics, Society and Governance},
  volume={1},
  number={1},
  pages={${article.pages}},
  year={${article.year}},
  publisher={Democratic Organisation for Civic Knowledge Foundation}
}`;
  }
}
