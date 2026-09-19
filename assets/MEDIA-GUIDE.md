# Media guide — drop-in real assets

No real photos or video exist yet. The before/after slider and the photo
gallery instead show small hand-drawn line illustrations (matching the
homepage's rack diagram style), each tagged with a visible "Exempelbild" /
"Sample illustration" badge — **these are placeholders, not real photos or
video of Corpup's facilities or work**, and must be replaced before launch.
The hero video has no illustration equivalent (a `<video>` element needs an
actual video file) and simply stays on the current static light hero until
one is added. Drop a real file at the exact path below and the
illustration/placeholder disappears automatically; no HTML or CSS changes
needed.

## 1. Hero background video — `index.html`

| File | Spec |
|---|---|
| `assets/video/hero.mp4` | H.264, 1920×1080 (or 1280×720), 8–20s seamless loop, **no audio needed** (it plays muted). Keep it under ~6 MB — it autoplays on page load. |
| `assets/video/hero.webm` | Optional, same content as `.mp4`, VP9/AV1 — smaller file size, tried first. |
| `assets/video/hero-poster.jpg` | A single frame from the video, same aspect ratio. Shown before the video loads and if video is disabled. |

Good footage: a slow pan or static wide shot of a data hall aisle, or a
tech at work — nothing with fast motion or flashing (autoplay + accessibility).
If no file exists, the homepage hero simply stays in its current light,
static design — nothing breaks.

Respects `prefers-reduced-motion`: the video never autoplays for visitors
who have that OS setting on.

## 2. Before/after slider — `tjanster.html`

| File | Spec |
|---|---|
| `assets/before-after/before-1.jpg` | The dirty/dusty state. |
| `assets/before-after/after-1.jpg` | The same rack/area, same camera position, after cleaning. |

Both images should be shot from the **same tripod position** and cropped to
the **same dimensions** (recommend 1600×1000, a 16:10 ratio) so the slider
reveal lines up convincingly. Mismatched framing is the single most common
way a before/after slider looks fake — keep the camera locked off between
shots.

Want a second or third comparison pair (e.g. a floor, a subfloor void)?
Duplicate the `<figure class="compare" data-compare>` block in
`tjanster.html` with `before-2.jpg`/`after-2.jpg`, etc. — the JS
(`js/media.js`) initialises every `[data-compare]` on the page automatically.

## 3. Photo gallery — `om-oss.html`

Six slots are wired up. Replace any/all — unused ones just keep showing
their placeholder:

| File | Currently captioned as |
|---|---|
| `assets/gallery/photo-1.jpg` | Djuprengöring av rackskåp i datahall |
| `assets/gallery/photo-2.jpg` | Rengöring under datorgolv |
| `assets/gallery/photo-3.jpg` | ESD-golvvård och polering |
| `assets/gallery/photo-4.jpg` | Partikelmätning med räknare |
| `assets/gallery/photo-5.jpg` | Byggstädning inför driftsättning |
| `assets/gallery/photo-6.jpg` | Team i skyddsutrustning i serverrum |

Recommend roughly 4:3 or square crops, at least 1200px on the short side
(the lightbox shows them up to ~1000px wide). If your actual photos don't
match these captions 1:1, just edit the caption text and `alt` attribute
next to each `<img>` in `om-oss.html` — the file path is independent of
the caption.

To add more than six photos, copy one `<button class="gallery__item">...
</button>` block, point it at `photo-7.jpg`, and add matching `gallery.7`
Swedish text + an English line in `js/i18n.js`. The lightbox and its
keyboard/swipe navigation adapt to however many items are in the grid.

## Confirming a file is being picked up

Open the page in a browser and check DevTools → Network for the file. A
200 response means it's live; a 404 means the placeholder will keep
showing. No caching layer sits in front of these — a hard refresh is
usually all that's needed.
