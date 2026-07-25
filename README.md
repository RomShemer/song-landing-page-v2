# 🎵 Song Landing Page – “Rutzi” (Demo)

A modern, responsive **song landing page** built for an independent artist.  
Designed to present a single release with media, press materials, downloads, and contact information —  
all in a clean, elegant, and user-friendly experience.

🔗 **Live Demo:**  https://song-landing-rutzi-demo.netlify.app/


https://github.com/user-attachments/assets/a5a94fac-ee44-485c-af7d-0fdea315ebdf


---

## ✨ Project Overview

This project is a **custom-built landing page** for a music release, featuring:

- Embedded official music video
- In-page audio player
- Press release (formatted HTML content)
- Lyrics section
- Credits
- Download area (audio & press materials)
- Social media links
- Contact section
- Image gallery modal

The demo version intentionally **restricts song file downloads** to protect the artist’s rights.

---

##  Features

- ⚛️ **React + Vite** setup
- 🎨 Custom UI & styling (no UI framework)
- 📂 Accordion-based layout for clean content navigation
- 🎧 Native audio player
- 🖼️ Modal image gallery
- 📱 Fully responsive design – optimized for desktop, tablet, and mobile
- 📊 **Google Analytics 4 (GA4)** event tracking:
  - Song downloads (MP3 / WAV)
  - Media downloads
  - Audio play
  - Social link clicks
  - Accordion section opens
  - Contact interactions
- 🔒 Demo mode with restricted downloads
- 🌐 Deployed on **Netlify**

---

## 🔒 Demo Mode

This repository represents a **demo version** of the project.

In demo mode:
- MP3 / WAV downloads are disabled
- A user-friendly message is shown instead
- Press PDF and images remain accessible

This allows safe public showcasing without exposing copyrighted audio files.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Custom CSS
- **Icons:** react-icons
- **Analytics:** Google Analytics 4 (GA4)
- **Hosting:** Netlify

---

## 📈 Analytics Events (GA4)

Custom events implemented:

| Event Name | Description |
|-----------|------------|
| `download_song` | MP3 / WAV download attempts |
| `download_media` | Press & image downloads |
| `audio_play` | Audio player play |
| `social_click` | Social media clicks |
| `accordion_open` | Section engagement |
| `contact_click` | Phone / Email clicks |

---

## 📦 Installation & Local Run

```bash
npm install
npm run dev
