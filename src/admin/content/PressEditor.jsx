import { useState } from 'react';
import { FaCode, FaSyncAlt } from 'react-icons/fa';
import { pressHtmlToText, textToPressHtml } from '../../content/pressTemplate';
import { TextArea } from '../ui/Field';

export default function PressEditor({ content, update }) {
  const [showHtml, setShowHtml] = useState(false);
  const [manualHtml, setManualHtml] = useState(false);

  const text = content.prText || pressHtmlToText(content.prHtml);

  const setText = (value) => {
    update('content', { prText: value, prHtml: textToPressHtml(value) });
    setManualHtml(false);
  };

  const regenerate = () => {
    update('content', 'prHtml', textToPressHtml(text));
    setManualHtml(false);
  };

  return (
    <div className="space-y-3">
      <TextArea
        id="content-pr-text"
        label="טקסט הקומוניקט"
        hint="שורה ריקה מפרידה בין פסקאות. הקפת מילה בכוכביות — *כך* — תדגיש אותה."
        rows={14}
        value={text}
        onChange={setText}
      />

      <div className="rounded-xl border border-adm-line bg-adm-bg/50">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => setShowHtml((v) => !v)}
            aria-expanded={showHtml}
            className="inline-flex items-center gap-2 text-[11px] font-semibold text-adm-ink2 transition hover:text-adm-blue"
          >
            <FaCode />
            {showHtml ? 'הסתרת קוד ה-HTML' : 'עריכת ה-HTML שנוצר'}
          </button>

          {showHtml && manualHtml && (
            <button
              type="button"
              onClick={regenerate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-adm-line bg-white px-2 py-1 text-[11px] text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue"
            >
              <FaSyncAlt />
              יצירה מחדש מהטקסט
            </button>
          )}
        </div>

        {showHtml && (
          <div className="border-t border-adm-line p-3">
            <TextArea
              id="content-pr-html"
              label="HTML"
              hint="נוצר אוטומטית מהטקסט. עריכה כאן נשמרת עד לשינוי הבא בטקסט למעלה."
              rows={12}
              mono
              value={content.prHtml}
              onChange={(v) => {
                update('content', 'prHtml', v);
                setManualHtml(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
