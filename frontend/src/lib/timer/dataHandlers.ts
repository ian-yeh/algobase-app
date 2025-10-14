import { Solve } from '@/lib/timer/utils';

export const exportData = (solves: Solve[]) => {
  const blob = new Blob([JSON.stringify({ solves }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `algobase-session-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = async (file: File): Promise<Solve[]> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (Array.isArray(data.solves)) {
      return data.solves as Solve[];
    }
    throw new Error('Invalid format');
  } catch {
    throw new Error('Failed to import data');
  }
};