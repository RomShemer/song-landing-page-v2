export default function GlassCard({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
