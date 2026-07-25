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
import CreditsEditor from './CreditsEditor';
import MediaField from './MediaField';

const fontOptions = FONTS.map((f) => ({ value: f.key, label: f.label }));

const SOCIALS = [
  ['spotify', 'Spotify'],
  ['appleMusic', 'Apple Music'],
  ['youtube', 'YouTube'],
  ['tiktok', 'TikTok'],
  ['instagram', 'Instagram'],
];

const DOWNLOAD_LABELS = [
  ['wav', 'כרטיס WAV'],
  ['mp3', 'כרטיס MP3'],
  ['pressPdf', 'כרטיס קומוניקט'],
  ['gallery', 'כרטיס גלריית תמונות'],
  ['imagesZip', 'כרטיס ZIP'],
];

export default function ContentTab({ draft, update, replace }) {
  const { song, theme, media, links, content, credits, downloads, contact, flags } = draft;

  const setLabel = (key, field, value) =>
    update('downloads', 'labels', {
      ...downloads.labels,
      [key]: { ...downloads.labels[key], [field]: value },
    });

  return (
    <Accordion variant="light" defaultOpenId="general">
      <AccordionItem
        id="general"
        title="הגדרות כלליות"
        hint="חל על כל העמוד — שם, עיצוב, רקע ונגן"
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

      <AccordionItem id="socials" title="קישורי סטרימינג ורשתות" icon={FaShareAlt}>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOCIALS.map(([key, label]) => (
              <TextField
                key={key}
                id={`link-${key}`}
                label={label}
                dir="ltr"
                placeholder="https://"
                value={links[key]}
                onChange={(v) => update('links', key, v)}
              />
            ))}
          </div>
        </AccordionItem>

      <AccordionItem id="gallery" title="גלריית תמונות" icon={FaImages}>
          <div className="space-y-3">
            {downloads.pressImages.map((img, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_auto]">
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
                <button
                  type="button"
                  onClick={() =>
                    update(
                      'downloads',
                      'pressImages',
                      downloads.pressImages.filter((_, idx) => idx !== i)
                    )
                  }
                  className="mt-6 h-9 rounded-lg border border-adm-line bg-white px-3 text-xs text-adm-ink2 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                >
                  מחיקה
                </button>
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
          </div>
        </AccordionItem>

      <AccordionItem id="clip" title="קליפ רשמי" icon={FaVideo}>
          <TextField
            id="media-video"
            label="כתובת הטמעה של YouTube"
            hint="בפורמט https://www.youtube.com/embed/... — ריק יציג ״הקליפ יעלה בקרוב״"
            dir="ltr"
            value={media.videoUrl}
            onChange={(v) => update('media', 'videoUrl', v)}
          />
        </AccordionItem>

      <AccordionItem id="pr" title="קומוניקט" icon={FaFileAlt}>
          <TextArea
            id="content-pr"
            label="תוכן הקומוניקט"
            hint="נתמכים תגי HTML: <strong> להדגשה, <br> לשורה חדשה, <blockquote> לציטוט"
            rows={14}
            mono
            value={content.prHtml}
            onChange={(v) => update('content', 'prHtml', v)}
          />
        </AccordionItem>

      <AccordionItem id="lyrics" title="מילים" icon={FaMusic}>
          <TextArea
            id="content-lyrics"
            label="מילות השיר"
            hint="שורה ריקה מפרידה בין בתים"
            rows={16}
            value={content.lyrics}
            onChange={(v) => update('content', 'lyrics', v)}
          />
        </AccordionItem>

      <AccordionItem id="credits" title="קרדיטים" icon={FaAward}>
          <CreditsEditor credits={credits} onChange={(v) => replace('credits', v)} />
        </AccordionItem>

      <AccordionItem id="downloads" title="תיקיית הורדות" icon={FaDownload}>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                id="dl-show-wav"
                label="הצגת קובץ WAV"
                value={downloads.showWav}
                onChange={(v) => update('downloads', 'showWav', v)}
              />
              <Toggle
                id="dl-show-mp3"
                label="הצגת קובץ MP3"
                value={downloads.showMp3}
                onChange={(v) => update('downloads', 'showMp3', v)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MediaField
                label="קובץ WAV"
                hint="איכות שידור"
                accept="audio/wav,audio/x-wav"
                preview="WAV"
                value={downloads.wavUrl}
                onChange={(v) => update('downloads', 'wavUrl', v)}
              />
              <MediaField
                label="קובץ MP3"
                accept="audio/mpeg"
                preview="MP3"
                value={downloads.mp3Url}
                onChange={(v) => update('downloads', 'mp3Url', v)}
              />
              <MediaField
                label="קומוניקט PDF"
                accept="application/pdf"
                preview="PDF"
                value={downloads.pressPdf}
                onChange={(v) => update('downloads', 'pressPdf', v)}
              />
              <MediaField
                label="ארכיון תמונות"
                accept=".zip"
                preview="ZIP"
                value={downloads.imagesZip}
                onChange={(v) => update('downloads', 'imagesZip', v)}
              />
            </div>

            <div>
              <h3 className="text-xs font-bold text-adm-ink">
                כתוביות הכרטיסים
              </h3>
              <div className="mt-2 space-y-2">
                {DOWNLOAD_LABELS.map(([key, name]) => (
                  <div key={key} className="grid gap-2 sm:grid-cols-2">
                    <TextField
                      id={`label-${key}-title`}
                      label={name}
                      value={downloads.labels[key]?.title}
                      onChange={(v) => setLabel(key, 'title', v)}
                    />
                    <TextField
                      id={`label-${key}-sub`}
                      label="שורת משנה"
                      value={downloads.labels[key]?.subtitle}
                      onChange={(v) => setLabel(key, 'subtitle', v)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-adm-line pt-3">
              <Toggle
                id="flags-locked"
                label="נעילת הורדות"
                hint="הכרטיסים יוצגו חסומים עם הודעת הגנת זכויות"
                value={flags.downloadsLocked}
                onChange={(v) => update('flags', 'downloadsLocked', v)}
              />
              <TextArea
                id="flags-locked-msg"
                label="הודעת נעילה"
                rows={2}
                value={flags.lockedMessage}
                onChange={(v) => update('flags', 'lockedMessage', v)}
              />
            </div>
          </div>
        </AccordionItem>

      <AccordionItem id="contact" title="יצירת קשר" icon={FaPhone}>
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
