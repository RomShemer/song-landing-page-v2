import ScrollArea from '../ui/ScrollArea';

export default function LyricsSection({ lyrics }) {
  if (!lyrics) return null;

  return (
    <ScrollArea maxHeight="26rem">
      <p className="pb-8 leading-loose whitespace-pre-line">
        {lyrics}
      </p>
    </ScrollArea>
  );
}
