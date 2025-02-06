// export const formatDate = (date) => {
//     return date
//       ? date.toLocaleDateString('en-US', {
//           // month: 'short',
//           // day: 'numeric',
//           // year: 'numeric',
//         })
//       : 'N/A';
//   };

// export const formatDate = (date) => {
//   return date
//     ? new Intl.DateTimeFormat('en-US', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         timeZone: 'UTC', // Ensures UTC is used
//       }).format(date)
//     : 'N/A';
// };

// export function formatDate(date) {
//   // const date = new Date(dateString);

//   // Get day, month, and year, ensuring they are two digits
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//   const year = date.getFullYear();

//   // Return the formatted date in MM/DD/YYYY format
//   return `${month}/${day}/${year}`;
// }

export const formatDate = (date) => {
  return date
    ? `${(date.getUTCMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getUTCDate().toString().padStart(2, '0')}/${date.getUTCFullYear()}`
    : 'N/A';
};

export const formatDateADayBefore = (date) => {
  if (!date) return 'N/A';

  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() - 1); // Subtract one day

  return `${(adjustedDate.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}/${adjustedDate
    .getUTCDate()
    .toString()
    .padStart(2, '0')}/${adjustedDate.getUTCFullYear()}`;
};

export const getDateADayAfter = (date) => {
  if (!date) return null;

  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + 1);
  return adjustedDate
}