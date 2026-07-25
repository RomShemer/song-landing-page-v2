import ScrollArea from '../ui/ScrollArea';

export default function PressSection({ html }) {
  if (!html) return null;

  return (
    <ScrollArea maxHeight="30rem">
      <div
        className="pb-8 text-[15px] leading-relaxed text-neutral-300
          [&_strong]:font-bold [&_strong]:text-white
          [&_em]:text-accent-300 [&_em]:not-italic
          [&_a]:text-accent-300 [&_a]:underline
          [&_blockquote]:my-4 [&_blockquote]:border-e-2 [&_blockquote]:border-accent-500/60
          [&_blockquote]:bg-white/[0.04] [&_blockquote]:py-3 [&_blockquote]:pe-4 [&_blockquote]:ps-4
          [&_blockquote]:rounded-lg [&_blockquote]:text-neutral-200 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </ScrollArea>
  );
}
