import { useEffect, useState } from 'react';
import {
  FaAward,
  FaDownload,
  FaFileAlt,
  FaImages,
  FaMusic,
  FaPhone,
  FaVideo,
} from 'react-icons/fa';

import { Accordion, AccordionItem } from './components/ui/Accordion';
import Modal from './components/ui/Modal';
import AudioPlayer from './components/AudioPlayer';
import Hero from './components/Hero';
import SocialRow from './components/SocialRow';
import ClipSection from './components/sections/ClipSection';
import ContactSection from './components/sections/ContactSection';
import CreditsSection from './components/sections/CreditsSection';
import DownloadsSection from './components/sections/DownloadsSection';
import GallerySection from './components/sections/GallerySection';
import LyricsSection from './components/sections/LyricsSection';
import PressSection from './components/sections/PressSection';

import { useContent } from './content/useContent';
import { useViewMode } from './hooks/useViewMode';
import { useWebFonts } from './hooks/useWebFonts';
import { themeFontKeys, themeVars } from './theme';
import { trackAccordionOpen, trackMediaDownload, trackPageView } from './utils/analytics';
import { downloadUrl } from './utils/downloadUrl';

export default function App({ content: override, viewMode: viewModeOverride }) {
  const live = useContent({ skip: Boolean(override) });
  const doc = override ?? live.content;
  const urlViewMode = useViewMode();
  const viewMode = viewModeOverride ?? urlViewMode;
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { song, theme, media, links, content, credits, downloads, contact, flags } = doc;

  useWebFonts(themeFontKeys(theme));

  // Which link the visitor arrived on is the interesting half of a page view,
  // so the mode travels with it. The admin preview passes its own content and
  // is not a visit.
  const isPreview = Boolean(override);
  useEffect(() => {
    if (!isPreview) trackPageView(viewMode);
  }, [isPreview, viewMode]);

  const showDownloads = viewMode === 'full';

  const streamUrl = media.audioStreamUrl || downloads.mp3Url;

  return (
    <div
      dir="rtl"
      className="page-root relative min-h-dvh overflow-x-hidden font-body"
      style={themeVars(theme)}
    >
      {media.backgroundImage && (
        <div
          aria-hidden="true"
          className="page-backdrop pointer-events-none fixed inset-0 -z-20"
          style={{ backgroundImage: `url(${media.backgroundImage})` }}
        />
      )}
      <div aria-hidden="true" className="page-overlay pointer-events-none fixed inset-0 -z-10" />

      <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pb-8">
        <div data-section="hero">
          <Hero
            title={song.title}
            artist={song.artist}
            coverImage={media.coverImage}
            showCover={media.showCover}
            glowImage={media.backgroundImage}
          />
        </div>

        <div data-section="socials">
          <SocialRow links={links} />
        </div>

        <div data-section="player">
          <AudioPlayer src={streamUrl} variant={theme.playerStyle} sticky />
        </div>

        <Accordion onOpen={trackAccordionOpen}>
          {downloads.pressImages?.length > 0 && (
            <AccordionItem id="gallery" title="גלריית תמונות" icon={FaImages}>
              <GallerySection images={downloads.pressImages} />
            </AccordionItem>
          )}

          <AccordionItem id="clip" title="קליפ רשמי" icon={FaVideo}>
            <ClipSection videoUrl={media.videoUrl} />
          </AccordionItem>

          {content.prHtml && (
            <AccordionItem id="pr" title="קומוניקט" icon={FaFileAlt}>
              <PressSection html={content.prHtml} />
            </AccordionItem>
          )}

          {content.lyrics && (
            <AccordionItem id="lyrics" title="מילים" icon={FaMusic}>
              <LyricsSection lyrics={content.lyrics} />
            </AccordionItem>
          )}

          {credits.length > 0 && (
            <AccordionItem id="credits" title="קרדיטים" icon={FaAward}>
              <CreditsSection credits={credits} />
            </AccordionItem>
          )}

          {showDownloads && (
            <AccordionItem id="downloads" title="תיקיית הורדות" icon={FaDownload}>
              <DownloadsSection
                downloads={downloads}
                flags={flags}
                artist={song.artist}
                title={song.title}
                onOpenGallery={() => setGalleryOpen(true)}
              />
            </AccordionItem>
          )}

          <AccordionItem id="contact" title="יצירת קשר" icon={FaPhone}>
            <ContactSection contact={contact} />
          </AccordionItem>
        </Accordion>

        <footer data-section="footer" className="pt-2 text-center text-xs text-neutral-600">
          © {song.releaseYear ?? new Date().getFullYear()} {song.artist}
        </footer>
      </main>

      <Modal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        label="הורדת תמונות יח״צ"
      >
        <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-4 pt-14 backdrop-blur-md">
          <div className="grid max-h-[75vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {downloads.pressImages.map((img) => (
              <a
                key={img.src}
                href={downloadUrl(img.src)}
                download={img.name}
                onClick={() => trackMediaDownload('gallery_image')}
                className="group relative overflow-hidden rounded-2xl border border-white/10"
              >
                <img
                  src={img.src}
                  alt={img.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[11px] text-neutral-200">
                  להורדה
                </span>
              </a>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
