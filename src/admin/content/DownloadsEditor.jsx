import { TextArea, TextField, Toggle } from '../ui/Field';
import MediaField from './MediaField';

const FILES = [
  {
    labelKey: 'wav',
    urlKey: 'wavUrl',
    showKey: 'showWav',
    title: 'קובץ WAV',
    hint: 'איכות שידור',
    accept: 'audio/wav,audio/x-wav',
    preview: 'WAV',
  },
  {
    labelKey: 'mp3',
    urlKey: 'mp3Url',
    showKey: 'showMp3',
    title: 'קובץ MP3',
    hint: 'להאזנה והפצה',
    accept: 'audio/mpeg',
    preview: 'MP3',
  },
  {
    labelKey: 'pressPdf',
    urlKey: 'pressPdf',
    title: 'קומוניקט PDF',
    hint: 'להורדה מהעמוד',
    accept: 'application/pdf',
    preview: 'PDF',
  },
  {
    labelKey: 'imagesZip',
    urlKey: 'imagesZip',
    title: 'ארכיון תמונות',
    hint: 'כל התמונות בקובץ אחד',
    accept: '.zip',
    preview: 'ZIP',
  },
];

export default function DownloadsEditor({ downloads, flags, update }) {
  const setLabel = (key, field, value) =>
    update('downloads', 'labels', {
      ...downloads.labels,
      [key]: { ...downloads.labels[key], [field]: value },
    });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {FILES.map(({ labelKey, urlKey, showKey, title, hint, accept, preview }) => (
          <div
            key={labelKey}
            className="flex flex-col gap-3 rounded-xl border border-adm-line bg-adm-bg/40 p-3"
          >
            <MediaField
              label={title}
              hint={hint}
              accept={accept}
              preview={preview}
              value={downloads[urlKey]}
              onChange={(v) => update('downloads', urlKey, v)}
            />

            <TextField
              id={`label-${labelKey}-title`}
              label="כותרת הכרטיס"
              value={downloads.labels[labelKey]?.title}
              onChange={(v) => setLabel(labelKey, 'title', v)}
            />
            <TextField
              id={`label-${labelKey}-sub`}
              label="שורת משנה"
              value={downloads.labels[labelKey]?.subtitle}
              onChange={(v) => setLabel(labelKey, 'subtitle', v)}
            />

            {showKey && (
              <Toggle
                id={`dl-${showKey}`}
                label="הצגה בעמוד"
                value={downloads[showKey]}
                onChange={(v) => update('downloads', showKey, v)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-adm-line bg-adm-bg/40 p-3">
        <Toggle
          id="flags-locked"
          label="נעילת הורדות"
          hint="קבצי השמע יוצגו חסומים עם הודעת הגנת זכויות"
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
  );
}
