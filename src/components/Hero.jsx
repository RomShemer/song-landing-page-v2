export default function Hero({
  title,
  artist,
  coverImage,
  showCover,
  glowImage,
  showTitle = true,
  showArtist = true,
}) {
  const glow = glowImage || coverImage;

  return (
    <header className="page-hero relative flex flex-col items-stretch pb-6">
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
          className="page-cover mb-6 aspect-square border border-white/10 object-cover"
        />
      )}

      {showTitle && <h1 className="page-title font-title">{title}</h1>}
      {showArtist && <p className="page-subtitle">{artist}</p>}
    </header>
  );
}
