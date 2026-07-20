# Selection Highlight Glitch Fixes Walkthrough

I have successfully added global reset overrides to eliminate selection overlay highlights and visual tap glitches on interactive elements when double-clicked or repeatedly clicked.

---

## Technical Details

### 🚫 1. CSS Highlights Resets
* **[MODIFY] [globals.css](file:///c:/Users/Aron%20Bobby%20Daniel/Documents/f1dash/app/globals.css):**
  * Added `user-select: none` overrides for all next-race cards, navbar links, details buttons, standings position boxes, and driver labels to prevent text highlighting overlays on click.
  * Applied `-webkit-tap-highlight-color: transparent` globally to eliminate mobile chrome tap box overlay glitches.
