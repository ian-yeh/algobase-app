/**
 * Calculates the trimmed mean (Average of N) for a list of times.
 * In speedcubing, AO5/AO12 involves removing the fastest and slowest times
 * and averaging the rest.
 */
export const calculateAverage = (times: number[], n: number): number | null => {
    if (times.length < n) return null;

    const recentTimes = times.slice(0, n);
    const sortedTimes = [...recentTimes].sort((a, b) => a - b);

    // Remove fastest and slowest
    const trimmed = sortedTimes.slice(1, -1);

    const sum = trimmed.reduce((acc, current) => acc + current, 0);
    return sum / trimmed.length;
};

export const calculateAO5 = (times: number[]) => calculateAverage(times, 5);
export const calculateAO12 = (times: number[]) => calculateAverage(times, 12);

/**
 * Generates a series of averages (AO5/AO12) from an array of times.
 * Times array is expected to be chronological (index 0 is newest).
 */
export const calculateAverageSeries = (times: number[], n: number): (number | null)[] => {
    return times.map((_, index) => {
        const slice = times.slice(index, index + n);
        return calculateAverage(slice, n);
    });
};

export const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const showHours = days > 0 || hours > 0;
    const showMinutes = showHours || minutes > 0;

    const parts = [];
    if (showHours) parts.push(hours.toString().padStart(2, '0'));
    if (showMinutes) parts.push(minutes.toString().padStart(showHours ? 2 : 1, '0'));
    parts.push(seconds.toString().padStart(showMinutes ? 2 : 1, '0'));

    const dayPrefix = days > 0 ? `${days}d ` : '';
    return `${dayPrefix}${parts.join(':')}.${milliseconds.toString().padStart(2, '0')}`;
};

export const formatSecondsTime = (seconds: number | null | undefined) => {
    if (!seconds || seconds === Infinity) return '--';
    return formatTime(seconds * 1000);
};
