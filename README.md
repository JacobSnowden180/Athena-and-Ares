# Athena & Ares

A static site for [athenaandares.com](https://athenaandares.com): my two dogs, Athena and Ares, and the urban mushing (scooterjoring) we do on an ordinary GoTrax XR Pro in Austin.

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
| `gallery.html` | All photos, with a lightbox |
| `about.html` | Why I do this, in first person |
| `contact.html` | Email link only |
| `404.html` | Missing-page fallback |

The header, navigation, and footer are copied into each HTML file. If you change one, update the others. Search for `site-header` and `site-footer`.

## File structure

```
index.html, dogs.html, mushing.html, gallery.html, about.html, contact.html, 404.html
css/styles.css
js/site.js           menu, scroll reveals, gallery filter, lightbox, video
images/              responsive WebP and JPEG at 480, 840, and 1242 wide
video/dog-run.mp4    homepage loop, plus dog-run.vtt and images/dog-run-poster.jpg
fonts/               self-hosted Fraunces, Source Serif 4, and Outfit (OFL)
favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png
images/og.jpg        share image
robots.txt, sitemap.xml, site.webmanifest
wrangler.jsonc       Cloudflare Workers static assets
_headers             security and cache headers
```

Phone originals are not in the repo. Web images were exported with EXIF orientation applied and all metadata stripped, including any GPS. Do not put originals back into the site.

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
