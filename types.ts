
export const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY0NzQ4YiI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

export enum WasteType {
  PLASTIC = 'PLASTIC',
  GLASS = 'GLASS',
  METAL = 'METAL',
  PAPER = 'PAPER',
  ELECTRONIC = 'ELECTRONIC',
  NON_RECYCLABLE = 'NON_RECYCLABLE',
  UNKNOWN = 'UNKNOWN'
}

export interface WasteAnalysis {
  type: WasteType;
  confidence: number;
  estimatedWeight: number; // in kg
  estimatedValue: number; // in Rands (ZAR)
  itemsDetected: string[];
  summary: string;
}

export enum HazardSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface HazardReport {
  id: string;
  timestamp: string;
  image?: string;
  severity: HazardSeverity;
  description: string;
  location: string;
  referenceNumber: string;
  status: 'Reported' | 'Acknowledged' | 'In Progress' | 'Resolved';
}

export interface SaleTransaction {
  id: string;
  timestamp: string;
  materialType: WasteType;
  weight: number;
  value: number;
  status: 'Verified' | 'Pending Verification';
}

export interface RecyclingCenter {
  name: string;
  address: string;
  distance: string;
  phone: string;
  type: string[];
  coordinates: { lat: number; lng: number };
}

export interface RewardPartner {
  name: string;
  logo: string;
  offer: string;
  requiredBadgeId: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  color: string;
  reward?: string;
}

export interface LeaderboardEntry {
  name: string;
  points: number;
  rank: number;
  avatar: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  earnings: number;
  reportsCount: number;
  points: number;
  badges: Badge[];
  salesHistory: SaleTransaction[];
  isMunicipal?: boolean;
}
