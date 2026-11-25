"use client";

import {
  ArrowDownWideNarrow, ArrowLeft, ArrowRight, ArrowUpNarrowWide, ArrowUpRight, AtSign,
  Ban, BookMarked, BookOpen, Brain, Calendar, CalendarClock, CalendarDays, Check, CheckCheck,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsLeft, CircleAlert, CircleCheck,
  CircleDashed, CircleX, Clock, Clock3, Code, CodeXml, Compass, Copy, Crown, Ellipsis,
  ExternalLink, Eye, EyeOff, Facebook, FileCode2, FileText, Flag, FlagTriangleRight, Flame,
  Gamepad2, Github, GraduationCap, Globe, Hammer, Hash, History, House, Inbox, Info, Instagram,
  Languages, LayoutGrid, Lightbulb, Linkedin, List, LoaderCircle, Lock, LogIn, LogOut, Mail,
  Menu,
  MapPin, Maximize, MessageCircle, Mic, Minus, Moon, MousePointer2, NotebookPen, PanelLeftClose,
  PanelLeftOpen, Pencil, Plus, Pointer, RotateCcw, Rocket, Save, Search, SearchX, Send, Server,
  Settings, Shield, ShieldCheck, SlidersHorizontal, Sprout, Star, Sun, Swords, Terminal,
  TrendingUp, Trophy, Twitter, User, Users, UsersRound, Video, WifiOff, X, Youtube, Zap,
} from "lucide-react";
import type { CSSProperties } from "react";

/** lucide-static kebab names (as used by <ym-icon n="…">) → lucide-react components */
const REG = {
  "arrow-down-wide-narrow": ArrowDownWideNarrow,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up-narrow-wide": ArrowUpNarrowWide,
  "arrow-up-right": ArrowUpRight,
  "at-sign": AtSign,
  ban: Ban,
  "book-marked": BookMarked,
  "book-open": BookOpen,
  brain: Brain,
  calendar: Calendar,
  "calendar-clock": CalendarClock,
  "calendar-days": CalendarDays,
  check: Check,
  "check-check": CheckCheck,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevrons-left": ChevronsLeft,
  "circle-alert": CircleAlert,
  "circle-check": CircleCheck,
  "circle-dashed": CircleDashed,
  "circle-x": CircleX,
  clock: Clock,
  "clock-3": Clock3,
  code: Code,
  "code-xml": CodeXml,
  compass: Compass,
  copy: Copy,
  crown: Crown,
  ellipsis: Ellipsis,
  "external-link": ExternalLink,
  eye: Eye,
  "eye-off": EyeOff,
  facebook: Facebook,
  "file-code-2": FileCode2,
  "file-text": FileText,
  flag: Flag,
  "flag-triangle-right": FlagTriangleRight,
  flame: Flame,
  "gamepad-2": Gamepad2,
  github: Github,
  globe: Globe,
  "graduation-cap": GraduationCap,
  hammer: Hammer,
  hash: Hash,
  history: History,
  house: House,
  inbox: Inbox,
  info: Info,
  instagram: Instagram,
  languages: Languages,
  "layout-grid": LayoutGrid,
  lightbulb: Lightbulb,
  linkedin: Linkedin,
  list: List,
  "loader-circle": LoaderCircle,
  lock: Lock,
  "log-in": LogIn,
  "log-out": LogOut,
  mail: Mail,
  "map-pin": MapPin,
  menu: Menu,
  maximize: Maximize,
  "message-circle": MessageCircle,
  mic: Mic,
  minus: Minus,
  moon: Moon,
  "mouse-pointer-2": MousePointer2,
  "notebook-pen": NotebookPen,
  "panel-left-close": PanelLeftClose,
  "panel-left-open": PanelLeftOpen,
  pencil: Pencil,
  plus: Plus,
  pointer: Pointer,
  rocket: Rocket,
  "rotate-ccw": RotateCcw,
  save: Save,
  search: Search,
  "search-x": SearchX,
  send: Send,
  server: Server,
  settings: Settings,
  shield: Shield,
  "shield-check": ShieldCheck,
  "sliders-horizontal": SlidersHorizontal,
  sprout: Sprout,
  star: Star,
  sun: Sun,
  swords: Swords,
  terminal: Terminal,
  "trending-up": TrendingUp,
  trophy: Trophy,
  twitter: Twitter,
  user: User,
  users: Users,
  "users-round": UsersRound,
  video: Video,
  "wifi-off": WifiOff,
  x: X,
  youtube: Youtube,
  zap: Zap,
} as const;

export type IconName = keyof typeof REG;

export default function Icon({
  n,
  s = 16,
  w = 2,
  f,
  style,
  className,
}: {
  n: IconName | string;
  /** size, matches ym-icon's `s` */
  s?: number | string;
  /** stroke-width, matches ym-icon's `w` */
  w?: number | string;
  /** filled, matches ym-icon's `f="1"` */
  f?: boolean | string;
  style?: CSSProperties;
  className?: string;
}) {
  const C = REG[n as IconName];
  const size = typeof s === "string" ? Number(s) : s;
  if (!C) {
    return (
      <span
        aria-hidden="true"
        style={{ display: "inline-flex", flex: "none", width: size, height: size, ...style }}
        className={className}
      />
    );
  }
  const filled = !!f && f !== "0" && f !== "";
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", flex: "none", lineHeight: 0, ...style }}
      className={className}
    >
      <C
        size={size}
        strokeWidth={typeof w === "string" ? Number(w) : w}
        fill={filled ? "currentColor" : "none"}
        style={{ display: "block" }}
      />
    </span>
  );
}
