import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import IconButton from '../ui/IconButton';
import Modal from '../ui/Modal';

/**
 * Press-photo carousel. Arrows are laid out for RTL: the button on the right
 * steps backwards, matching reading direction (as the original page did).
 */
export default function GallerySection({ images = [] }) {
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState(false);

  if (!images.length) return null;

  const step = (delta) =>
    setIndex((prev) => (prev + delta + images.length) % images.length);

  const current = images[index];

  return (
    <>
      <div className="flex items-center gap-2">
        <IconButton onClick={() => step(-1)} aria-label="התמונה הקודמת">
          <FaChevronRight />
        </IconButton>

        <div className="group relative min-w-0 flex-1">
          <img
            src={current.src}
            alt={current.name || `תמונת יח״צ ${index + 1}`}
            loading="lazy"
            decoding="async"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="aspect-[4/5] w-full rounded-xl border border-white/10 object-cover sm:aspect-[3/2]"
          />

          <button
            type="button"
            onClick={() => setPreview(true)}
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 rounded-b-xl bg-black/50 py-2 text-xs text-neutral-200 backdrop-blur-sm transition hover:bg-black/70"
          >
            <FaExpand aria-hidden="true" />
            לחיצה לצפייה במסך מלא
          </button>
        </div>

        <IconButton onClick={() => step(1)} aria-label="התמונה הבאה">
          <FaChevronLeft />
        </IconButton>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`תמונה ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-accent-400' : 'w-1.5 bg-white/25 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} label="תצוגת תמונה">
        <img
          src={current.src}
          alt={current.name || `תמונת יח״צ ${index + 1}`}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="mx-auto max-h-[85vh] w-auto rounded-xl object-contain"
        />
      </Modal>
    </>
  );
}
