const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };

// Plain text is the authoring surface; prHtml is what the page renders. A blank
// line becomes a paragraph break, a single newline a line break, and *word*
// becomes bold so emphasis survives without writing tags.
export function textToPressHtml(text) {
  if (!text?.trim()) return '';

  return text
    .trim()
    .replace(/[&<>]/g, (c) => ESCAPES[c])
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .join('<br>')
        .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    )
    .join('<br><br>\n\n');
}

// Best-effort inverse, used once to seed the text field from existing HTML.
export function pressHtmlToText(html) {
  if (!html) return '';

  return html
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (_, inner) => `\n${inner.trim()}\n`)
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '*$1*')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
