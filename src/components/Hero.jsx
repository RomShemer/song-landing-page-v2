export default function Hero({ title, artist, coverImage, showCover, glowImage }) {
  const glow = glowImage || coverImage;

  return (
    <header className="relative flex flex-col items-stretch pt-10 pb-6">
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

      <h1 className="page-title font-title text-white">{title}</h1>
      <p className="page-subtitle text-neutral-400">{artist}</p>
    </header>
  );
}
