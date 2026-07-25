import { FONTS, FONT_CATEGORIES, fontWeights } from '../../fonts';
import { RangeField, SelectField } from '../ui/Field';

const fontGroups = FONT_CATEGORIES.map((c) => ({
  label: c.label,
  options: FONTS.filter((f) => f.category === c.key).map((f) => ({
    value: f.key,
    label: f.label,
  })),
})).filter((g) => g.options.length);

function weightOptions(fontKey) {
  const names = { 100: 'דק מאוד', 200: 'דק', 300: 'קל', 400: 'רגיל', 500: 'בינוני', 600: 'חצי מודגש', 700: 'מודגש', 800: 'כבד', 900: 'שחור' };
  return fontWeights(fontKey).map((w) => ({ value: String(w), label: `${w} · ${names[w] || ''}`.trim() }));
}

export default function TypographyEditor({ theme, update }) {
  const { title, subtitle, body } = theme;

  const setTitle = (patch) => update('theme', 'title', { ...title, ...patch });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          id="theme-title-font"
          label="גופן הכותרת"
          value={theme.titleFont}
          onChange={(v) => update('theme', 'titleFont', v)}
          groups={fontGroups}
        />
        <SelectField
          id="theme-body-font"
          label="גופן הטקסט"
          value={theme.bodyFont}
          onChange={(v) => update('theme', 'bodyFont', v)}
          groups={fontGroups}
        />
      </div>

      <fieldset className="rounded-xl border border-adm-line bg-adm-bg/40 p-3">
        <legend className="px-1 text-[11px] font-bold text-adm-ink">
          כותרת השיר
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            id="title-weight"
            label="עובי"
            value={String(title.weight)}
            onChange={(v) => setTitle({ weight: Number(v) })}
            options={weightOptions(theme.titleFont)}
          />
          <SelectField
            id="title-align"
            label="יישור"
            value={title.align}
            onChange={(v) => setTitle({ align: v })}
            options={[
              { value: 'center', label: 'מרכז' },
              { value: 'start', label: 'לימין' },
            ]}
          />
        </div>

        <div className="mt-3 space-y-3">
          <RangeField
            id="title-spacing"
            label="מרווח בין אותיות"
            value={title.letterSpacing}
            onChange={(v) => setTitle({ letterSpacing: v })}
            min={0}
            max={1}
            step={0.05}
            format={(v) => `${v}em`}
          />
          <RangeField
            id="title-fluid"
            label="גודל ביחס לרוחב העמוד"
            hint="הכותרת גדלה עם רוחב המסך בין המינימום למקסימום"
            value={title.sizeFluid}
            onChange={(v) => setTitle({ sizeFluid: v })}
            min={2}
            max={20}
            step={0.5}
            format={(v) => `${v}cqw`}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <RangeField
              id="title-min"
              label="גודל מינימלי"
              value={title.sizeMin}
              onChange={(v) => setTitle({ sizeMin: v })}
              min={1.5}
              max={8}
              step={0.25}
              format={(v) => `${v}rem`}
            />
            <RangeField
              id="title-max"
              label="גודל מקסימלי"
              value={title.sizeMax}
              onChange={(v) => setTitle({ sizeMax: Math.max(v, title.sizeMin) })}
              min={2}
              max={16}
              step={0.25}
              format={(v) => `${v}rem`}
            />
          </div>
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="rounded-xl border border-adm-line bg-adm-bg/40 p-3">
          <legend className="px-1 text-[11px] font-bold text-adm-ink">
            שם האמן/ית
          </legend>
          <div className="space-y-3">
            <SelectField
              id="subtitle-weight"
              label="עובי"
              value={String(subtitle.weight)}
              onChange={(v) => update('theme', 'subtitle', { ...subtitle, weight: Number(v) })}
              options={weightOptions(theme.titleFont)}
            />
            <RangeField
              id="subtitle-size"
              label="גודל"
              value={subtitle.size}
              onChange={(v) => update('theme', 'subtitle', { ...subtitle, size: v })}
              min={0.75}
              max={3}
              step={0.0625}
              format={(v) => `${v}rem`}
            />
            <RangeField
              id="subtitle-spacing"
              label="מרווח בין אותיות"
              value={subtitle.letterSpacing}
              onChange={(v) =>
                update('theme', 'subtitle', { ...subtitle, letterSpacing: v })
              }
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${v}em`}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-adm-line bg-adm-bg/40 p-3">
          <legend className="px-1 text-[11px] font-bold text-adm-ink">
            טקסט העמוד
          </legend>
          <RangeField
            id="body-size"
            label="גודל בסיס"
            hint="משפיע על הקומוניקט, המילים והקרדיטים"
            value={body.size}
            onChange={(v) => update('theme', 'body', { ...body, size: v })}
            min={0.75}
            max={1.5}
            step={0.0625}
            format={(v) => `${v}rem`}
          />
        </fieldset>
      </div>
    </div>
  );
}
