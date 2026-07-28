const ACCORDIONS = ['gallery', 'clip', 'pr', 'lyrics', 'credits', 'downloads', 'contact'];
const PROSE = ['pr', 'lyrics', 'credits'];
const EVERYTHING = ['hero', 'socials', 'player', ...ACCORDIONS];

// Which preview blocks each editable path affects, so an edit can be pointed at.
// Theme paths are listed one by one: a single 'theme' rule flashed the hero for a
// change to section headings or body copy.
const RULES = [
  [['song', 'title'], ['hero']],
  [['song', 'artist'], ['hero']],
  [['song', 'releaseYear'], ['footer']],

  [['theme', 'accent'], EVERYTHING],
  [['theme', 'title'], ['hero']],
  [['theme', 'subtitle'], ['hero']],
  [['theme', 'sections'], ACCORDIONS],
  [['theme', 'body'], PROSE],
  [['theme', 'playerStyle'], ['player']],
  // The backdrop sits behind everything, so every block is affected by it.
  [['theme', 'background'], EVERYTHING],
  [['theme', 'cover'], ['hero']],
  [['theme', 'layout'], EVERYTHING],

  [['media', 'coverImage'], ['hero']],
  [['media', 'showCover'], ['hero']],
  [['media', 'backgroundImage'], ['hero']],
  [['media', 'audioStreamUrl'], ['player']],
  [['media', 'videoUrl'], ['clip']],

  [['links'], ['socials']],
  [['content', 'prHtml'], ['pr']],
  [['content', 'prText'], ['pr']],
  [['content', 'lyrics'], ['lyrics']],
  [['credits'], ['credits']],

  [['downloads', 'pressImages'], ['gallery']],
  [['downloads', 'mp3Url'], ['player', 'downloads']],
  [['downloads'], ['downloads']],
  [['flags'], ['downloads']],
  [['contact'], ['contact']],
];

function valueAt(doc, path) {
  return path.reduce((node, key) => (node == null ? node : node[key]), doc);
}

/** @returns {string[]} preview section keys that differ between two documents */
export function changedSections(before, after) {
  if (!before || !after) return [];

  const hits = new Set();
  for (const [path, sections] of RULES) {
    if (JSON.stringify(valueAt(before, path)) !== JSON.stringify(valueAt(after, path))) {
      sections.forEach((section) => hits.add(section));
    }
  }
  return [...hits];
}
