export function roundingUpTime(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
