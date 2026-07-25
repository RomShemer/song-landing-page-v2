import { useState } from 'react';
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
import { trackAccordionOpen, trackMediaDownload } from './utils/analytics';

export default function App() {
  const { content: doc } = useContent();
  const viewMode = useViewMode();
  const [galleryOpen, setGalleryOpen] = useState(false);

  const { song, media, links, content, credits, downloads, contact, flags } = doc;

  // Listen-only links go to press who should hear the track but receive no
  // files — masters, press PDF and photo sets are all withheld.
  const showDownloads = viewMode === 'full';

  // MP3 doubles as the stream when no dedicated streaming URL is set, but only
  // where downloads are permitted — otherwise the file URL would leak into a
  // link that promises no downloads.
  const streamUrl = media.audioStreamUrl || (showDownloads ? downloads.mp3Url : '');

  return (
    <div dir="rtl" className="relative min-h-dvh overflow-x-hidden">
      {media.backgroundImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${media.backgroundImage})` }}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-neutral-950/80"
      />

      <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pb-8">
        <Hero title={song.title} artist={song.artist} coverImage={media.coverImage} />

        <SocialRow links={links} />

        <AudioPlayer src={streamUrl} title={song.title} artist={song.artist} sticky />

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

        <footer className="pt-2 text-center text-xs text-neutral-600">
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
                href={img.src}
                download={img.name}
                onClick={() => trackMediaDownload('gallery_image')}
                className="group relative overflow-hidden rounded-xl border border-white/10"
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
