# Image prompts for the site

Seventeen prompts: thirteen page images, four brand mock-ups.

Paste each into Higgsfield, set **16:9**, and save. Names do not matter —
tell me when they are done and I will pull them from your generation
history, match them up, compress to WebP and place them with alt text.

## Which model

| For | Use | Why |
|---|---|---|
| The 13 page images | **Nano Banana 2**, 2k | Photorealistic scenes, and it is on the unlim list |
| The 4 brand mock-ups | **Nano Banana Pro** or **GPT Image 2** | The only two tagged for text rendering |

Use one model across all thirteen page images so the set looks consistent.

## House style

> Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.

No text in the page images: models render type as mush, and headlines go on
afterwards in code where they are sharp and a screen reader can read them.
No faces that read as a named client, and nothing implying work we have not done.

---

## The 13 page images

### service-meta-ads

```
Over-the-shoulder view of a phone held in one hand, scrolling a social feed, in the cab of a working van with the door open onto a grey street. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### service-google-ads

```
A phone on a workbench among tools, screen lit, someone reaching for it with a hand that has been working. Late afternoon light through a roller door. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### service-seo

```
A small shopfront on a British high street at dusk, lights on inside, seen from across the road. Quiet, ordinary, a little worn. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### service-web-design

```
A laptop and a phone side by side on a kitchen table, both screens bright but unreadable at this angle, a mug and a notebook beside them. Morning light. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### service-social

```
Someone filming a short clip on a phone propped against a toolbox in a small workshop. Rough, real, not a studio. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-automotive

```
A car on a lift in a small independent garage, one mechanic underneath, strip lighting, oil-stained concrete floor. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-health-beauty

```
A small treatment room in a beauty salon, clean towels folded, a chair and a mirror, soft daylight through a frosted window. Nobody in shot. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-hospitality

```
The pass of a small restaurant kitchen mid-service, hands plating, steam, warm overhead light. Faces out of frame. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-home-trades

```
A plumber's van with the back doors open on a residential street, tools and pipe stacked inside, grey British weather. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-professional-services

```
A small office above a shop, two desks, papers and a desk lamp, net curtains, late afternoon. Lived in rather than corporate. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-property

```
A set of keys on the worktop of an empty flat, boxes stacked behind, bare walls, light from a window with no curtains. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-fitness

```
A small independent gym early in the morning, racks and plates, nobody there yet, low sun through high windows. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

### industry-retail

```
The counter of a small independent shop, card machine and packaging, stock on shelves behind, daylight from the front window. Photographic, natural daylight, shallow depth of field, muted colour, British setting. No text, no words, no lettering, no logos, no signage, no watermarks. No direct eye contact with the camera. Unposed and ordinary rather than stock-photo cheerful.
```

---

## The 4 brand mock-ups

These break the no-text rule on purpose — the name on the surface is the
point. Re-roll until the spelling is right and **read it letter by letter**
before using it; models misspell constantly.

Safer alternative for anything that must be exact: generate the scene with a
blank wall or plain cup, then composite `public/logo.png` on top. Sharp,
correctly spelled, and the real mark rather than a model impression of it.

### brand-wall-sign

```
Brushed metal letters reading "SHAZ MARKETING GROUP" mounted on a plain white plaster wall in a small modern office, lit from above, a corner of a desk and a plant just in frame at the edge. Shallow depth of field, photographic.
```

### brand-cup

```
A white ceramic mug on a wooden desk beside a closed laptop and a notebook, the words "SHAZ MARKETING GROUP" printed small on the side of the mug in a clean sans-serif. Morning light from a window, shallow depth of field, photographic.
```

### brand-desk

```
A dark notebook with "SHAZ MARKETING GROUP" foil-stamped small on the cover, a pen across it, on a desk beside a phone and a coffee. Overhead flat lay, natural light, photographic.
```

### brand-office-wide

```
A group of about twelve people standing together in a bright open-plan office, talking and laughing, mid-conversation rather than posed in a row. Mixed ages, ordinary work clothes, British. Natural window light, photographic, shallow depth of field. No text, no signage, no logos.
```
