import { createContext, useContext, useId, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const AccordionContext = createContext(null);

export function Accordion({ onOpen, className = '', children }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    if (openId !== id) onOpen?.(id);
    setOpenId(openId === id ? null : id);
  };

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <div className={`flex flex-col gap-3 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, title, icon: Icon, children }) {
  const { openId, toggle } = useContext(AccordionContext);
  const panelId = `${useId()}-panel`;
  const isOpen = openId === id;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md transition-colors">
      <button
        type="button"
        onClick={() => toggle(id)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-4 py-4 text-right transition hover:bg-white/[0.04]"
      >
        {Icon && (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300">
            <Icon />
          </span>
        )}
        <span className="flex-1 text-base font-medium text-neutral-100">{title}</span>
        <FaChevronDown
          aria-hidden="true"
          className={`shrink-0 text-neutral-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div id={panelId} className="border-t border-white/10 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
