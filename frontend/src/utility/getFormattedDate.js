export const formatDate = (date) => {
    return date
      ? date.toLocaleDateString('en-US', {
          // month: 'short',
          // day: 'numeric',
          // year: 'numeric',
        })
      : 'N/A';
  };

// export function formatDate(dateString) {
//   const date = new Date(dateString);

//   // Get day, month, and year, ensuring they are two digits
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//   const year = date.getFullYear();

//   // Return the formatted date in MM/DD/YYYY format
//   return `${month}/${day}/${year}`;
// }