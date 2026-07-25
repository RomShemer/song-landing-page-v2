import ScrollArea from '../ui/ScrollArea';

export default function LyricsSection({ lyrics }) {
  if (!lyrics) return null;

  // Deeper than the other sections — roughly a verse and a half — so the text
  // reads as lyrics rather than as a cropped snippet, while still keeping the
  // sections below within thumb's reach.
  return (
    <ScrollArea maxHeight="26rem">
      <p className="pb-8 text-[15px] leading-loose whitespace-pre-line text-neutral-300">
        {lyrics}
      </p>
    </ScrollArea>
  );
}
