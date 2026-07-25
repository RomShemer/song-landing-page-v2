// Which preview block each editable path affects, so an edit can be pointed at.
const RULES = [
  [['song', 'title'], 'hero'],
  [['song', 'artist'], 'hero'],
  [['song', 'releaseYear'], 'footer'],
  [['media', 'coverImage'], 'hero'],
  [['media', 'showCover'], 'hero'],
  [['media', 'backgroundImage'], 'hero'],
  [['media', 'audioStreamUrl'], 'player'],
  [['media', 'videoUrl'], 'clip'],
  [['links'], 'socials'],
  [['content', 'prHtml'], 'pr'],
  [['content', 'prText'], 'pr'],
  [['content', 'lyrics'], 'lyrics'],
  [['credits'], 'credits'],
  [['downloads', 'pressImages'], 'gallery'],
  [['downloads', 'mp3Url'], 'player'],
  [['downloads'], 'downloads'],
  [['flags'], 'downloads'],
  [['contact'], 'contact'],
  [['theme'], 'hero'],
];

function valueAt(doc, path) {
  return path.reduce((node, key) => (node == null ? node : node[key]), doc);
}

/** @returns {string[]} preview section keys that differ between two documents */
export function changedSections(before, after) {
  if (!before || !after) return [];

  const hits = new Set();
  for (const [path, section] of RULES) {
    if (JSON.stringify(valueAt(before, path)) !== JSON.stringify(valueAt(after, path))) {
      hits.add(section);
    }
  }
  return [...hits];
}
