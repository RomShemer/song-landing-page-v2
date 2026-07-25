import { useRef, useState } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { Label } from '../ui/Field';

// Drag-and-drop shell for a single asset. Uploading needs Vercel Blob, which is
// not wired yet, so a dropped file previews via a blob: URL and the field
// accepts a pasted URL meanwhile.
export default function MediaField({
  label,
  hint,
  accept,
  value,
  onChange,
  preview = 'image',
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(null);

  const take = (file) => {
    if (!file) return;
    setPending(file.name);
    onChange(URL.createObjectURL(file));
  };

  return (
    <div>
      <Label hint={hint}>{label}</Label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          take(e.dataTransfer.files?.[0]);
        }}
        className={`mt-1.5 rounded-xl border border-dashed p-3 transition ${
          dragging ? 'border-adm-blue bg-adm-blue-soft' : 'border-adm-muted/40 bg-adm-bg/50'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-3">
            {preview === 'image' ? (
              <img
                src={value}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border border-adm-line object-cover"
              />
            ) : (
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-adm-line bg-adm-blue-soft text-xs font-semibold text-adm-blue">
                {preview}
              </span>
            )}
            <code
              dir="ltr"
              className="min-w-0 flex-1 truncate font-mono text-[11px] text-adm-ink2"
            >
              {pending || value}
            </code>
            <button
              type="button"
              onClick={() => {
                setPending(null);
                onChange('');
              }}
              aria-label="הסרה"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-adm-line bg-white text-xs text-adm-ink2 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-1.5 py-3 text-adm-ink2 transition hover:text-adm-blue"
          >
            <FaUpload />
            <span className="text-xs">גרירת קובץ לכאן או לחיצה לבחירה</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => take(e.target.files?.[0])}
          className="hidden"
        />

        <input
          type="text"
          dir="ltr"
          value={value ?? ''}
          onChange={(e) => {
            setPending(null);
            onChange(e.target.value);
          }}
          placeholder="או הדבקת כתובת קובץ"
          className="mt-2 w-full rounded-lg border border-adm-line bg-white px-2.5 py-1.5 font-mono text-[11px] text-adm-ink2 placeholder:text-adm-muted focus:border-adm-blue focus:outline-none"
        />
      </div>

      {pending && (
        <p className="mt-1.5 text-[11px] text-amber-600">
          הקובץ נבחר אך עדיין לא הועלה לשרת — ההעלאה תתחבר בשלב הבא.
        </p>
      )}
    </div>
  );
}
