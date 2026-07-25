export default function LyricsSection({ lyrics }) {
  if (!lyrics) return null;

  return (
    <p className="text-[15px] leading-loose whitespace-pre-line text-neutral-300">
      {lyrics}
    </p>
  );
}
