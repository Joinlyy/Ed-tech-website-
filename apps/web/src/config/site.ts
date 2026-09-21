import type {
  BarRow,
  FaqItem,
  FooterLinkGroup,
  NavLink,
  Plan,
  Stat,
  Step,
  ChecklistItem,
  Testimonial,
  TrendBar,
  WhoCard,
} from '@/types';

export const siteConfig = {
  name: 'RedPen',
  description:
    'Board exam papers, marked the way the board marks them. Five full board papers per subject, solved by hand and marked against the official CBSE marking scheme.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://redpen.example.com',
  tagline: 'Board exam papers, marked the way the board marks them',
  whatsapp: 'https://wa.me/91XXXXXXXXXX',
  whatsappLabel: 'WhatsApp +91 XXXXX XXXXX',
  address: '[Your registered address here]',
  hours: 'Mon–Sat, 10am to 7pm IST',
  copyright: '© 2026 RedPen. Not affiliated with CBSE or any examination board.',
};

export const navLinks: NavLink[] = [
  { label: 'How it works', href: '#how' },
  { label: 'The report', href: '#report' },
  { label: 'Who marks it', href: '#who' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Questions', href: '#faq' },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how' },
      { label: 'The report', href: '#report' },
      { label: 'Who marks it', href: '#who' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Sample report', href: '/sample-report' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms & conditions', href: '/terms' },
      { label: 'Refund policy', href: '/refunds' },
      { label: "Children's data", href: '/data' },
    ],
  },
];

export const steps: Step[] = [
  {
    number: '1',
    title: 'Download your paper',
    description:
      'A full-length board-pattern paper lands in your dashboard. Print it or write straight into your register — three hours, timer on, phone away.',
    meta: '5 papers per subject, spaced across the year',
  },
  {
    number: '2',
    title: 'Photograph and upload',
    description:
      'Snap each page with your phone. No scanner, no app to install. Upload from the browser or send it on WhatsApp — whichever is easier.',
    meta: 'Works on any phone, 2G-friendly',
  },
  {
    number: '3',
    title: 'Read the report',
    description:
      'Within 48 hours you get the annotated script back plus a report naming every mark lost and the one habit costing you the most.',
    meta: 'Annotated PDF + progress report',
  },
];

export const reportChecklist: ChecklistItem[] = [
  { text: 'Every mark lost, tied to the exact line you wrote' },
  { text: 'Careless slip or concept gap — separated, never guessed at' },
  { text: "Chapter-wise marks, so revision goes where it's needed" },
  { text: 'Presentation marks: headings, units, diagrams, working shown' },
  { text: 'What we could not assess, stated plainly' },
];

export const heroBars: BarRow[] = [
  { label: 'Correct method, correct answer', value: '54%', percent: 54, variant: 'ok' },
  { label: 'Right answer, working not shown', value: '21%', percent: 21, variant: 'weak' },
  { label: 'Concept not understood', value: '14%', percent: 14, variant: 'default' },
  { label: 'Ran out of time', value: '11%', percent: 11, variant: 'default' },
];

export const reportBars: BarRow[] = [
  { label: 'Electrostatics', value: '18 / 20', percent: 90, variant: 'ok' },
  { label: 'Current electricity', value: '15 / 20', percent: 75, variant: 'default' },
  { label: 'Ray optics', value: '7 / 20', percent: 35, variant: 'weak' },
];

export const trendBars: TrendBar[] = [
  { height: 52 },
  { height: 58 },
  { height: 56 },
  { height: 67 },
  { height: 74, isLast: true },
];

export const whoCards: WhoCard[] = [
  {
    tag: 'first pass',
    title: 'Read and scored by machine',
    description:
      'Your handwriting is read, matched question by question against the official marking scheme, and given a provisional mark with step-wise credit.',
  },
  {
    tag: 'second pass',
    title: 'Checked by a board examiner',
    description:
      "An experienced CBSE evaluator reviews every mark before it's released. They can and do overturn the machine — that's the point of them being there.",
  },
  {
    tag: "before it's sent",
    title: "Evidence or it doesn't ship",
    description:
      "Every claim in your report has to point at a specific line you wrote. If we can't show you the evidence, it isn't in the report.",
  },
];

export const stats: Stat[] = [
  { value: '12,400', label: 'Answer scripts marked since launch' },
  { value: '+11.6', label: 'Average marks gained, paper 1 to paper 5' },
  { value: '41 hrs', label: 'Median time from upload to report' },
  { value: '1 in 6', label: 'Reports that find no significant gap' },
];

export const testimonialsCol1: Testimonial[] = [
  {
    initials: 'A',
    name: 'Ananya R.',
    role: 'Class 12, CBSE, Pune',
    avatarColor: '#2C5FF6',
    quote:
      'I always got the right answer in Physics and still lost marks. Turned out I was skipping two lines of working every single derivation. Nobody had said it in four years.',
    gain: '61 → 79',
  },
  {
    initials: 'S',
    name: 'Sunita M.',
    role: 'Parent, Class 10',
    avatarColor: '#D93A2B',
    quote:
      "Three tuitions and I still couldn't tell you what my son was actually bad at. The first report said Ray Optics and nothing else. We fixed one chapter instead of paying for everything.",
  },
  {
    initials: 'K',
    name: 'Kabir S.',
    role: 'Class 10, CBSE, Ghaziabad',
    avatarColor: '#1F9D63',
    quote:
      "Writing three full papers by hand before the pre-boards was the whole thing. My wrist gave up in paper one. By paper four it didn't.",
    gain: '+14 marks',
  },
  {
    initials: 'R',
    name: 'Rekha D.',
    role: 'Parent, Class 12',
    avatarColor: '#7A4FD6',
    quote:
      "The report told us she was fine in two subjects and recommended we stop the tuition for those. I didn't expect that from someone I was paying.",
  },
];

export const testimonialsCol2: Testimonial[] = [
  {
    initials: 'M',
    name: 'Mihir P.',
    role: 'Class 12, CBSE, Indore',
    avatarColor: '#E08A1E',
    quote:
      'The annotated script is the useful bit. Seeing my own handwriting with the marks written next to it is very different from reading a list of weak topics.',
    gain: '68 → 84',
  },
  {
    initials: 'F',
    name: 'Farhan A.',
    role: 'Class 10, CBSE, Hyderabad',
    avatarColor: '#2C5FF6',
    quote:
      "Report said 21% of my marks were lost to answers I knew but wrote badly. That's not a study problem, that's a writing problem. Different fix entirely.",
  },
  {
    initials: 'P',
    name: 'Priya N.',
    role: 'Parent, Class 10, Jaipur',
    avatarColor: '#1F9D63',
    quote:
      'Uploaded on WhatsApp on Sunday night, had the report Tuesday morning. My daughter read it herself without me asking.',
  },
  {
    initials: 'V',
    name: 'Vikram J.',
    role: 'Class 12, CBSE, Delhi',
    avatarColor: '#D93A2B',
    quote:
      "Paper three was brutal and the marks dropped. But the report showed which chapter caused it, so it didn't feel like a random bad day.",
    gain: '+9 marks',
  },
];

export const testimonialsCol3: Testimonial[] = [
  {
    initials: 'N',
    name: 'Neha B.',
    role: 'Parent, Class 12, Lucknow',
    avatarColor: '#7A4FD6',
    quote:
      'What I wanted was to know if the coaching money was working. Five papers across the year answered that better than five parent-teacher meetings.',
  },
  {
    initials: 'T',
    name: 'Tanvi G.',
    role: 'Class 10, CBSE, Nagpur',
    avatarColor: '#E08A1E',
    quote:
      'Maths report said my method was fine and I was losing everything on units and final statements. Two weeks later that was gone.',
    gain: '72 → 88',
  },
  {
    initials: 'D',
    name: 'Deepak R.',
    role: 'Parent, Class 10',
    avatarColor: '#2C5FF6',
    quote: "Nobody tried to sell me a course afterwards. That's rarer than it should be.",
  },
  {
    initials: 'I',
    name: 'Ishita K.',
    role: 'Class 12, CBSE, Kolkata',
    avatarColor: '#1F9D63',
    quote:
      'Chemistry stayed flat across all five and the report said so honestly instead of dressing it up. We changed what we were doing because of that.',
  },
];

export const plans: Plan[] = [
  {
    code: 'FIVE_PAPERS',
    name: '5 Papers Bundle',
    whoFor: 'For quick targeted practice before exams',
    price: '₹599',
    mrp: '₹749',
    maxStudents: 1,
    per: 'for 5 full board papers · ₹120 / paper',
    features: [
      '5 full board papers',
      '1 Child Student Account included',
      'Annotated script back each time',
      'Report after every paper',
      '48-hour turnaround',
    ],
    ctaLabel: 'Get 5 Papers',
    ctaHref: '/checkout?plan=FIVE_PAPERS',
  },
  {
    code: 'TWELVE_PAPERS',
    name: '12 Papers Bundle',
    whoFor: 'Our most popular plan for Class 10 & 12 board prep',
    price: '₹1,099',
    mrp: '₹1,299',
    maxStudents: 2,
    per: 'for 12 full board papers · ₹91 / paper',
    features: [
      '12 full board papers',
      '2 Child Student Accounts included',
      'Annotated script back each time',
      'Report after every paper',
      'Priority 24-hour turnaround',
      'Parent summary on WhatsApp',
    ],
    primary: true,
    flag: 'most popular',
    ctaLabel: 'Get 12 Papers',
    ctaHref: '/checkout?plan=TWELVE_PAPERS',
  },
  {
    code: 'TWENTY_PAPERS',
    name: '20 Papers Bundle',
    whoFor: 'Maximum board practice & full subject mastery',
    price: '₹1,999',
    mrp: '₹2,499',
    maxStudents: 2,
    per: 'for 20 full board papers · ₹100 / paper',
    features: [
      '20 full board papers',
      '2 Child Student Accounts included',
      'Annotated script back each time',
      'Report after every paper',
      'Priority 24-hour turnaround',
      'Two examiner call-backs',
    ],
    ctaLabel: 'Get 20 Papers',
    ctaHref: '/checkout?plan=TWENTY_PAPERS',
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'Is a real person marking this, or is it just AI?',
    answer:
      'Both, in that order. Software reads the script and proposes marks against the official marking scheme; a CBSE-experienced evaluator then reviews and can change any of them before the report is released. Nothing goes out unchecked.',
  },
  {
    question: 'How close are your marks to what the board will actually give?',
    answer:
      "We mark to the published CBSE marking scheme for that paper, including step-wise and method marks. We won't promise your board score to the mark — nobody honestly can — but the marks lost and the reasons will match.",
  },
  {
    question: 'Do I need a scanner or a good phone?',
    answer:
      "No. Photograph each page with any phone camera in reasonable light and upload from the browser, or send the photos on WhatsApp. If a page is unreadable we'll tell you which one and ask for it again rather than guess.",
  },
  {
    question: 'Will you try to sell us a course afterwards?',
    answer:
      "No. We don't run tuition, we don't take referral fees from anyone who does, and the report has no advertising in it. If a report finds no significant gap, it says so and recommends you spend nothing further.",
  },
  {
    question: "What happens to my child's answer sheets?",
    answer:
      'Scripts are stored only to produce your reports and are never shared with third parties or used for advertising. You can delete everything from the dashboard at any time. As the parent you consent to the account and can withdraw that consent.',
  },
  {
    question: 'Which boards and classes do you cover?',
    answer:
      "CBSE Class 10 and 12 at the moment. ICSE and state boards are the next step — tell us which one you need and we'll let you know when it opens.",
  },
  {
    question: 'My child gets anxious about tests. Is this going to make it worse?',
    answer:
      'The report never ranks your child against anyone and never comments on effort, attitude or ability. It describes what the paper shows and what to do about it. The recommendation is deliberately small — usually one chapter, twenty minutes, a few evenings a week.',
  },
];
