export const getPreferredTimezone = () =>
    typeof localStorage === "undefined"
        ? "Asia/Kolkata"
        : localStorage.getItem("workflowx_timezone") || "Asia/Kolkata";

export const getTodayDateString = (date = new Date()) =>
    new Intl.DateTimeFormat("en-CA", {
        timeZone: getPreferredTimezone(),
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);

export const isPastDate = (value, today = getTodayDateString()) =>
    Boolean(value && value < today);

export const formatDate = (value, locale, options = {}) => {
    if (!value) return "";

    return new Date(value).toLocaleDateString(locale, {
        ...options,
        timeZone: getPreferredTimezone()
    });
};

export const formatDateTime = (value, locale, options = {}) => {
    if (!value) return "";

    return new Date(value).toLocaleString(locale, {
        ...options,
        timeZone: getPreferredTimezone()
    });
};
