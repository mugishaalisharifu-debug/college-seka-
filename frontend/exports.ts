import { User, BookUser, BookOpen, GraduationCap, Blocks, School, Wrench, Trophy, Monitor, Building2, FlaskConical } from 'lucide-react';

interface AdmissionStep {
  id: string
  stepNumber?: string
  title: string
  description: string
  isDeadlineCard?: boolean
  dateText?: string
}
interface FacilityItem {
  id: string
  count: string | number
  label: string
  icon: React.ElementType
}
interface NewsItem {
  id: string;
  category: string;
  date: string;
  title: string;
  description?: string;
  slug: string;
  isFeatured?: boolean;
}
export interface GalleryItem {
  id: string;
  title: string;
  category: "academics" | "tvet" | "sports" | "campus";
  imageUrl: string;
}
interface CategoryTab {
  key: string;
  label: string;
}
export interface NewsArticle {
  id: string;
  category: "Admissions" | "Facilities" | "Events" | "General";
  date: string;
  title: string;
  summary: string;
  slug: string;
}
export type CategoryFilter = "All" | "Admissions" | "Facilities" | "Events" | "General";

export interface ContactCardItem {
  id: string
  title: string
  icon: React.ElementType
  iconBgColor: string
  iconTextColor: string
  content: React.ReactNode
}

export const NAV_LINKS = [
  { linkName: "Home", link: "/" },
  { linkName: "Our School", link: "/about" },
  { linkName: "Programs", link: "/programs" },
  { linkName: "Admission", link: "/admission" },
  { linkName: "Gallery", link: "/gallery" },
  { linkName: "News", link: '/news'},
  { linkName: "Contact Us", link: "/contact" },
];
export const FOOTER_LINKS = [
  { linkName: "Our School", link: "/about" },
  { linkName: "Programs", link: "/programs" },
  { linkName: "Admission", link: "/admission" },
  { linkName: "Apply Online", link: "/apply" },
  { linkName: "Contact Us", link: "/contact" },
];
export const FOOTER_SUBLINKS = [
  { linkName: "News & Announcements", link: "/news" },
  { linkName: "School Gallery", link: "/gallery" },
  { linkName: "FAQs", link: "/faq" },
  { linkName: "Downloads", link: "/downloads" },
  { linkName: "Check Application Result", link: '/appResult'}
];
export const STATS = [
    {
      icon: User,
      count: "1,250+",
      label: "Students",
    },
    {
      icon: BookUser,
      count: "68",
      label: "Teachers",
    },
    {
      icon: BookOpen,
      count: "4",
      label: "Programs",
    },
    {
      icon: GraduationCap,
      count: "3,400+",
      label: "Graduates",
    },
];
export const PROGRAMS = [
  {
    link: '/nursery',
    cardImage: '/nursery.jpg',
    icon: Blocks,
    header: "Nursery Education",
    subheader: "Early Childhood fondation",
    description: "The nursery section provides a strong educational fundation fo..."
  },
  {
    link: "/primary",
    cardImage: '/primary.jpg',
    icon: School,
    header: "Primary Education",
    subheader: "Build Strong fondations",
    description: "Primary Education develops literacy, numeracy,..."
  },
  {
    link: '/secondary',
    cardImage: '/secondary.jpg',
    icon: GraduationCap,
    header: "Lower Secondary Education",
    subheader: "Preparing for the Future",
    description: "The lower secondary section prepares learners for technical..."
  },
  {
    link: '/tvet',
    cardImage: '/tvet.jpg',
    icon: Wrench,
    header: "TVET Programms",
    subheader: "Technical & Vocational Training",
    description: "The TVET department equips students with practical and..."
  }

]
export const ADMISSION_STEPS: AdmissionStep[] = [
  {
    id: '1',
    stepNumber: '01',
    title: 'Complete Application Form',
    description:
      'Fill out the online application form with student personal information, education level preference, and class or TVET trade selection.',
  },
  {
    id: '2',
    stepNumber: '02',
    title: 'Upload Required Documents',
    description:
      'Upload passport photograph, previous academic report, birth certificate, and parent/guardian identification documents.',
  },
  {
    id: '3',
    stepNumber: '03',
    title: 'Submit Parent Information',
    description:
      'Provide complete parent or guardian contact information, including phone number, email, and residential address.',
  },
  {
    id: '4',
    stepNumber: '04',
    title: 'Application Review',
    description:
      'The school administration will review your submitted application details and verify all uploaded documentation.',
  },
  {
    id: '5',
    stepNumber: '05',
    title: 'Check Admission Results',
    description:
      'Once reviewed, admission results will be published, and successful applicants can track their status directly.',
  },
  {
    id: '6',
    isDeadlineCard: true,
    title: 'Application Deadline',
    description: 'Applications for 2026 close on March 15, 2026.',
    dateText: 'March 15, 2026',
  },
]
export const REQUIRED_DOCUMENTS: string[] = [
  'Passport photograph',
  'Previous academic report or transcript',
  'Birth certificate (if required)',
  'Parent or guardian identification',
  'Medical information',
  'Previous school information',
]
export const FACILITIES_DATA: FacilityItem[] = [
  {
    id: '1',
    count: '24',
    label: 'Classrooms',
    icon: Building2,
  },
  {
    id: '2',
    count: '3',
    label: 'Science Labs',
    icon: FlaskConical,
  },
  {
    id: '3',
    count: '1',
    label: 'Computer Lab',
    icon: Monitor,
  },
  {
    id: '4',
    count: '6',
    label: 'Workshops',
    icon: Wrench,
  },
  {
    id: '5',
    count: '1',
    label: 'Library',
    icon: BookOpen,
  },
  {
    id: '6',
    count: '2',
    label: 'Sports Facilities',
    icon: Trophy,
  },
]
export const SUPPORT_SERVICES: string[] = [
  "Academic guidance and tutoring",
  "Career guidance and counseling",
  "Practical skills training",
  "Student counseling services",
  "Discipline management and mentorship",
  "Co-curricular activities",
  "Health awareness programs",
]
export const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    category: "Admissions",
    date: "January 15, 2026",
    title: "2026 Academic Year Admissions Now Open",
    description:
      "College fondation Sina Gerard is pleased to announce that admissions for the 2026 academic year are now open. All parents and guardians are invited to submit applications through our online admission portal. The application deadline is March 15, 2026. For more information about required documents and the admission process, please visit our Admission Information page.",
    slug: "2026-admissions-open",
    isFeatured: true,
  },
  {
    id: "2",
    category: "Facilities",
    date: "Jan 10",
    title: "TVET Department Opens New Agriculture Workshop",
    slug: "tvet-new-agriculture-workshop",
    isFeatured: false,
  },
  {
    id: "3",
    category: "Events",
    date: "Dec 22",
    title: "Student Excellence Awards Ceremony 2025",
    slug: "student-excellence-awards-2025",
    isFeatured: false,
  },
  {
    id: "4",
    category: "Facilities",
    date: "Nov 15",
    title: "New Computer Laboratory Inaugurated",
    slug: "new-computer-laboratory-inaugurated",
    isFeatured: false,
  },
];
export const CATEGORIES: CategoryTab[] = [
  { key: "all", label: "All Photos" },
  { key: "academics", label: "Academics" },
  { key: "tvet", label: "TVET Workshops" },
  { key: "sports", label: "Sports & Games" },
  { key: "campus", label: "School campus" },
];
export const GALLERY_DATA: GalleryItem[] = [
  {
    id: "1",
    title: "School Campus",
    category: "campus",
    imageUrl: "/garellyHero.jpg",
  },
  {
    id: "2",
    title: "Classroom Learning",
    category: "academics",
    imageUrl: "/classroom.jpg",
  },
  {
    id: "3",
    title: "Science Labaratory",
    category: "academics",
    imageUrl: "/lab.jpg",
  },
  {
    id: "4",
    title: "Tvet Workshop",
    category: "tvet",
    imageUrl: "/workshop.jpg",
  },
  {
    id: "5",
    title: "Annual Football Tournament",
    category: "sports",
    imageUrl: "/sport.jpg",
  },
  {
    id: "6",
    title: "Agriculture Training",
    category: "tvet",
    imageUrl: "/agri.jpg",
  }
];
export const NEWSCATEGORIES: CategoryFilter[] = [
  "All",
  "Admissions",
  "Facilities",
  "Events",
  "General",
];

export const INITIAL_NEWS_DATA: NewsArticle[] = [
  {
    id: "1",
    category: "Admissions",
    date: "January 15, 2026",
    title: "2026 Academic Year Admissions Now Open",
    summary:
      "College fondation Sina Gerard is pleased to announce that admissions for the 2026 academic year are now open. All parents and...",
    slug: "2026-admissions-now-open",
  },
  {
    id: "2",
    category: "Facilities",
    date: "January 10, 2026",
    title: "TVET Department Opens New Agriculture Workshop",
    summary:
      "The TVET department at CFSG has officially opened a new modern agriculture workshop equipped with the latest farming technology...",
    slug: "tvet-department-opens-agriculture-workshop",
  },
  {
    id: "3",
    category: "Events",
    date: "December 22, 2025",
    title: "Student Excellence Awards Ceremony 2025",
    summary:
      "College fondation Sina Gerard held its annual Student Excellence Awards Ceremony on December 20, 2025. The event recognized ov...",
    slug: "student-excellence-awards-ceremony-2025",
  },
  {
    id: "4",
    category: "Facilities",
    date: "November 15, 2025",
    title: "New Computer Laboratory Inaugurated",
    summary:
      "College fondation Sina Gerard has inaugurated a new computer laboratory equipped with 40 modern workstations, high-...",
    slug: "new-computer-laboratory-inaugurated",
  },
  {
    id: "5",
    category: "General",
    date: "January 20, 2026",
    title: "Parent-Teacher Meeting Scheduled",
    summary:
      "All parents and guardians are invited to attend the first parent-teacher meeting of the 2026 academic year scheduled for February 5, 202...",
    slug: "parent-teacher-meeting-scheduled",
  },
];

export interface LevelTeachingAssignment {
  levelOrClass: string; 
  subjects: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department:
    | "Administration"
    | "Nursery"
    | "Primary"
    | "Lower Secondary"
    | "TVET"
    | "Accountant & Finance"
    | "Support";
  bio: string;
  imageUrl: string;
  phone?: string;
  email?: string;
  levelsOrClasses?: string;
  courseOrSubject?: string;
  teachingAssignments?: LevelTeachingAssignment[];
}

export const STAFF_DATA: StaffMember[] = [
  {
    id: "sina-gerard",
    name: "Dr. Sina Gerard",
    role: "Founder & Director",
    department: "Administration",
    phone: "+250 788 000 001",
    email: "director@cfsg.ac.rw",
    bio: "Founder of College fondation Sina Gerard, visionary leader dedicated to transforming education in Rwanda through quality and practical skills.",
    imageUrl: "/images/staff/sina-gerard.jpg",
  },
  {
    id: "jean-bosco",
    name: "Jean Bosco Ndayisaba",
    role: "Head Teacher",
    department: "Administration",
    phone: "+250 788 000 002",
    email: "headteacher@cfsg.ac.rw",
    bio: "Experienced educator with over 15 years in school leadership, overseeing academic programs and teaching standards.",
    imageUrl: "/images/staff/jean-bosco.jpg",
  },
  {
    id: "marie-claire",
    name: "Marie Claire Uwimana",
    role: "Deputy Head Teacher",
    department: "Administration",
    phone: "+250 788 000 003",
    email: "deputy@cfsg.ac.rw",
    bio: "Dedicated to student welfare and academic excellence, coordinating curriculum implementation across all departments.",
    imageUrl: "/images/staff/marie-claire.jpg",
  },
  {
    id: "eric-mugisha",
    name: "Eric Mugisha",
    role: "TVET Instructor",
    department: "TVET",
    phone: "+250 788 000 004",
    email: "e.mugisha@cfsg.ac.rw",
    bio: "Specialist in software engineering and database management with hands-on technical workshop training experience.",
    imageUrl: "/images/staff/eric-mugisha.jpg",
    levelsOrClasses: "Level 3, 4 & 5 SOD",
    courseOrSubject: "Software Development",
    teachingAssignments: [
      {
        levelOrClass: "Level 3 SOD",
        subjects: ["Algorithms & Programming Basics", "Computer Hardware"],
      },
      {
        levelOrClass: "Level 4 SOD",
        subjects: ["Database Systems", "Object-Oriented Programming"],
      },
      {
        levelOrClass: "Level 5 SOD",
        subjects: ["Web Development", "Software Testing"],
      },
    ],
  },
  {
    id: "alice-umutoni",
    name: "Alice Umutoni",
    role: "Food Processing Trainer",
    department: "TVET",
    phone: "+250 788 000 005",
    email: "a.umutoni@cfsg.ac.rw",
    bio: "Expert in food preservation, quality control, and agribusiness processing techniques.",
    imageUrl: "/images/staff/alice-umutoni.jpg",
    levelsOrClasses: "Level 3 & 4 FP",
    courseOrSubject: "Food Processing",
    teachingAssignments: [
      {
        levelOrClass: "Level 3 Food Processing",
        subjects: ["Food Hygiene & Safety", "Raw Material Quality"],
      },
      {
        levelOrClass: "Level 4 Food Processing",
        subjects: ["Dairy & Beverage Processing", "Packaging Technology"],
      },
    ],
  },
  {
    id: "patrick-habimana",
    name: "Patrick Habimana",
    role: "Senior STEM Teacher",
    department: "Lower Secondary",
    phone: "+250 788 000 006",
    email: "p.habimana@cfsg.ac.rw",
    bio: "Passionate mathematics and physics educator preparing secondary students for national exams and technical careers.",
    imageUrl: "/images/staff/patrick-habimana.jpg",
    levelsOrClasses: "S1, S2, S3",
    courseOrSubject: "Physics & Mathematics",
    teachingAssignments: [
      {
        levelOrClass: "Senior One (S1)",
        subjects: ["Fundamental Mathematics", "General Science"],
      },
      {
        levelOrClass: "Senior Two (S2)",
        subjects: ["Algebra", "Introductory Physics"],
      },
      {
        levelOrClass: "Senior Three (S3)",
        subjects: ["Advanced Physics", "Trigonometry & Geometry"],
      },
    ],
  },
];
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category:
    | "Admissions"
    | "Programs"
    | "Fees"
    | "Requirements"
    | "Communication"
    | "General";
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: "faq-1",
    question: "How do I apply for admission to CFSG?",
    answer:
      "You can apply online by visiting our Admissions page, filling out the application form with student details, selecting your preferred education level or TVET trade, and uploading the required documents.",
    category: "Admissions",
  },
  {
    id: "faq-2",
    question: "What documents are required for admission?",
    answer:
      "Applicants need to provide a passport photograph, previous academic reports or transcripts, birth certificate (if required), parent/guardian identification, and relevant medical information.",
    category: "Requirements",
  },
  {
    id: "faq-3",
    question: "What education levels does CFSG offer?",
    answer:
      "College fondation Sina Gerard offers Nursery Education, Primary Education, Lower Secondary Education, and accredited TVET Programs (Technical and Vocational Education and Training).",
    category: "Programs",
  },
  {
    id: "faq-4",
    question: "How can I check my child's application status?",
    answer:
      "Once you submit your application online, you can log into the student portal using your application tracking code or contact our admissions office directly via email or phone.",
    category: "Communication",
  },
  {
    id: "faq-5",
    question: "What are the school fees for each level?",
    answer:
      "School fees vary depending on the department (Nursery, Primary, Lower Secondary, or TVET trade). Detailed fee structures are sent upon application or can be requested directly from our finance office.",
    category: "Fees",
  },
  {
    id: "faq-6",
    question: "Does CFSG offer scholarships or financial assistance?",
    answer:
      "Yes, CFSG provides merit-based scholarships and financial assistance programs for eligible and outstanding students through the Sina Gerard fondation.",
    category: "General",
  },
  {
    id: "faq-7",
    question: "What TVET trades are available at CFSG?",
    answer:
      "We offer Food Processing, Construction, Mechanics, Automobile Technology, Veterinary, and Agriculture trades equipped with modern workshops and hands-on training.",
    category: "Programs",
  },
];
export interface DownloadItem {
  id: string | number;
  title: string;
  description: string;
  fileFormat: string;
  fileSize: string;
  category: "General" | "Admissions" | "Fees" | "Requirements" | "Academic";
  downloadUrl: string;
}

export const DOWNLOADS_DATA: DownloadItem[] = [
  {
    id: "doc-1",
    title: "2026 Academic Year Calendar",
    description:
      "Complete academic calendar for the 2026 school year including term dates, holidays, and examination schedules.",
    fileFormat: "PDF",
    fileSize: "245 KB",
    category: "General",
    downloadUrl: "/documents/2026-academic-calendar.pdf",
  },
  {
    id: "doc-2",
    title: "Admission Application Form",
    description:
      "Official admission application form for all education levels. Can be filled online or printed and submitted physically.",
    fileFormat: "PDF",
    fileSize: "128 KB",
    category: "Admissions",
    downloadUrl: "/documents/admission-application-form.pdf",
  },
  {
    id: "doc-3",
    title: "School Fee Structure 2026",
    description:
      "Detailed fee structure for Nursery, Primary, Secondary, and TVET programs for the 2026 academic year.",
    fileFormat: "PDF",
    fileSize: "156 KB",
    category: "Fees",
    downloadUrl: "/documents/school-fee-structure-2026.pdf",
  },
  {
    id: "doc-4",
    title: "School Rules and Regulations",
    description:
      "Complete guide to school rules, student conduct expectations, disciplinary procedures, and rights.",
    fileFormat: "PDF",
    fileSize: "312 KB",
    category: "General",
    downloadUrl: "/documents/school-rules-and-regulations.pdf",
  },
  {
    id: "doc-5",
    title: "Uniform Requirements Guide",
    description:
      "Complete guide and specifications for official school uniforms across primary, secondary, and TVET levels.",
    fileFormat: "PDF",
    fileSize: "180 KB",
    category: "Requirements",
    downloadUrl: "/documents/uniform-requirements-guide.pdf",
  },
];

export type StaffRole =
  | "HEADMASTER_PRIMARY"
  | "HEADMASTER_SECONDARY_TVET"
  | "ADMINISTRATOR"
  | "DOS_SECONDARY"
  | "DOS_TVET"
  | "STORE_MANAGER"
  | "BURSAR"
  | "CASHIER"
  | "REQUIREMENT_COLLECTOR";

export const ROLE_REDIRECT_MAP: Record<StaffRole, string> = {
  HEADMASTER_PRIMARY: "/dashboard/headmaster-primary",
  HEADMASTER_SECONDARY_TVET: "/dashboard/headmaster-secondary-tvet",
  ADMINISTRATOR: "/dashboard/administrator",
  DOS_SECONDARY: "/dashboard/dos-secondary",
  DOS_TVET: "/dashboard/dos-tvet",
  STORE_MANAGER: "/dashboard/store-manager",
  BURSAR: "/dashboard/bursar",
  CASHIER: "/dashboard/cashier",
  REQUIREMENT_COLLECTOR: "/dashboard/requirement-collector",
};
// lib/navigation.ts
export interface NavItem {
  label: string;
  href: string;
  iconName: string; // Used to render Lucide icons dynamically
}

export const ROLE_NAV_CONFIG: Record<string, NavItem[]> = {
  "headmaster-primary": [
    { label: "Overview", href: "/dashboard/headmaster-primary", iconName: "LayoutDashboard" },
    { label: "Primary Applications", href: "/dashboard/headmaster-primary/primary-applications", iconName: "UserCheck" },
    { label: "Classes Management", href: "/dashboard/headmaster-primary/class-management", iconName: "Boxes" },
    { label: "Primary Reports", href: "/dashboard/headmaster-primary/primary-reports", iconName: "FileText" },
    { label: "Student Records", href: "/dashboard/headmaster-primary/student-records", iconName: "Users" },
  ],
  "headmaster-secondary-tvet": [
    { label: "Overview", href: "/dashboard/headmaster-secondary-tvet", iconName: "LayoutDashboard" },
    { label: "Finances", href: "/dashboard/headmaster-secondary-tvet/finances", iconName: "TrendingUp" },
    { label: "Inventory", href: "/dashboard/headmaster-secondary-tvet/inventory", iconName: "Boxes" },
    { label: "Reports", href: "/dashboard/headmaster-secondary-tvet/reports", iconName: "FileText" },
    { label: "DOS Secondary", href: "/dashboard/dos-secondary", iconName: "GraduationCap" },
    { label: "DOS TVET", href: "/dashboard/dos-tvet", iconName: "Wrench" },
  ],
  "dos-secondary": [
    { label: "Overview", href: "/dashboard/dos-secondary", iconName: "LayoutDashboard" },
    { label: "Applications", href: "/dashboard/dos-secondary/applications", iconName: "UserCheck" },
    { label: "Classes & Streams", href: "/dashboard/dos-secondary/classes", iconName: "Boxes" },
    { label: "Students", href: "/dashboard/dos-secondary/students", iconName: "Users" },
    { label: "Teachers", href: "/dashboard/dos-secondary/teachers", iconName: "BriefcaseBusiness" },
  ],
  "dos-tvet": [
    { label: "Overview", href: "/dashboard/dos-tvet", iconName: "LayoutDashboard" },
    { label: "TVET Applications", href: "/dashboard/dos-tvet/applications", iconName: "UserCheck" },
    { label: "Trade Classes", href: "/dashboard/dos-tvet/classes", iconName: "Boxes" },
    { label: "Student Records", href: "/dashboard/dos-tvet/students", iconName: "Users" },
    { label: "Trainers", href: "/dashboard/dos-tvet/teachers", iconName: "BriefcaseBusiness" },
  ],
  bursar: [
    { label: "Overview", href: "/dashboard/bursar", iconName: "LayoutDashboard" },
    { label: "Fees Setup", href: "/dashboard/bursar/fees-structure", iconName: "Receipt" },
    { label: "Payments", href: "/dashboard/bursar/payments", iconName: "CreditCard" },
    { label: "Reports", href: "/dashboard/bursar/cash-flow", iconName: "FileText" }
  ],
  cashier: [
    { label: "Overview", href: "/dashboard/cashier", iconName: "LayoutDashboard" },
    { label: "Stock In", href: "/dashboard/cashier/stock-in", iconName: "PackagePlus" },
    { label: "Stock Out", href: "/dashboard/cashier/stock-out", iconName: "PackageMinus" },
    { label: "Spoilage", href: "/dashboard/cashier/spoilage", iconName: "AlertTriangle" },
    { label: "Get Report", href: "/dashboard/cashier/report", iconName: "FileText" },
  ],
  "store-manager": [
    { label: "Overview", href: "/dashboard/store-manager", iconName: "LayoutDashboard" },
    { label: "Collected Items", href: "/dashboard/store-manager/collected-items", iconName: "Package" },
    { label: "Usage Log", href: "/dashboard/store-manager/usage-log", iconName: "FileText" },
    { label: "Inventory Report", href: "/dashboard/store-manager/report", iconName: "BarChart3" },
  ],
  "requirement-collector": [
    { label: "Overview", href: "/dashboard/requirement-collector", iconName: "LayoutDashboard" },
    { label: "Student Check", href: "/dashboard/requirement-collector/student-check", iconName: "ClipboardCheck" },
    { label: "School Material Setup", href: "/dashboard/requirement-collector/school-supplies", iconName: "Box" },
  ],
  administrator: [
    { label: "Overview", href: "/dashboard/administrator", iconName: "LayoutDashboard" },
    { label: "News", href: "/dashboard/administrator/news", iconName: "Newspaper" },
    { label: "Gallery", href: "/dashboard/administrator/gallery", iconName: "Monitor" },
    { label: "Downloads", href: "/dashboard/administrator/downloads", iconName: "Download" },
    { label: "Messages", href: "/dashboard/administrator/contact-messages", iconName: "Mail" },
    { label: "Recover Account", href: "/dashboard/administrator/account-recovery", iconName: "KeyRound"}
  ],
};

export function getNavLinksForPath(pathname: string): NavItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const roleSegment = segments[1];

  return ROLE_NAV_CONFIG[roleSegment] || ROLE_NAV_CONFIG["administrator"];
}