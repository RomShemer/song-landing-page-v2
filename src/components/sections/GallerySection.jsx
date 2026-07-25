import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import IconButton from '../ui/IconButton';
import Modal from '../ui/Modal';

/**
 * Press-photo carousel.
 *
 * The frame takes its height from the photo rather than imposing one, capped at
 * 70vh. `object-cover` in a fixed frame was cropping these shots; switching to a
 * fixed tall frame stopped the cropping but letterboxed the square ones with
 * ~230px of black. Sizing to the image avoids both, at the cost of the carousel
 * changing height between portrait and square press shots — the right trade for
 * a press kit, where seeing the whole frame is the point.
 *
 * Arrows overlay the image instead of sitting beside it, which on a phone gives
 * the photo the full width of the card rather than losing ~90px to controls.
 */
export default function GallerySection({ images = [] }) {
  const [index, setIndex] = useState(0);
  const [preview, setPreview] = useState(false);

  if (!images.length) return null;

  const step = (delta) =>
    setIndex((prev) => (prev + delta + images.length) % images.length);

  const current = images[index];
  const many = images.length > 1;

  return (
    <>
      <div className="group relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <img
          src={current.src}
          alt={current.name || `תמונת יח״צ ${index + 1}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="max-h-[70vh] w-auto max-w-full object-contain"
        />

        {many && (
          <>
            {/* Right steps backwards, matching the reading direction. */}
            <IconButton
              onClick={() => step(-1)}
              aria-label="התמונה הקודמת"
              className="absolute end-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
            >
              <FaChevronRight />
            </IconButton>
            <IconButton
              onClick={() => step(1)}
              aria-label="התמונה הבאה"
              className="absolute start-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
            >
              <FaChevronLeft />
            </IconButton>
          </>
        )}

        <button
          type="button"
          onClick={() => setPreview(true)}
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/55 py-2 text-xs text-neutral-200 backdrop-blur-sm transition hover:bg-black/75"
        >
          <FaExpand aria-hidden="true" />
          לחיצה לצפייה במסך מלא
        </button>
      </div>

      {many && (
        <div className="mt-3 flex justify-center gap-1.5">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`תמונה ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-accent-500' : 'w-1.5 bg-white/25 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      <Modal open={preview} onClose={() => setPreview(false)} label="תצוגת תמונה">
        <img
          src={current.src}
          alt={current.name || `תמונת יח״צ ${index + 1}`}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="mx-auto max-h-[85vh] w-auto rounded-3xl object-contain"
        />
      </Modal>
    </>
  );
}
