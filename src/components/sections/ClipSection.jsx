export default function ClipSection({ videoUrl }) {
  if (!videoUrl) {
    return (
      <p className="py-6 text-center text-sm text-neutral-400">הקליפ יעלה בקרוב 🎬</p>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
      <iframe
        src={videoUrl}
        title="קליפ רשמי"
        loading="lazy"
        allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
