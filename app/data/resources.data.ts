export type ResCat = "web-dev" | "cybersecurity" | "ai-ml" | "problem-solving" | "devops";
export type ResType = "course" | "tutorial" | "documentation" | "project" | "book" | "video";
export type ResLevel = "beginner" | "intermediate" | "advanced";

export interface Resource {
  title: string;
  desc: string;
  cat: ResCat;
  type: ResType;
  lvl: ResLevel;
  lang: "en" | "ar";
  hours: string;
  rating: string;
  free: boolean;
  tags: string[];
  url: string;
}

export const resources: Resource[] = [
  {
    title: "CS50x: Introduction to Computer Science",
    desc: "Harvard’s classic intro. C, Python, SQL and the problem-solving habits behind them.",
    cat: "problem-solving", type: "course", lvl: "beginner", lang: "en",
    hours: "100h", rating: "4.9", free: true, tags: ["c", "python", "algorithms"], url: "https://cs50.harvard.edu/x/",
  },
  {
    title: "TryHackMe · Pre Security",
    desc: "Networking, Linux and web basics in guided rooms. Perfect before your first CTF.",
    cat: "cybersecurity", type: "course", lvl: "beginner", lang: "en",
    hours: "40h", rating: "4.8", free: true, tags: ["networking", "linux", "ctf"], url: "https://tryhackme.com/",
  },
  {
    title: "دورة JavaScript الشاملة",
    desc: "من المتغيرات إلى البرمجة غير المتزامنة، خطوة بخطوة وباللغة العربية.",
    cat: "web-dev", type: "video", lvl: "beginner", lang: "ar",
    hours: "60 ساعة", rating: "4.9", free: true, tags: ["javascript", "dom"], url: "https://elzero.org/",
  },
  {
    title: "Practical Deep Learning for Coders",
    desc: "fast.ai’s top-down course: train real models from the very first lesson.",
    cat: "ai-ml", type: "course", lvl: "intermediate", lang: "en",
    hours: "30h", rating: "4.8", free: true, tags: ["pytorch", "vision", "nlp"], url: "https://course.fast.ai/",
  },
  {
    title: "Hack The Box Academy",
    desc: "Structured modules on web exploitation, privilege escalation and more.",
    cat: "cybersecurity", type: "course", lvl: "advanced", lang: "en",
    hours: "50h", rating: "4.7", free: false, tags: ["pentest", "web"], url: "https://academy.hackthebox.com/",
  },
  {
    title: "Docker Docs · Get started",
    desc: "The official walkthrough: images, containers, volumes and compose.",
    cat: "devops", type: "documentation", lvl: "beginner", lang: "en",
    hours: "6h", rating: "4.6", free: true, tags: ["docker", "compose"], url: "https://docs.docker.com/get-started/",
  },
  {
    title: "مقدمة في تعلم الآلة",
    desc: "المفاهيم الأساسية: الانحدار والتصنيف وتقييم النماذج، مع أمثلة بلغة Python.",
    cat: "ai-ml", type: "course", lvl: "intermediate", lang: "ar",
    hours: "25 ساعة", rating: "4.7", free: true, tags: ["python", "sklearn"], url: "https://academy.hsoub.com/",
  },
  {
    title: "Kaggle Learn · Intro to ML",
    desc: "Short hands-on lessons with notebooks you can run in the browser.",
    cat: "ai-ml", type: "tutorial", lvl: "beginner", lang: "en",
    hours: "7h", rating: "4.7", free: true, tags: ["pandas", "sklearn"], url: "https://www.kaggle.com/learn",
  },
  {
    title: "Competitive Programmer’s Handbook",
    desc: "Free book covering the algorithms that show up in contests again and again.",
    cat: "problem-solving", type: "book", lvl: "intermediate", lang: "en",
    hours: "40h", rating: "4.8", free: true, tags: ["c++", "graphs", "dp"], url: "https://cses.fi/book/",
  },
  {
    title: "أساسيات الأمن السيبراني",
    desc: "الشبكات والتشفير وأشهر الثغرات، تمهيدًا لأول تحدٍّ في CTF.",
    cat: "cybersecurity", type: "course", lvl: "beginner", lang: "ar",
    hours: "18 ساعة", rating: "4.6", free: false, tags: ["networking", "crypto"], url: "https://academy.hsoub.com/",
  },
  {
    title: "MDN · Learn web development",
    desc: "The reference path for HTML, CSS and JavaScript, maintained by Mozilla.",
    cat: "web-dev", type: "documentation", lvl: "beginner", lang: "en",
    hours: "80h", rating: "4.9", free: true, tags: ["html", "css", "js"], url: "https://developer.mozilla.org/en-US/docs/Learn",
  },
  {
    title: "roadmap.sh · DevOps",
    desc: "A community roadmap with what to learn next and links for each step.",
    cat: "devops", type: "project", lvl: "intermediate", lang: "en",
    hours: "—", rating: "4.7", free: true, tags: ["linux", "ci/cd"], url: "https://roadmap.sh/devops",
  },
];

/** [English label, icon, track colour key or null, Arabic label] */
export const CAT: Record<ResCat, [string, string, "B" | "R" | "G" | null, string]> = {
  "web-dev": ["Web Development", "globe", null, "تطوير الويب"],
  cybersecurity: ["Cybersecurity", "shield", "R", "الأمن السيبراني"],
  "ai-ml": ["AI & Machine Learning", "brain", "G", "الذكاء الاصطناعي"],
  "problem-solving": ["Problem Solving", "code-xml", "B", "حل المشكلات"],
  devops: ["DevOps", "server", null, "ديف أوبس"],
};

/** [icon, English label, Arabic label] */
export const TYPE: Record<ResType, [string, string, string]> = {
  course: ["graduation-cap", "COURSE", "دورة"],
  tutorial: ["file-code-2", "TUTORIAL", "درس"],
  documentation: ["file-text", "DOCS", "توثيق"],
  project: ["hammer", "PROJECT", "مشروع"],
  book: ["book-marked", "BOOK", "كتاب"],
  video: ["video", "VIDEO", "فيديو"],
};

export const LV: Record<ResLevel, [string, string]> = {
  beginner: ["BEGINNER", "مبتدئ"],
  intermediate: ["INTERMEDIATE", "متوسط"],
  advanced: ["ADVANCED", "متقدم"],
};
