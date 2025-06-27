import {
    Home,
    BookOpenCheck,
    CheckSquare,
    Newspaper,
    User,
    ShieldCheck,
    ClipboardPen,
    Ticket,
    RadioTower,
    GraduationCap,
    MessageSquare,
    ScrollText,
    Scissors,
    Trophy,
    CircleDot
  } from 'lucide-react';
  
  export const featureGridLinks = [
      { href: "/scholarship", icon: ClipboardPen, textKey: "scholarshipForm" },
      { href: "/admit-card", icon: Ticket, textKey: "admitCard" },
      { href: "/courses", icon: BookOpenCheck, textKey: "ourCourses" },
      { href: "/live-classes", icon: RadioTower, textKey: "liveClasses" },
      { href: "/daily-posts", icon: Newspaper, textKey: "dailyPosts" },
      { href: "/tests", icon: CheckSquare, textKey: "aiTest" },
      { href: "/ai-tutor", icon: GraduationCap, textKey: "aiTutor" },
      { href: "/ai-chat", icon: MessageSquare, textKey: "aiChat" },
      { href: "/current-affairs", icon: ScrollText, textKey: "currentAffairs" },
      { href: "/cutoff-checker", icon: Scissors, textKey: "cutoffChecker" },
      { href: "/toppers", icon: Trophy, textKey: "toppers" },
      { href: "/contact", icon: CircleDot, textKey: "contactUs" },
  ];
  
  export const bottomNavLinks = [
      { textKey: 'navHome', href: '/', icon: Home },
      { textKey: 'navCourses', href: '/courses', icon: BookOpenCheck },
      { textKey: 'navTest', href: '/tests', icon: CheckSquare },
      { textKey: 'navPosts', href: '/daily-posts', icon: Newspaper },
      { textKey: 'navAccount', href: '/account', icon: User },
  ];
  