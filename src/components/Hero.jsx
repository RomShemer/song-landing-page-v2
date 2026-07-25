/**
 * Cover art + title, with an ambient glow derived from the artwork itself:
 * the same image, blurred and scaled behind the card, so the page tints to
 * match whatever cover the client uploads.
 */
export default function Hero({ title, artist, coverImage }) {
  return (
    <header className="relative flex flex-col items-center pt-10 pb-6 text-center">
      {coverImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-72 scale-110 bg-cover bg-center opacity-40 blur-3xl"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      )}

      {coverImage && (
        <img
          src={coverImage}
          alt={`עטיפת הסינגל ${title}`}
          width="320"
          height="320"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="mb-6 aspect-square w-56 rounded-2xl border border-white/10 object-cover shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:w-64"
        />
      )}

      <h1 className="text-4xl leading-tight font-black tracking-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-2 text-lg font-medium text-neutral-400">{artist}</p>
    </header>
  );
}
