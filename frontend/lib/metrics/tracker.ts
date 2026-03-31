/**
 * Metrics Tracking Module
 * 
 * Tracks DAU (Daily Active Users), transactions, retention, and other
 * key metrics for the CommitLock platform. Data is stored in localStorage
 * and can be exported via the /api/metrics endpoint.
 */

export interface DailyMetrics {
  date: string;
  activeUsers: string[];
  transactions: number;
  reservationsCreated: number;
  bookingsMade: number;
  attendanceConfirmed: number;
  noShows: number;
  totalDepositLocked: string;
  totalDepositRefunded: string;
  feesSponsored: number;
}

export interface OverallMetrics {
  totalUsers: number;
  totalTransactions: number;
  totalReservations: number;
  totalBookings: number;
  totalDepositsLocked: string;
  totalDepositsRefunded: string;
  totalFeesSponsored: number;
  dau: number;
  wau: number;
  mau: number;
  retentionRate: number;
  averageDeposit: string;
  noShowRate: number;
  dailyMetrics: DailyMetrics[];
}

const METRICS_KEY = 'commitlock_metrics';
const USERS_KEY = 'commitlock_known_users';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getStoredMetrics(): DailyMetrics[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMetrics(metrics: DailyMetrics[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}

function getTodayMetrics(): DailyMetrics {
  const all = getStoredMetrics();
  const today = getToday();
  const existing = all.find(m => m.date === today);
  if (existing) return existing;
  return {
    date: today,
    activeUsers: [],
    transactions: 0,
    reservationsCreated: 0,
    bookingsMade: 0,
    attendanceConfirmed: 0,
    noShows: 0,
    totalDepositLocked: '0',
    totalDepositRefunded: '0',
    feesSponsored: 0,
  };
}

function saveTodayMetrics(todayMetrics: DailyMetrics): void {
  const all = getStoredMetrics();
  const today = getToday();
  const idx = all.findIndex(m => m.date === today);
  if (idx >= 0) {
    all[idx] = todayMetrics;
  } else {
    all.push(todayMetrics);
  }
  saveMetrics(all);
}

// Track a user as active today
export function trackActiveUser(walletAddress: string): void {
  if (!walletAddress) return;
  const metrics = getTodayMetrics();
  if (!metrics.activeUsers.includes(walletAddress)) {
    metrics.activeUsers.push(walletAddress);
  }
  saveTodayMetrics(metrics);

  // Also track in known users
  if (typeof window !== 'undefined') {
    const knownRaw = localStorage.getItem(USERS_KEY);
    const known: string[] = knownRaw ? JSON.parse(knownRaw) : [];
    if (!known.includes(walletAddress)) {
      known.push(walletAddress);
      localStorage.setItem(USERS_KEY, JSON.stringify(known));
    }
  }
}

// Track a transaction
export function trackTransaction(type: 'reservation' | 'booking' | 'attendance' | 'noshow', depositStroops?: string): void {
  const metrics = getTodayMetrics();
  metrics.transactions += 1;

  switch (type) {
    case 'reservation':
      metrics.reservationsCreated += 1;
      if (depositStroops) {
        metrics.totalDepositLocked = (BigInt(metrics.totalDepositLocked) + BigInt(depositStroops)).toString();
      }
      break;
    case 'booking':
      metrics.bookingsMade += 1;
      if (depositStroops) {
        metrics.totalDepositLocked = (BigInt(metrics.totalDepositLocked) + BigInt(depositStroops)).toString();
      }
      break;
    case 'attendance':
      metrics.attendanceConfirmed += 1;
      if (depositStroops) {
        metrics.totalDepositRefunded = (BigInt(metrics.totalDepositRefunded) + BigInt(depositStroops)).toString();
      }
      break;
    case 'noshow':
      metrics.noShows += 1;
      break;
  }

  saveTodayMetrics(metrics);
}

// Track a sponsored fee
export function trackSponsoredFee(): void {
  const metrics = getTodayMetrics();
  metrics.feesSponsored += 1;
  saveTodayMetrics(metrics);
}

// Calculate overall metrics
export function getOverallMetrics(): OverallMetrics {
  const allDaily = getStoredMetrics();
  const today = getToday();
  const now = new Date();

  // Calculate date ranges
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Get all unique users across all days
  const allUsers = new Set<string>();
  const weekUsers = new Set<string>();
  const monthUsers = new Set<string>();
  const todayUsers = new Set<string>();

  let totalTx = 0;
  let totalRes = 0;
  let totalBook = 0;
  let totalLocked = BigInt(0);
  let totalRefunded = BigInt(0);
  let totalFees = 0;
  let totalNoShows = 0;
  let totalAttendance = 0;

  for (const day of allDaily) {
    day.activeUsers.forEach(u => allUsers.add(u));
    if (day.date >= weekAgo) day.activeUsers.forEach(u => weekUsers.add(u));
    if (day.date >= monthAgo) day.activeUsers.forEach(u => monthUsers.add(u));
    if (day.date === today) day.activeUsers.forEach(u => todayUsers.add(u));

    totalTx += day.transactions;
    totalRes += day.reservationsCreated;
    totalBook += day.bookingsMade;
    totalLocked += BigInt(day.totalDepositLocked || '0');
    totalRefunded += BigInt(day.totalDepositRefunded || '0');
    totalFees += day.feesSponsored;
    totalNoShows += day.noShows;
    totalAttendance += day.attendanceConfirmed;
  }

  // Also include known users from localStorage
  if (typeof window !== 'undefined') {
    const knownRaw = localStorage.getItem(USERS_KEY);
    if (knownRaw) {
      const known: string[] = JSON.parse(knownRaw);
      known.forEach(u => allUsers.add(u));
    }
  }

  const totalCompleted = totalAttendance + totalNoShows;
  const noShowRate = totalCompleted > 0 ? (totalNoShows / totalCompleted) * 100 : 0;
  const avgDeposit = totalRes > 0 ? totalLocked / BigInt(totalRes) : BigInt(0);

  // Retention: users active this week who were also active last week
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastWeekUsers = new Set<string>();
  for (const day of allDaily) {
    if (day.date >= lastWeekStart && day.date < weekAgo) {
      day.activeUsers.forEach(u => lastWeekUsers.add(u));
    }
  }
  const returningUsers = Array.from(weekUsers).filter(u => lastWeekUsers.has(u)).length;
  const retentionRate = lastWeekUsers.size > 0 ? (returningUsers / lastWeekUsers.size) * 100 : 0;

  return {
    totalUsers: allUsers.size,
    totalTransactions: totalTx,
    totalReservations: totalRes,
    totalBookings: totalBook,
    totalDepositsLocked: totalLocked.toString(),
    totalDepositsRefunded: totalRefunded.toString(),
    totalFeesSponsored: totalFees,
    dau: todayUsers.size,
    wau: weekUsers.size,
    mau: monthUsers.size,
    retentionRate: Math.round(retentionRate * 100) / 100,
    averageDeposit: avgDeposit.toString(),
    noShowRate: Math.round(noShowRate * 100) / 100,
    dailyMetrics: allDaily.slice(-30), // last 30 days
  };
}

// Seed initial metrics data for demonstration
export function seedDemoMetrics(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(METRICS_KEY)) return; // Don't overwrite

  const demoWallets = [
    'GCHL5OZXVWCPYHYPOGTE4I34QF722T3UWWJ2BCW62TJNSCW27ESYNNEL',
    'GACWMMFQI2SHVOIRFEVFA24JHGLMYRIADR5PPR5L6LUZ4VGXKPXL7IEL',
    'GB7JTK5W6ZD4OZJM3P73PTXF5KPN75YAQUE7HPOW2FGGLNHU3AYTVMCT',
    'GBDR5J6EJWEYQUCRZQIIEGTJU7W4BSYCN5I5TEKGESWYJXOARS4ETMFQ',
    'GCXD73CL6J7OMAYEZ3BLZLYDXUFHT6DTTUSRS7K6CZZIGZWI3K7CA5JP',
    'GBQ25RFHI5DJASFDCK3MFHRXNLRDMYVTZNA7RPZM77JUXNRNPZO5KA2P',
  ];

  const metrics: DailyMetrics[] = [];
  const now = new Date();

  for (let i = 14; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const usersToday = demoWallets.slice(0, Math.min(3 + Math.floor(Math.random() * 4), 6));
    const txCount = 2 + Math.floor(Math.random() * 6);
    const resCreated = 1 + Math.floor(Math.random() * 3);
    const bookMade = Math.floor(Math.random() * 3);
    const attended = Math.floor(Math.random() * 2);
    const noShows = Math.random() > 0.8 ? 1 : 0;

    metrics.push({
      date: dateStr,
      activeUsers: usersToday,
      transactions: txCount,
      reservationsCreated: resCreated,
      bookingsMade: bookMade,
      attendanceConfirmed: attended,
      noShows,
      totalDepositLocked: (BigInt(resCreated) * BigInt(5000000)).toString(),
      totalDepositRefunded: (BigInt(attended) * BigInt(5000000)).toString(),
      feesSponsored: Math.floor(Math.random() * 3),
    });
  }

  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
  localStorage.setItem(USERS_KEY, JSON.stringify(demoWallets));
}
