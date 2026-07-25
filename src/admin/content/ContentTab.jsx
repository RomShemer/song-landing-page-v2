import {
  FaAward,
  FaDownload,
  FaFileAlt,
  FaImages,
  FaMusic,
  FaPalette,
  FaPhone,
  FaShareAlt,
  FaVideo,
} from 'react-icons/fa';
import { Accordion, AccordionItem } from '../../components/ui/Accordion';
import { FONTS } from '../../fonts';
import {
  ColorField,
  NumberField,
  SelectField,
  TextArea,
  TextField,
  Toggle,
} from '../ui/Field';
import DeleteButton from '../ui/DeleteButton';
import CreditsEditor from './CreditsEditor';
import DownloadsEditor from './DownloadsEditor';
import LinksEditor from './LinksEditor';
import MediaField from './MediaField';
import PressEditor from './PressEditor';

const fontOptions = FONTS.map((f) => ({ value: f.key, label: f.label }));

export default function ContentTab({ draft, update, replace }) {
  const { song, theme, media, links, content, credits, downloads, contact, flags } = draft;

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
          <TextField
            id="song-title"
            label="שם השיר"
            value={song.title}
            onChange={(v) => update('song', 'title', v)}
          />
          <TextField
            id="song-artist"
            label="שם האמן/ית"
            value={song.artist}
            onChange={(v) => update('song', 'artist', v)}
          />
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
            id="theme-title-font"
            label="גופן הכותרת"
            value={theme.titleFont}
            onChange={(v) => update('theme', 'titleFont', v)}
            options={fontOptions}
          />
          <SelectField
            id="theme-body-font"
            label="גופן הטקסט"
            value={theme.bodyFont}
            onChange={(v) => update('theme', 'bodyFont', v)}
            options={fontOptions}
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
          <Toggle
            id="media-show-cover"
            label="הצגת עטיפת סינגל"
            hint={
              media.showCover && !media.coverImage
                ? 'דולק אך לא הועלתה עטיפה — לא יוצג דבר'
                : 'כבוי — תמונת הרקע נושאת את העמוד'
            }
            value={media.showCover}
            onChange={(v) => update('media', 'showCover', v)}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MediaField
            label="תמונת רקע"
            hint="מוצגת מטושטשת מאחורי כל העמוד"
            accept="image/*"
            value={media.backgroundImage}
            onChange={(v) => update('media', 'backgroundImage', v)}
          />
          <MediaField
            label="עטיפת הסינגל"
            hint="מרובעת, מוצגת מעל הכותרת"
            accept="image/*"
            value={media.coverImage}
            onChange={(v) => update('media', 'coverImage', v)}
          />
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
                  onClick={() =>
                    update(
                      'downloads',
                      'pressImages',
                      downloads.pressImages.filter((_, idx) => idx !== i)
                    )
                  }
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
