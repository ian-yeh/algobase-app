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
