/**
 * Converte string HH:MM para minutos totais
 */
export function timeToMinutes(time: string): number | null {
  if (!time || time.length !== 5) return null;

  const [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

/**
 * Formata minutos para exibição legível (ex: "8h 30min")
 */
export function formatMinutesToDisplay(totalMinutes: number): string {
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;

  if (hours === 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

export interface WorkHoursResult {
  totalMinutes: number;
  totalFormatted: string;
  remainingMinutes: number;
  remainingFormatted: string;
  status: 'exact' | 'under' | 'over';
}

const TARGET_MINUTES = 8 * 60; // 8 horas em minutos

/**
 * Calcula as horas trabalhadas considerando períodos parciais
 * Retorna resultado mesmo com campos parcialmente preenchidos
 */
export function calculateWorkHours(
  entry1: string,
  exit1: string,
  entry2: string,
  exit2: string
): WorkHoursResult | null {
  const e1 = timeToMinutes(entry1);
  const x1 = timeToMinutes(exit1);
  const e2 = timeToMinutes(entry2);
  const x2 = timeToMinutes(exit2);

  let totalMinutes = 0;
  let hasAnyValidPeriod = false;

  // Calcula período da manhã se ambos os campos estiverem preenchidos
  if (e1 !== null && x1 !== null) {
    const morningMinutes = x1 - e1;
    if (morningMinutes >= 0) {
      totalMinutes += morningMinutes;
      hasAnyValidPeriod = true;
    }
  }

  // Calcula período da tarde se ambos os campos estiverem preenchidos
  if (e2 !== null && x2 !== null) {
    const afternoonMinutes = x2 - e2;
    if (afternoonMinutes >= 0) {
      totalMinutes += afternoonMinutes;
      hasAnyValidPeriod = true;
    }
  }

  // Se nenhum período válido foi calculado, retorna null
  if (!hasAnyValidPeriod) {
    return null;
  }

  const remainingMinutes = TARGET_MINUTES - totalMinutes;

  let status: 'exact' | 'under' | 'over';
  if (totalMinutes === TARGET_MINUTES) {
    status = 'exact';
  } else if (totalMinutes < TARGET_MINUTES) {
    status = 'under';
  } else {
    status = 'over';
  }

  return {
    totalMinutes,
    totalFormatted: formatMinutesToDisplay(totalMinutes),
    remainingMinutes: Math.abs(remainingMinutes),
    remainingFormatted: formatMinutesToDisplay(remainingMinutes),
    status,
  };
}
