import ScrollArea from '../ui/ScrollArea';

export default function LyricsSection({ lyrics }) {
  if (!lyrics) return null;

  return (
    <ScrollArea maxHeight="26rem">
      <p className="pb-8 text-[15px] leading-loose whitespace-pre-line text-neutral-300">
        {lyrics}
      </p>
    </ScrollArea>
  );
}
