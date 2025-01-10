export const cleanText = (text) => {
    return text
      .replace(/ΓÇ£/g, '“')
      .replace(/ΓÇ¥/g, '”')
      .replace(/ΓÇÖ/g, '’')
      .replace(/ΓÇô/g, '–');
  };