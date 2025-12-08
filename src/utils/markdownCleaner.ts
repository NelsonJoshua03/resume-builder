export const cleanMarkdownContent = (content: string): string => {
  let cleaned = content;
  
  // Fix common markdown issues
  cleaned = cleaned
    // Ensure proper table formatting
    .replace(/\|(?:\s*\|\s*)+/g, (match) => {
      const columns = match.split('|').filter(col => col.trim() !== '');
      const separatorRow = columns.map(() => '---').join(' | ');
      return `| ${columns.join(' | ')} |\n| ${separatorRow} |`;
    })
    
    // Fix code block language specifiers
    .replace(/```(\w+)?\n/g, '```$1\n')
    
    // Fix lists with asterisks
    .replace(/\*\s+/g, '- ')
    
    // Ensure proper spacing around headings
    .replace(/#{1,6}\s+([^\n]+)/g, (match) => {
      return match.trim();
    })
    
    // Fix line breaks
    .replace(/\n{3,}/g, '\n\n')
    
    // Fix email addresses
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<$1>');
  
  return cleaned;
};

export const extractFrontmatter = (content: string): { frontmatter: Record<string, any>, content: string } => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);
  
  if (match) {
    const frontmatter = match[1];
    const contentWithoutFrontmatter = content.slice(match[0].length);
    
    const frontmatterObj: Record<string, any> = {};
    frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        frontmatterObj[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    return { frontmatter: frontmatterObj, content: contentWithoutFrontmatter };
  }
  
  return { frontmatter: {}, content };
};