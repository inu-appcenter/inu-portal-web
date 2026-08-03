# AppBar (sub-component — detail screen header)

- Figma URL: https://www.figma.com/design/6vRWpqOQ9pMJyMMr2558kf/INTIP--Copy-?node-id=3059-9421
- fileKey: `6vRWpqOQ9pMJyMMr2558kf`
- nodeId: `3059:9421`
- Frame: `AppBar`, 393×68 — standalone component, used as the header on the detail screen
  ([08-recommended-timetable-detail.md](./08-recommended-timetable-detail.md)) and in a
  badge-less variant on the empty/error screens (09, 10).

## What it contains

- `Icon_Back`: 40×40 tap target with a `‹` chevron glyph.
- Title text: "시안 A" (dynamic — the candidate label).
- `Badge`: pill showing "15학점 · 6과목" (credits · course count), right-aligned.

Compare against the empty/error screens' inline `AppBar`, which has no badge — this looks
like a single component with an optional trailing badge slot, not two separate components.
Worth building as one `<AppBar title badge? >` component.

## Raw metadata (get_metadata)

```xml
<frame id="3059:9421" name="AppBar" x="2758" y="6896" width="393" height="68">
  <frame id="3059:9422" name="Icon_Back" x="20" y="10" width="40" height="40">
    <text id="3059:9423" name="‹" x="15.5" y="0.5" width="9" height="39" />
  </frame>
  <text id="3059:9424" name="시안 A" x="68" y="15" width="209" height="30" />
  <frame id="3059:9425" name="Badge" x="285" y="18.5" width="88" height="23">
    <text id="3059:9426" name="15학점 · 6과목" x="8" y="3" width="72" height="17" />
  </frame>
</frame>
```
