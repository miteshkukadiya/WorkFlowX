export const formatDuration = (
    totalSeconds = 0
) => {

    const seconds =
        Math.max(
            0,
            Math.floor(totalSeconds)
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const remainingSeconds =
        seconds % 60;


    return [
        hours,
        minutes,
        remainingSeconds
    ]
        .map(
            (value) =>
                String(value)
                    .padStart(2, "0")
        )
        .join(":");
};


export const formatHoursMinutes = (
    totalSeconds = 0
) => {

    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
        );


    if (hours === 0) {
        return `${minutes}m`;
    }


    return `${hours}h ${minutes}m`;
};