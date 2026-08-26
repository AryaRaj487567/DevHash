const generateExcerpt = (content, maxLength = 250) => {
  const plain = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`>\[\]()!_-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.substring(0, maxLength - 3)}...`;
};

module.exports = generateExcerpt;
