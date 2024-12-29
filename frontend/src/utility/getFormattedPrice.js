export const getFormattedPrice = (price) => {
    return `${parseInt(price || 0, 10).toLocaleString()}`;
    }