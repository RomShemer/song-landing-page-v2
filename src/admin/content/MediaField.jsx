import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { Label } from '../ui/Field';

// The folder decides the size and type limits the server will allow, so it is
// derived from the same `accept` the picker uses. Names must match FOLDERS in
// api/blob/upload-token.js.
function folderFor(accept = '') {
  if (accept.includes('audio')) return 'audio';
  if (accept.includes('pdf')) return 'documents';
  if (accept.includes('zip')) return 'archives';
  return 'images';
}

// Blob keys have to survive being pasted into a URL, and the files arrive with
// Hebrew names and spaces.
function safeName(name) {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return cleaned.length > 3 ? cleaned.slice(-80) : `file-${cleaned}`;
}

// Drag-and-drop shell for a single asset. The browser uploads straight to Vercel
// Blob; a pasted URL still works, and if the upload route is unavailable the
// field falls back to a local preview rather than losing the choice.
export default function MediaField({
  label,
  hint,
  accept,
  value,
  onChange,
  preview = 'image',
  children,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(null);
  const [progress, setProgress] = useState(null);
  const [failure, setFailure] = useState('');

  const take = async (file) => {
    if (!file) return;
    setPending(file.name);
    setFailure('');
    setProgress(0);

    try {
      const blob = await upload(`${folderFor(accept)}/${safeName(file.name)}`, file, {
        access: 'public',
        contentType: file.type || undefined,
        handleUploadUrl: '/api/blob/upload-token',
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      setPending(null);
      setProgress(null);
      onChange(blob.url);
    } catch (error) {
      // Deliberately does not write anything: a blob: URL lives only in this tab,
      // so publishing one would leave the page pointing at nothing. The stored
      // value stays as it was until a real upload replaces it.
      setProgress(null);
      setPending(null);
      setFailure(error?.message || 'ההעלאה נכשלה');
    }
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

        {children && <div className="mt-2">{children}</div>}
      </div>

      {progress !== null && (
        <div className="mt-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-adm-bg">
            <div
              className="h-full rounded-full bg-adm-blue transition-[width] duration-200"
              style={{ width: `${Math.max(3, progress)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-adm-muted">
            מעלה {pending} — {Math.round(progress)}%
          </p>
        </div>
      )}

      {failure && (
        <p className="mt-1.5 text-[11px] text-amber-600">
          ההעלאה נכשלה ({failure}) — הקובץ לא נשמר. אפשר להדביק כתובת קובץ למטה.
        </p>
      )}
    </div>
  );
}
