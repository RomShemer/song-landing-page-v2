/**
 * Title block, with an optional artwork card above it — the client decides in
 * the dashboard whether to show one at all, since a press page for a single
 * often looks stronger with the background photo carrying the image.
 *
 * The ambient glow is derived from whichever image is available so the page
 * still tints to the artwork when no cover is shown.
 */
export default function Hero({ title, artist, coverImage, showCover, glowImage }) {
  const glow = glowImage || coverImage;

  return (
    <header className="relative flex flex-col items-center pt-10 pb-6 text-center">
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-72 scale-110 bg-cover bg-center opacity-40 blur-3xl"
          style={{ backgroundImage: `url(${glow})` }}
        />
      )}

      {showCover && coverImage && (
        <img
          src={coverImage}
          alt={`עטיפת הסינגל ${title}`}
          width="320"
          height="320"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="mb-6 aspect-square w-56 rounded-3xl border border-white/10 object-cover shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:w-64"
        />
      )}

      <h1 className="font-title text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-2 text-lg font-medium text-neutral-400">{artist}</p>
    </header>
  );
}
