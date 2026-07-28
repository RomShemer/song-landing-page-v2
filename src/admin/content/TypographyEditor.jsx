import { useState } from 'react';
import { FaAlignCenter, FaFont, FaHeading, FaParagraph, FaUser } from 'react-icons/fa';
import { FONTS, FONT_CATEGORIES, fontWeights } from '../../fonts';
import { ColorField, RangeField, SelectField } from '../ui/Field';
import InfoTip from '../ui/InfoTip';

const fontGroups = FONT_CATEGORIES.map((c) => ({
  label: c.label,
  options: FONTS.filter((f) => f.category === c.key).map((f) => ({
    value: f.key,
    label: f.label,
  })),
})).filter((g) => g.options.length);

const WEIGHT_NAMES = {
  100: 'דק מאוד',
  200: 'דק',
  300: 'קל',
  400: 'רגיל',
  500: 'בינוני',
  600: 'חצי מודגש',
  700: 'מודגש',
  800: 'כבד',
  900: 'שחור',
};

function weightOptions(fontKey) {
  return fontWeights(fontKey).map((w) => ({
    value: String(w),
    label: `${w} · ${WEIGHT_NAMES[w] || ''}`.trim(),
  }));
}

const TABS = [
  { key: 'title', label: 'כותרת השיר', icon: FaHeading, affects: 'שם השיר בראש העמוד' },
  { key: 'subtitle', label: 'שם האמן/ית', icon: FaUser, affects: 'השורה מתחת לכותרת' },
  {
    key: 'sections',
    label: 'כותרות מקטעים',
    icon: FaAlignCenter,
    affects: 'גלריה, קליפ, קומוניקט, מילים, קרדיטים, הורדות ויצירת קשר',
  },
  {
    key: 'body',
    label: 'טקסט רץ',
    icon: FaParagraph,
    affects: 'תוכן הקומוניקט, מילות השיר והקרדיטים',
  },
];

function FontRow({ id, group, value, onChange }) {
  return (
    <SelectField
      id={`${id}-font`}
      label="גופן"
      hint={`הגופן של ${group}`}
      value={value}
      onChange={onChange}
      groups={fontGroups}
    />
  );
}

export default function TypographyEditor({ theme, update }) {
  const [tab, setTab] = useState('title');
  const active = TABS.find((t) => t.key === tab);
  const patch = (key) => (values) => update('theme', key, { ...theme[key], ...values });

  const setTitle = patch('title');
  const setSubtitle = patch('subtitle');
  const setSections = patch('sections');
  const setBody = patch('body');

  return (
    <div>
      <div
        role="tablist"
        aria-label="רכיבי טיפוגרפיה"
        className="flex flex-wrap gap-1.5 rounded-xl bg-adm-bg/70 p-1"
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition ${
              tab === key
                ? 'bg-white text-adm-blue shadow-sm'
                : 'text-adm-ink2 hover:text-adm-ink'
            }`}
          >
            <Icon className="text-[10px]" />
            {label}
          </button>
        ))}
      </div>

      <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-adm-muted">
        <FaFont className="mt-0.5 shrink-0" aria-hidden="true" />
        משפיע על: {active.affects}
      </p>

      <div className="mt-3 space-y-3">
        {tab === 'title' && (
          <>
            <FontRow
              id="title"
              group="כותרת השיר"
              value={theme.title.font}
              onChange={(v) => setTitle({ font: v })}
            />
            <ColorField
              id="title-color"
              label="צבע"
              hint="צבע כותרת השיר"
              value={theme.title.color}
              onChange={(v) => setTitle({ color: v })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <RangeField
                id="title-gap-above"
                label="מרווח מעל הכותרת"
                value={theme.title.gapAbove}
                onChange={(v) => setTitle({ gapAbove: v })}
                min={0}
                max={6}
                step={0.125}
                format={(v) => `${v}rem`}
              />
              <RangeField
                id="title-gap-below"
                label="מרווח עד שם האמן/ית"
                value={theme.title.gapBelow}
                onChange={(v) => setTitle({ gapBelow: v })}
                min={0}
                max={6}
                step={0.125}
                format={(v) => `${v}rem`}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="title-weight"
                label="עובי"
                value={String(theme.title.weight)}
                onChange={(v) => setTitle({ weight: Number(v) })}
                options={weightOptions(theme.title.font)}
              />
              <SelectField
                id="title-align"
                label="יישור"
                value={theme.title.align}
                onChange={(v) => setTitle({ align: v })}
                options={[
                  { value: 'center', label: 'מרכז' },
                  { value: 'start', label: 'לימין' },
                ]}
              />
            </div>
            <RangeField
              id="title-spacing"
              label="מרווח בין אותיות"
              value={theme.title.letterSpacing}
              onChange={(v) => setTitle({ letterSpacing: v })}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${v}em`}
            />
            <RangeField
              id="title-fluid"
              label="גודל ביחס לרוחב העמוד"
              hint="הכותרת גדלה עם רוחב המסך, בין המינימום למקסימום"
              value={theme.title.sizeFluid}
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
                value={theme.title.sizeMin}
                onChange={(v) => setTitle({ sizeMin: v })}
                min={1.5}
                max={8}
                step={0.25}
                format={(v) => `${v}rem`}
              />
              <RangeField
                id="title-max"
                label="גודל מקסימלי"
                value={theme.title.sizeMax}
                onChange={(v) => setTitle({ sizeMax: Math.max(v, theme.title.sizeMin) })}
                min={2}
                max={16}
                step={0.25}
                format={(v) => `${v}rem`}
              />
            </div>
          </>
        )}

        {tab === 'subtitle' && (
          <>
            <FontRow
              id="subtitle"
              group="שם האמן/ית"
              value={theme.subtitle.font}
              onChange={(v) => setSubtitle({ font: v })}
            />
            <ColorField
              id="subtitle-color"
              label="צבע"
              hint="צבע שם האמן/ית"
              value={theme.subtitle.color}
              onChange={(v) => setSubtitle({ color: v })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="subtitle-weight"
                label="עובי"
                value={String(theme.subtitle.weight)}
                onChange={(v) => setSubtitle({ weight: Number(v) })}
                options={weightOptions(theme.subtitle.font)}
              />
              <RangeField
                id="subtitle-size"
                label="גודל"
                value={theme.subtitle.size}
                onChange={(v) => setSubtitle({ size: v })}
                min={0.75}
                max={3}
                step={0.0625}
                format={(v) => `${v}rem`}
              />
            </div>
            <RangeField
              id="subtitle-spacing"
              label="מרווח בין אותיות"
              value={theme.subtitle.letterSpacing}
              onChange={(v) => setSubtitle({ letterSpacing: v })}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${v}em`}
            />
          </>
        )}

        {tab === 'sections' && (
          <>
            <FontRow
              id="sections"
              group="כותרות המקטעים"
              value={theme.sections.font}
              onChange={(v) => setSections({ font: v })}
            />
            <ColorField
              id="sections-color"
              label="צבע"
              hint="צבע כותרות המקטעים"
              value={theme.sections.color}
              onChange={(v) => setSections({ color: v })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <SelectField
                id="sections-weight"
                label="עובי"
                value={String(theme.sections.weight)}
                onChange={(v) => setSections({ weight: Number(v) })}
                options={weightOptions(theme.sections.font)}
              />
              <RangeField
                id="sections-size"
                label="גודל"
                value={theme.sections.size}
                onChange={(v) => setSections({ size: v })}
                min={0.8}
                max={1.6}
                step={0.0625}
                format={(v) => `${v}rem`}
              />
            </div>

            <div className="rounded-xl border border-adm-line bg-adm-bg/40 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-adm-ink">
                עיצוב המקטעים המתקפלים
                <InfoTip text="הכרטיסים של הגלריה, הקומוניקט, המילים והשאר. השקיפות היא של הצבע מעל הרקע — 0% שקוף לגמרי." />
              </p>

              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                <ColorField
                  id="panel-color"
                  label="צבע הכרטיס"
                  value={theme.sections.panelColor}
                  onChange={(v) => setSections({ panelColor: v })}
                />
                <RangeField
                  id="panel-opacity"
                  label="שקיפות הכרטיס"
                  value={theme.sections.panelOpacity}
                  onChange={(v) => setSections({ panelOpacity: v })}
                  min={0}
                  max={1}
                  step={0.02}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <ColorField
                  id="panel-border-color"
                  label="צבע המסגרת"
                  value={theme.sections.borderColor}
                  onChange={(v) => setSections({ borderColor: v })}
                />
                <RangeField
                  id="panel-border-opacity"
                  label="שקיפות המסגרת"
                  value={theme.sections.borderOpacity}
                  onChange={(v) => setSections({ borderOpacity: v })}
                  min={0}
                  max={1}
                  step={0.02}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <RangeField
                  id="panel-radius"
                  label="עיגול הפינות"
                  value={theme.sections.radius}
                  onChange={(v) => setSections({ radius: v })}
                  min={0}
                  max={40}
                  step={1}
                  format={(v) => `${v}px`}
                />
                <RangeField
                  id="panel-gap"
                  label="מרווח בין הכרטיסים"
                  value={theme.sections.gap}
                  onChange={(v) => setSections({ gap: v })}
                  min={0}
                  max={2.5}
                  step={0.125}
                  format={(v) => `${v}rem`}
                />
                <RangeField
                  id="panel-padding"
                  label="ריפוד פנימי"
                  value={theme.sections.padding}
                  onChange={(v) => setSections({ padding: v })}
                  min={0.25}
                  max={2.5}
                  step={0.125}
                  format={(v) => `${v}rem`}
                />
                <SelectField
                  id="panel-icon-tint"
                  label="צבע האייקונים"
                  value={theme.sections.iconTint}
                  onChange={(v) => setSections({ iconTint: v })}
                  options={[
                    { value: 'accent', label: 'בצבע המוביל' },
                    { value: 'neutral', label: 'אפור עדין' },
                  ]}
                />
              </div>
            </div>
          </>
        )}

        {tab === 'body' && (
          <>
            <FontRow
              id="body"
              group="הטקסט הרץ"
              value={theme.body.font}
              onChange={(v) => setBody({ font: v })}
            />
            <ColorField
              id="body-color"
              label="צבע"
              hint="צבע הקומוניקט, המילים והקרדיטים"
              value={theme.body.color}
              onChange={(v) => setBody({ color: v })}
            />
            <RangeField
              id="body-size"
              label="גודל בסיס"
              hint="שאר הגדלים בעמוד נגזרים ממנו"
              value={theme.body.size}
              onChange={(v) => setBody({ size: v })}
              min={0.75}
              max={1.5}
              step={0.0625}
              format={(v) => `${v}rem`}
            />
          </>
        )}
      </div>
    </div>
  );
}
