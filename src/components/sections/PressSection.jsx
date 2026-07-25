/**
 * The press release is authored as HTML in the CMS, so it is injected. Styling
 * is done with descendant variants rather than pulling in the typography plugin
 * for a single field.
 */
export default function PressSection({ html }) {
  if (!html) return null;

  return (
    <div
      className="text-[15px] leading-relaxed text-neutral-300
        [&_strong]:font-bold [&_strong]:text-white
        [&_em]:text-accent-300 [&_em]:not-italic
        [&_a]:text-accent-300 [&_a]:underline
        [&_blockquote]:my-4 [&_blockquote]:border-e-2 [&_blockquote]:border-accent-500/60
        [&_blockquote]:bg-white/[0.04] [&_blockquote]:py-3 [&_blockquote]:pe-4 [&_blockquote]:ps-4
        [&_blockquote]:rounded-lg [&_blockquote]:text-neutral-200 [&_blockquote]:italic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
