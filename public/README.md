# Drop real images here

The landing page currently ships with **zero binary image assets** — the only
"image" is a CSS-drawn placeholder for the satellite plot in the hero.

## Hero satellite photo (the one thing to swap)

File to edit: [`components/Hero.tsx`](../components/Hero.tsx)

Look for the comment `PLACEHOLDER: satellite aerial photo`. Replace the
placeholder `<div role="img">` with a real image:

```tsx
import Image from "next/image";

<Image
  src="/hero-satellite.jpg"          // put the file in /public
  alt="Satellite view of the analyzed forest plot"
  fill
  className="rounded-2xl object-cover"
  priority
/>
```

The glowing cyan polygon, vertex dots, and floating data chips are drawn on top
in CSS/SVG, so they will sit correctly over whatever image you drop in.
