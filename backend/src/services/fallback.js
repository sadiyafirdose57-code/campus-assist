// Used when no AI key is configured, or the provider fails: still useful, just less polished.
export function extractiveAnswer(chunks) {
  if (!chunks.length) {
    return "I couldn't find this in the college documents yet. Please check with the relevant college office, or ask an admin to upload the related document.";
  }
  const top = chunks.slice(0, 2).map((c) => `From "${c.title}":\n${c.text}`).join('\n\n');
  return `Here is what the college documents say:\n\n${top}`;
}
