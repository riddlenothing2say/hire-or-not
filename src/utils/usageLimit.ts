const USAGE_LIMIT_KEY = 'hire-or-not-usage';
const DAILY_LIMIT = 3;

interface UsageData {
  count: number;
  date: string;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getRemainingUsage(): number {
  if (typeof window === 'undefined') return DAILY_LIMIT;
  
  const stored = localStorage.getItem(USAGE_LIMIT_KEY);
  if (!stored) return DAILY_LIMIT;

  try {
    const data: UsageData = JSON.parse(stored);
    const today = getTodayString();
    
    if (data.date !== today) {
      return DAILY_LIMIT;
    }
    
    return Math.max(0, DAILY_LIMIT - data.count);
  } catch (e) {
    return DAILY_LIMIT;
  }
}

export function incrementUsage(): void {
  if (typeof window === 'undefined') return;

  const today = getTodayString();
  const stored = localStorage.getItem(USAGE_LIMIT_KEY);
  let data: UsageData;

  try {
    if (stored) {
      data = JSON.parse(stored);
      if (data.date !== today) {
        data = { count: 1, date: today };
      } else {
        data.count += 1;
      }
    } else {
      data = { count: 1, date: today };
    }
  } catch (e) {
    data = { count: 1, date: today };
  }

  localStorage.setItem(USAGE_LIMIT_KEY, JSON.stringify(data));
}

export function isUsageLimitReached(): boolean {
  return getRemainingUsage() <= 0;
}
