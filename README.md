# Athena & Ares

A static site for [athenaandares.com](https://athenaandares.com): Jacob Snowden’s two dogs, and the urban mushing (scooterjoring) they do on an ordinary GoTrax XR Pro in North Austin.

There is no build step. HTML, CSS, and a small vanilla script are the site. The repository root is what gets deployed.

## Preview locally

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080). Check a phone-width window as well as a desktop one. Most of these photos are vertical, and most readers will be on a phone.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home, with the looping run clip |
| `dogs.html` | Athena and Ares |
| `mushing.html` | The urban mushing guide |
| `journal.html` | Trail log index |
| `journal/evening-lap.html` | Starter post, adventure-log style |
| `journal/sharing-the-pull.html` | Starter post, how-to style |
| `map.html` | Illustrated story map (not a street map) |
| `gallery.html` | All photos, with a lightbox |
| `about.html` | Why Jacob does this, in his voice |
| `contact.html` | Email link only |
| `404.html` | Missing-page fallback |

The header, navigation, and footer are copied into each HTML file. If you change one, update the others. Search for `site-header` and `site-footer`.

## File structure

```
index.html, dogs.html, mushing.html, journal.html, map.html, gallery.html, about.html, contact.html, 404.html
journal/             one HTML file per trail-log post
css/styles.css
js/site.js           menu, scroll reveals, gallery filter, lightbox, map markers, video
images/              responsive WebP and JPEG at 480, 840, and 1242 wide
video/run-clip.mp4   silent loop, plus run-clip.vtt and a poster in images/
fonts/               self-hosted Fraunces, Source Serif 4, and Outfit (OFL)
favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png
images/og.jpg        share image
robots.txt, sitemap.xml, site.webmanifest
wrangler.jsonc       Cloudflare Workers static assets
_headers             security and cache headers
```

Phone originals are not in the repo. Web images were exported with EXIF orientation applied and all metadata stripped, including any GPS. Do not put originals back into the site.

## How to add a blog post

Posts are plain HTML. There is no CMS and no template engine.

1. Copy `journal/evening-lap.html` to a new file, for example `journal/boots-on.html`. Use a short lowercase slug with hyphens.
2. In the new file, change:
   - `<title>` and the meta description
   - `link rel="canonical"` and every `og:url` / `og:title` / `og:description` / `twitter:*` so they use `https://athenaandares.com/journal/boots-on.html`
   - the `<h1>` and the article body
   - keep `aria-current="page"` on the Trail Log link in the header
3. On `journal.html`, duplicate one `<article class="log-card">` inside `.log-list` and point it at the new file. The comment above that list marks the spot.
4. Add the new URL to `sitemap.xml`.

Use one of the two shapes already here:

- **Trail note** (`evening-lap.html`): first person, a night or a habit, no invented street, date, or landmark.
- **Field guide** (`sharing-the-pull.html`): a how-to with headings, a short list, and the safety rules when they apply.

Do not add a calendar date you are not sure of. Do not name an exact neighborhood, street, apartment, or business as a destination. “Austin” and “North Austin” are the place names the site uses.

A new card looks like this:

```html
<article class="log-card">
  <p class="meta">Trail note</p>
  <h2><a href="/journal/boots-on.html">Boots on</a></h2>
  <p>One or two sentences that do not give away a route.</p>
  <p><a href="/journal/boots-on.html">Read the note</a></p>
</article>
```

Photos inside a post use the same `<picture>` pattern as the gallery (see below). Root-relative URLs (`/images/...`, `/css/styles.css`) work from the `journal/` folder.

## How to add a photo

1. Start from a copy you are willing to publish. Apply the correct rotation, then strip EXIF, GPS, and other metadata. ImageMagick:

   ```bash
   magick input.jpg -auto-orient -strip -resize 1242x -quality 82 images/my-photo-1242.jpg
   ```

   The source photos for v1 were already 1242 pixels wide, so the site does not upscale. Make three widths when the source is large enough: **480**, **840**, and **1242**. Skip a width that would be an upscale.

2. Write a WebP and a JPEG at each width. Keep the slug in the filename: `my-photo-480.webp`, `my-photo-480.jpg`, and the same for 840 and 1242.

3. Add a figure to `gallery.html` inside `.gallery`. Set `data-who` to `athena`, `ares`, or `both`. Athena is the black dog with the white chest. Ares is the cream dog with the plumed tail.

```html
<figure data-who="both">
  <button class="shot" type="button" data-full="/images/my-photo-1242.webp">
    <picture>
      <source type="image/webp"
        srcset="/images/my-photo-480.webp 480w, /images/my-photo-840.webp 840w, /images/my-photo-1242.webp 1242w"
        sizes="(min-width: 1100px) 30vw, (min-width: 720px) 46vw, 100vw">
      <img src="/images/my-photo-840.jpg"
        srcset="/images/my-photo-480.jpg 480w, /images/my-photo-840.jpg 840w, /images/my-photo-1242.jpg 1242w"
        sizes="(min-width: 1100px) 30vw, (min-width: 720px) 46vw, 100vw"
        alt="Describe what is actually in the frame."
        width="1242" height="2208" loading="lazy" decoding="async">
    </picture>
  </button>
  <figcaption>Short label</figcaption>
</figure>
```

Write the alt text from the picture in front of you: who, what they are doing, harness or scooter if those are visible. Do not put a home address, apartment name, or exact street in the alt text or the caption.

`data-full` is the image the lightbox opens. The button’s image can stay lazy.

## Deploy on Cloudflare Workers

This matches the static-asset setup used for the other site: no framework, no build command, Wrangler serves the repository root.

`wrangler.jsonc` names the Worker `athena-and-ares` and sets `assets.not_found_handling` to `404-page`, which serves `404.html` for unknown URLs. `.assetsignore` keeps the README, Wrangler config, npm files, and `.git` out of the upload.

In **Workers Builds**:

1. Connect this repository.
2. Production branch: `main` (after this work is merged).
3. Build command: leave empty. There is nothing to compile.
4. Deploy command: `npx wrangler deploy`

The `package.json` devDependency pins Wrangler 4.163.0 so the deploy command is the same one the config was written for. Non-production checks that run `npx wrangler preview` use that same config.

A custom domain (`athenaandares.com`) is attached in the Cloudflare dashboard after the Worker exists. Canonical and Open Graph URLs in the HTML already use that host.

Do not add the home address, an apartment name, a live map embed, or GPS metadata when you deploy new photos.

## Design notes

The look is a night-ride field journal: warm paper, olive, one ember accent, Fraunces for titles, Source Serif 4 for reading. Motion is limited to a gentle reveal and a slight shift of the hero stars, and it turns off under `prefers-reduced-motion`. The run clip stays muted and looping until someone uses the controls. If the visitor has asked for reduced motion, or the browser is in data-saver mode, the clip waits on its poster.

The adventure map is illustrated. It is not a trace of a real route.
