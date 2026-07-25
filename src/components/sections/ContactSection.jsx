import { FaEnvelope, FaPhone } from 'react-icons/fa';
import { trackContactClick } from '../../utils/analytics';

export default function ContactSection({ contact }) {
  const items = [
    contact?.phone && {
      key: 'phone',
      icon: FaPhone,
      label: contact.phone,
      href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`,
    },
    contact?.email && {
      key: 'email',
      icon: FaEnvelope,
      label: contact.email,
      href: `mailto:${contact.email}`,
    },
  ].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      {items.map(({ key, icon: Icon, label, href }) => (
        <a
          key={key}
          href={href}
          onClick={() => trackContactClick(key)}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-neutral-100 transition hover:bg-white/[0.12] active:scale-[0.98]"
        >
          <Icon aria-hidden="true" className="text-accent-300" />
          <span dir="ltr">{label}</span>
        </a>
      ))}
    </div>
  );
}
