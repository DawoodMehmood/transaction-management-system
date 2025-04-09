export const getFormattedPrice = (price) => {
    const num = Number(price || 0);
    if (num % 1 === 0) {
      // It's an integer, no decimals needed.
      return num.toLocaleString();
    }
    // Otherwise, show two decimals.
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  