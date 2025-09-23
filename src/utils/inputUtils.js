
export const allowTwoDecimals = (value) => {
    if (!value) return "";
    // Replace invalid characters
    let sanitized = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = sanitized.split(".");
    if (parts.length > 2) {
        sanitized = parts[0] + "." + parts[1];
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        sanitized = parts[0] + "." + parts[1].substring(0, 2);
    }

    return sanitized;
};

/**
 * Attach to input onPaste event
 */
export const handleDecimalPaste = (event) => {
    const pasted = event.clipboardData.getData("text");
    const sanitized = allowTwoDecimals(pasted);
    event.preventDefault();
    return sanitized;
};
