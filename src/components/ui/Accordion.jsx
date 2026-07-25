import { createContext, useContext, useId, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const AccordionContext = createContext(null);

const VARIANTS = {
  dark: {
    shell: 'border-white/10 bg-white/[0.06] backdrop-blur-md',
    header: 'text-right hover:bg-white/[0.04]',
    icon: 'bg-accent-500/20 text-accent-300',
    title: 'text-neutral-100',
    chevron: 'text-neutral-400',
    panel: 'border-t border-white/10',
  },
  light: {
    shell: 'border-adm-line bg-adm-card shadow-[0_2px_12px_-6px_rgba(15,43,92,0.18)]',
    header: 'text-right hover:bg-adm-blue-soft/60',
    icon: 'bg-adm-blue-soft text-adm-blue',
    title: 'text-adm-ink',
    chevron: 'text-adm-muted',
    panel: 'border-t border-adm-line',
  },
};

export function Accordion({
  onOpen,
  defaultOpenId = null,
  variant = 'dark',
  className = '',
  children,
}) {
  const [openId, setOpenId] = useState(defaultOpenId);

  const toggle = (id) => {
    if (openId !== id) onOpen?.(id);
    setOpenId(openId === id ? null : id);
  };

  return (
    <AccordionContext.Provider value={{ openId, toggle, variant }}>
      <div className={`flex flex-col gap-3 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, title, hint, icon: Icon, children }) {
  const { openId, toggle, variant } = useContext(AccordionContext);
  const panelId = `${useId()}-panel`;
  const isOpen = openId === id;
  const v = VARIANTS[variant] || VARIANTS.dark;

  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors ${v.shell}`}>
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`flex w-full items-center gap-3 px-4 py-4 transition ${v.header}`}
      >
        {Icon && (
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${v.icon}`}
          >
            <Icon />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className={`block text-base font-medium ${v.title}`}>{title}</span>
          {hint && <span className="block text-[11px] text-adm-muted">{hint}</span>}
        </span>
        <FaChevronDown
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-300 ${v.chevron} ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div id={panelId} className={`px-4 py-4 ${v.panel}`}>
          {children}
        </div>
      )}
    </div>
  );
}
