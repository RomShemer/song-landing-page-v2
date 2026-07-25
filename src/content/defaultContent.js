import { normalizeContent } from '@schema';

/**
 * Build-time content, rendered on first paint so the page never shows a spinner
 * and still works if KV / the API is unreachable. `useContent` merges the live
 * document from /api/content over this once it lands.
 */
const defaultContent = normalizeContent({
  schemaVersion: 1,
  song: {
    title: 'רוצי',
    artist: 'דור שמר',
    releaseYear: 2026,
  },
  media: {
    coverImage: '/media/photos/press-official.jpg',
    backgroundImage: '/media/background.jpg',
    audioStreamUrl: '',
    videoUrl: 'https://www.youtube.com/embed/jpYKL5SresI',
  },
  links: {
    instagram:
      'https://www.instagram.com/dorshemer?igsh=MWV1dnB6aXhjcjQ5NQ%3D%3D&utm_source=qr',
    tiktok: 'https://www.tiktok.com/@dorshemer?_r=1&_t=ZS-92xEvCpM1FY',
    youtube: 'https://youtube.com/@dorshemerofficial?si=kM5MDSM9SLHsneni',
    appleMusic:
      'https://music.apple.com/il/artist/%D7%93%D7%95%D7%A8-%D7%A9%D7%9E%D7%A8/1686917781?l=he',
    spotify:
      'https://open.spotify.com/artist/55zIe90kgsBhHaPzeNSUcY?si=my69ZGWgQZW3OU57SMmN8Q',
  },
  content: {
    prHtml: `<strong>אחרי שנתיים של שתיקה: "רוצי" – הזינוק החדש של דור שמר</strong><br><br>

<em>"גברת רשימות עושה משהו לא נכון..."</em><br><br>
לפעמים מרוב תכנונים, רשימות וניסיונות שהכול יהיה <strong>"מושלם"</strong>, אנחנו שוכחים פשוט לצאת לדרך.
עבור דור שמר – סולנית תזמורת צה"ל לשעבר, וכמי שכיכבה על במת הקאמרי במחזמר <strong>"זה אני"</strong> –
השנתיים האחרונות היו שיעור כואב באיבוד שליטה.<br><br>

לאחר שגיסה, <strong>עמית כהן הי״ד</strong>, נרצח במסיבת הנובה,
המוזיקה הרגישה פתאום אנוכית, והניצוץ – כך פחדה – כבה.<br><br>

אחרי תקופה ארוכה של ניתוק רגשי וחיפוש עצמי,
היא חוזרת עם <strong>"רוצי"</strong> – שיר שכולו התעוררות.
זהו מפגש ישיר וחשוף של דור עם הפחדים הכי גדולים שלה:<br>
להיחשף, להיכשל, להישאר במקום, לקפוץ למים.<br><br>

<blockquote>
"זה הכול או כלום, יש לי עצור – שנה כיוון…
אין לי מה להפסיד, אמרו לי: רוצי"
</blockquote>

<strong>הסאונד:</strong><br>
"רוצי" מביא אל קדמת הבמה סאונד פופ עדכני, חם ועמוק.
ההפקה של <strong>גילי אסרף</strong> משלבת בין דרייב קצבי וסוחף לבין עומק טקסטואלי,
ויוצרת שיר שנע על התפר המדויק שבין פופ רדיו נגיש
לבין יצירה אישית, בועטת ומחוספסת.<br><br>

<strong>הקליפ:</strong><br>
(בימוי: <strong>גל צורף</strong>) מציג בצורה ויזואלית את הלופ המוכר לכולנו –
ההתארגנות האינסופית והתירוצים למה אנחנו עדיין לא "מוכנים" לצאת.
דרך החלפות נעליים מאסיביות שמדמות את היציאה שלא קורית.
הקליפ נחתם בהליכה יחפה –
הדימוי האולטימטיבי של ההחלטה להפסיק לתכנן ופשוט להתחיל לרוץ.<br><br>

דור שמר, שהופיעה על במות הגדולות בארץ ובעולם
(בין היתר בית הנשיא, תיאטרון הקאמרי ובגאלות הרשמיות של ה-FIDF),
מביאה הפעם הגשה רגשית וישירה מאי פעם.<br><br>

<strong>
היא לא מחפשת אישור שהיא לא נכשלה –
היא כאן כדי להראות שגם כשמאבדים אמונה,
אפשר למצוא את הכוח לנוע קדימה.
</strong><br><br>

כי בסוף, בלי להעז לטעות – <strong>פשוט נשארים במקום.</strong>`,
    lyrics: `לא נזהרת כמו פעם
לא מוצאת את הטעם
נגמרו הקלפים בשרוול
אין יותר תירוצים, אין קהל

איך זה עוד לא קרה לי?
לאן נעלמתי?
קשה לי לראות אחרים מתקדמים
ואת, את עוד כאן

אז זה הכל או כלום
יש לי עצור שנה כיוון
קופצת ראש למים
נראה לי שהבנתי
הם כולם צדקו
גם אם אין הסכם חתום
נשבעתי שהפעם, אבל הפעם באמת

אני בחוץ
אין לי מה להפסיד
אמרו לי- רוצי
כאבי גדילה משתקים לי את הגוף
פלסטרים, הכל חשוף
לא יורדת מהסוס
אמרו לי-
רוצי, רוצי

קיבלתי וואחד סטירה לביטחון
אף אחד לא קורא אותי נכון
מתה מפחד, הלך לי הפאסון
גברת רשימות עושה משהו לא נכון

אין עם מי לדבר, אז עדיף לי לשתוק
נאה מקיים לא יודע לדרוש
קריאה אחרונה לקולות שלי בראש
לספור עד שלוש

זה הכל או כלום
יש לי עצור שנה כיוון
קופצת ראש למים
נראה לי שהבנתי
הם כולם צדקו
גם אם אין הסכם חתום
נשבעתי שהפעם, אבל הפעם באמת

אני בחוץ
כבר אין לי מה להפסיד
אמרו לי - רוצי
כאבי גדילה משתקים לי את הגוף
פלסטרים, הכל חשוף
לא יורדת מהסוס
אמרו לי-
רוצי, רוצי

בלי אוויר בריאות, אני בדרך
מותר גם לטעות, לתת ללב את
המושכות, להודות, אין גלימה אין כתר
תראו אותי

אני בחוץ
כבר אין לי מה להפסיד
אמרו לי רוצי
כאבי גדילה משתקים לי את הגוף
פלסטרים, הכל חשוף
לא יורדת מהסוס
אמרו לי
רוצי, רוצי`,
  },
  credits: [
    { role: 'מילים', name: 'דור שמר, גילי אסרף' },
    { role: 'לחן', name: 'דור שמר, גילי אסרף' },
    { role: 'הפקה', name: 'גילי אסרף' },
    { role: 'מיקס', name: 'גילי אסרף' },
    { role: 'מאסטרינג', name: 'אוהד ניסים' },
    { role: 'וידאו', name: 'גל צורף' },
  ],
  downloads: {
    mp3Url: '',
    wavUrl: '',
    pressPdf: '/media/press-release.pdf',
    imagesZip: '/media/press-photos.zip',
    pressImages: [
      { src: '/media/photos/press-official.jpg', name: 'Dor_Shemer_Press_Official.jpg' },
      { src: '/media/photos/press-01.jpg', name: 'Dor_Shemer_Press_01.jpg' },
      { src: '/media/photos/press-02.jpg', name: 'Dor_Shemer_Press_02.jpg' },
      { src: '/media/photos/press-03.jpg', name: 'Dor_Shemer_Press_03.jpg' },
    ],
  },
  contact: {
    phone: '054-4883686',
    email: 'dor1998shemer@gmail.com',
  },
  flags: {
    downloadsLocked: false,
    lockedMessage: 'ההורדות אינן זמינות כרגע — להגנת זכויות היוצרים. לפרטים ניתן ליצור קשר.',
  },
});

export default defaultContent;
