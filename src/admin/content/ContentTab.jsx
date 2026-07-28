import {
  FaAward,
  FaDownload,
  FaFileAlt,
  FaImages,
  FaMusic,
  FaPalette,
  FaPhone,
  FaFont,
  FaShareAlt,
  FaVideo,
} from 'react-icons/fa';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';
import {
  ColorField,
  NumberField,
  RangeField,
  SelectField,
  TextArea,
  TextField,
  Toggle,
} from '../ui/Field';
import DeleteButton from '../ui/DeleteButton';
import InfoTip from '../ui/InfoTip';
import CreditsEditor from './CreditsEditor';
import DownloadsEditor from './DownloadsEditor';
import LinksEditor from './LinksEditor';
import TypographyEditor from './TypographyEditor';
import MediaField from './MediaField';
import { useToast } from '../ui/toastContext';
import PressEditor from './PressEditor';

export default function ContentTab({ draft, update, replace }) {
  const { song, theme, media, links, content, credits, downloads, contact, flags } = draft;
  const toast = useToast();
  const background = theme.background;
  const setBackground = (values) =>
    update('theme', 'background', { ...theme.background, ...values });
  const setTitleTheme = (values) => update('theme', 'title', { ...theme.title, ...values });
  const setSubtitleTheme = (values) =>
    update('theme', 'subtitle', { ...theme.subtitle, ...values });
  const cover = theme.cover;
  const setCover = (values) => update('theme', 'cover', { ...theme.cover, ...values });
  const layout = theme.layout;
  const setLayout = (values) => update('theme', 'layout', { ...theme.layout, ...values });

  const removeImage = (i) => {
    update('downloads', 'pressImages', downloads.pressImages.filter((_, idx) => idx !== i));
    toast.success(`תמונה ${i + 1} נמחקה — יש לפרסם כדי לעדכן את העמוד`);
  };

  const setLabel = (key, field, value) =>
    update('downloads', 'labels', {
      ...downloads.labels,
      [key]: { ...downloads.labels[key], [field]: value },
    });

  return (
    <Accordion variant="light" defaultOpenId="general" id="content-editor">
      <AccordionItem
        id="general"
        title="הגדרות כלליות"
        hint="חל על כל העמוד — שם, עיצוב, רקע ונגן"
        tip="שם השיר, צבע מוביל, גופנים, רקע ועיצוב הנגן — כל מה שחל על העמוד כולו."
        icon={FaPalette}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <TextField
              id="song-title"
              label="שם השיר"
              value={song.title}
              onChange={(v) => update('song', 'title', v)}
            />
            <div className="mt-2">
              <Toggle
                id="title-show"
                label="הצגת שם השיר בעמוד"
                hint={
                  theme.title.show
                    ? undefined
                    : 'מוסתר בעמוד — עדיין מופיע בכותרת החלון ובשיתוף'
                }
                value={theme.title.show}
                onChange={(v) => setTitleTheme({ show: v })}
              />
            </div>
          </div>
          <div>
            <TextField
              id="song-artist"
              label="שם האמן/ית"
              value={song.artist}
              onChange={(v) => update('song', 'artist', v)}
            />
            <div className="mt-2">
              <Toggle
                id="subtitle-show"
                label="הצגת שם האמן/ית בעמוד"
                hint={
                  theme.subtitle.show
                    ? undefined
                    : 'מוסתר בעמוד — עדיין מופיע בכותרת החלון ובשיתוף'
                }
                value={theme.subtitle.show}
                onChange={(v) => setSubtitleTheme({ show: v })}
              />
            </div>
          </div>
          <NumberField
            id="song-year"
            label="שנת יציאה"
            hint="מוצג בתחתית העמוד"
            value={song.releaseYear}
            onChange={(v) => update('song', 'releaseYear', v)}
          />
          <ColorField
            id="theme-accent"
            label="צבע מוביל"
            hint="צובע אייקונים, כפתורים והדגשות"
            value={theme.accent}
            onChange={(v) => update('theme', 'accent', v)}
          />
          <SelectField
            id="theme-player"
            label="עיצוב הנגן"
            value={theme.playerStyle}
            onChange={(v) => update('theme', 'playerStyle', v)}
            options={[
              { value: 'light', label: 'בהיר (לבן)' },
              { value: 'dark', label: 'כהה (זכוכית)' },
            ]}
          />
        </div>

        {/* Each image sits with the settings that shape it, rather than the
            uploads in one row and their design somewhere below. */}
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-adm-line bg-adm-bg/40 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-adm-ink">
              תמונת רקע
              <InfoTip text="התמונה שמאחורי כל העמוד. הבהירות והכיסוי קובעים כמה ממנה נראה — אם הרקע יוצא שחור, כדאי להעלות בהירות ולהנמיך כיסוי." />
            </p>

            <div className="mt-2.5">
              <MediaField
                label="קובץ התמונה"
                hint="מוצגת מאחורי כל העמוד"
                accept="image/*"
                value={media.backgroundImage}
                onChange={(v) => update('media', 'backgroundImage', v)}
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <RangeField
                id="bg-opacity"
                label="בהירות התמונה"
                hint="0% מסתיר אותה לגמרי"
                value={background.opacity}
                onChange={(v) => setBackground({ opacity: v })}
                min={0}
                max={1}
                step={0.05}
                format={(v) => `${Math.round(v * 100)}%`}
              />
              <RangeField
                id="bg-overlay"
                label="כיסוי כהה מעל התמונה"
                hint="מבטיח שהטקסט יישאר קריא"
                value={background.overlay}
                onChange={(v) => setBackground({ overlay: v })}
                min={0}
                max={1}
                step={0.05}
                format={(v) => `${Math.round(v * 100)}%`}
              />
              <RangeField
                id="bg-blur"
                label="טשטוש"
                hint="0 = תמונה חדה"
                value={background.blur}
                onChange={(v) => setBackground({ blur: v })}
                min={0}
                max={40}
                step={1}
                format={(v) => `${v}px`}
              />
              <SelectField
                id="bg-size"
                label="התאמת התמונה"
                value={background.size}
                onChange={(v) => setBackground({ size: v })}
                options={[
                  { value: 'cover', label: 'מכסה את המסך (חיתוך בקצוות)' },
                  { value: 'contain', label: 'התמונה כולה נראית' },
                  { value: 'stretch', label: 'מתיחה לכל המסך' },
                  { value: 'auto', label: 'גודל מקורי' },
                ]}
              />
              <SelectField
                id="bg-position"
                label="מיקום התמונה"
                value={background.position}
                onChange={(v) => setBackground({ position: v })}
                options={[
                  { value: 'center', label: 'מרכז' },
                  { value: 'top', label: 'למעלה' },
                  { value: 'bottom', label: 'למטה' },
                  { value: 'start', label: 'לימין' },
                  { value: 'end', label: 'לשמאל' },
                ]}
              />
            </div>
          </div>

          <div className="rounded-xl border border-adm-line bg-adm-bg/40 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-adm-ink">
              עטיפת הסינגל
              <InfoTip text="התמונה המרובעת מעל הכותרת. מוצגת רק אם המתג דולק ויש קובץ." />
            </p>

            <div className="mt-2.5">
              <MediaField
                label="קובץ העטיפה"
                hint="מרובעת, מוצגת מעל הכותרת"
                accept="image/*"
                value={media.coverImage}
                onChange={(v) => update('media', 'coverImage', v)}
              >
                <Toggle
                  id="media-show-cover"
                  label="הצגת העטיפה בעמוד"
                  hint={
                    media.showCover && !media.coverImage
                      ? 'דולק אך לא הועלתה עטיפה — לא יוצג דבר'
                      : undefined
                  }
                  value={media.showCover}
                  onChange={(v) => update('media', 'showCover', v)}
                />
              </MediaField>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <RangeField
                id="cover-width"
                label="גודל"
                value={cover.width}
                onChange={(v) => setCover({ width: v })}
                min={6}
                max={26}
                step={0.5}
                format={(v) => `${v}rem`}
              />
              <SelectField
                id="cover-position"
                label="מיקום"
                value={cover.position}
                onChange={(v) => setCover({ position: v })}
                options={[
                  { value: 'center', label: 'מרכז' },
                  { value: 'start', label: 'לימין' },
                  { value: 'end', label: 'לשמאל' },
                ]}
              />
              <RangeField
                id="cover-radius"
                label="עיגול הפינות"
                hint="גדול מאוד יוצר עיגול"
                value={cover.radius}
                onChange={(v) => setCover({ radius: v })}
                min={0}
                max={200}
                step={2}
                format={(v) => `${v}px`}
              />
              <RangeField
                id="cover-brightness"
                label="בהירות"
                value={cover.brightness}
                onChange={(v) => setCover({ brightness: v })}
                min={0.2}
                max={1.6}
                step={0.05}
                format={(v) => `${Math.round(v * 100)}%`}
              />
              <RangeField
                id="cover-blur"
                label="טשטוש"
                value={cover.blur}
                onChange={(v) => setCover({ blur: v })}
                min={0}
                max={20}
                step={1}
                format={(v) => `${v}px`}
              />
              <SelectField
                id="cover-shadow"
                label="צל"
                value={cover.shadow}
                onChange={(v) => setCover({ shadow: v })}
                options={[
                  { value: 'strong', label: 'עמוק' },
                  { value: 'soft', label: 'עדין' },
                  { value: 'none', label: 'בלי צל' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-adm-line bg-adm-bg/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-adm-ink">
            מבנה העמוד
            <InfoTip text="רוחב העמוד, המרווח בין הבלוקים והמרווח מעל הכותרת. משפיע על כל העמוד." />
          </p>

          <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
            <RangeField
              id="layout-width"
              label="רוחב מקסימלי"
              hint="במסך רחב"
              value={layout.maxWidth}
              onChange={(v) => setLayout({ maxWidth: v })}
              min={20}
              max={60}
              step={1}
              format={(v) => `${v}rem`}
            />
            <RangeField
              id="layout-gap"
              label="מרווח בין הבלוקים"
              value={layout.blockGap}
              onChange={(v) => setLayout({ blockGap: v })}
              min={0}
              max={4}
              step={0.125}
              format={(v) => `${v}rem`}
            />
            <RangeField
              id="layout-top"
              label="מרווח בראש העמוד"
              value={layout.topSpace}
              onChange={(v) => setLayout({ topSpace: v })}
              min={0}
              max={8}
              step={0.25}
              format={(v) => `${v}rem`}
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MediaField
            label="קובץ האזנה"
            hint="ריק — הנגן ישתמש בקובץ ה-MP3"
            accept="audio/*"
            preview="MP3"
            value={media.audioStreamUrl}
            onChange={(v) => update('media', 'audioStreamUrl', v)}
          />
        </div>
      </AccordionItem>

      <AccordionItem
        id="typography"
        title="גופנים וטיפוגרפיה"
        hint="גופן, עובי, גודל ומרווח לכותרת ולטקסט"
        tip="הכותרת נמדדת ביחידות רוחב-מכל, כך שהתצוגה המקדימה מציגה את הגודל האמיתי במכשיר ולא ביחס לחלון הדפדפן."
        icon={FaFont}
      >
        <TypographyEditor theme={theme} update={update} />
      </AccordionItem>

      <AccordionItem id="socials" title="קישורי סטרימינג ורשתות"
        tip="הקישורים שמאחורי אייקוני הפלטפורמות מתחת לשם השיר. שדה ריק מסתיר את האייקון." icon={FaShareAlt}>
        <LinksEditor links={links} onChange={(key, value) => update('links', key, value)} />
      </AccordionItem>

      <AccordionItem id="gallery" title="גלריית תמונות"
        tip="תמונות היח״צ בקרוסלה ובחלון ההורדה. מוצגות במלואן, בלי חיתוך." icon={FaImages}>
          <div className="space-y-3">
            {downloads.pressImages.map((img, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-2">
                <MediaField
                  label={`תמונה ${i + 1}`}
                  accept="image/*"
                  value={img.src}
                  onChange={(v) =>
                    update(
                      'downloads',
                      'pressImages',
                      downloads.pressImages.map((p, idx) =>
                        idx === i ? { ...p, src: v } : p
                      )
                    )
                  }
                />
                <DeleteButton
                  label={`מחיקת תמונה ${i + 1}`}
                  onClick={() => removeImage(i)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update('downloads', 'pressImages', [
                  ...downloads.pressImages,
                  { src: '', name: '' },
                ])
              }
              className="rounded-lg border border-dashed border-adm-muted/50 px-3 py-2 text-xs text-adm-ink2 transition hover:border-adm-blue hover:text-adm-blue"
            >
              הוספת תמונה
            </button>

            <div className="grid gap-3 border-t border-adm-line pt-3 sm:grid-cols-2">
              <TextField
                id="label-gallery-title"
                label="כותרת כרטיס הגלריה"
                hint="הכרטיס שפותח את חלון בחירת התמונות"
                value={downloads.labels.gallery?.title}
                onChange={(v) => setLabel('gallery', 'title', v)}
              />
              <TextField
                id="label-gallery-sub"
                label="שורת משנה"
                reserveHint
                value={downloads.labels.gallery?.subtitle}
                onChange={(v) => setLabel('gallery', 'subtitle', v)}
              />
            </div>
          </div>
      </AccordionItem>

      <AccordionItem id="clip" title="קליפ רשמי"
        tip="סרטון YouTube מוטמע. בפורמט embed. אם ריק — יוצג ״הקליפ יעלה בקרוב״." icon={FaVideo}>
          <TextField
            id="media-video"
            label="כתובת הטמעה של YouTube"
            hint="בפורמט https://www.youtube.com/embed/... — ריק יציג ״הקליפ יעלה בקרוב״"
            dir="ltr"
            value={media.videoUrl}
            onChange={(v) => update('media', 'videoUrl', v)}
          />
      </AccordionItem>

      <AccordionItem id="pr" title="קומוניקט"
        tip="הקומוניקט לעיתונאים. נכתב כטקסט חופשי וה-HTML נוצר ממנו אוטומטית." icon={FaFileAlt}>
        <PressEditor content={content} update={update} />
      </AccordionItem>

      <AccordionItem id="lyrics" title="מילים"
        tip="מילות השיר. מוצגות בגלילה פנימית כדי לא להאריך את העמוד." icon={FaMusic}>
          <TextArea
            id="content-lyrics"
            label="מילות השיר"
            hint="שורה ריקה מפרידה בין בתים"
            rows={16}
            value={content.lyrics}
            onChange={(v) => update('content', 'lyrics', v)}
          />
      </AccordionItem>

      <AccordionItem id="credits" title="קרדיטים"
        tip="רשימת היוצרים. סוג הקרדיט מימין והשם לידו. אפשר להוסיף, למחוק ולשנות סדר." icon={FaAward}>
          <CreditsEditor credits={credits} onChange={(v) => replace('credits', v)} />
      </AccordionItem>

      <AccordionItem id="downloads" title="תיקיית הורדות"
        tip="הקבצים שאנשי הרדיו והעיתונות מורידים. לכל קובץ כותרת, שורת משנה ומתג הצגה." icon={FaDownload}>
        <DownloadsEditor downloads={downloads} flags={flags} update={update} />
      </AccordionItem>

      <AccordionItem id="contact" title="יצירת קשר"
        tip="טלפון ואימייל בתחתית העמוד. שדה ריק מסתיר את הכפתור." icon={FaPhone}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="contact-phone"
              label="טלפון"
              dir="ltr"
              value={contact.phone}
              onChange={(v) => update('contact', 'phone', v)}
            />
            <TextField
              id="contact-email"
              label="אימייל"
              dir="ltr"
              value={contact.email}
              onChange={(v) => update('contact', 'email', v)}
            />
          </div>
      </AccordionItem>
    </Accordion>
  );
}
