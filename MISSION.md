# Mission: Mapbox marker and popup behavior in this project

## Why

I want to confidently change how markers and popups behave in this app's map without breaking selection, hover, or map interactions. The practical goal is to make targeted UI changes in the existing Parkrun map flow and know exactly which seam to edit.

## Success looks like

- I can explain how marker rendering, hover state, selected state, and popup rendering fit together in this repo.
- I can change marker appearance, popup placement, and popup open/close behavior in the current map implementation.
- I can decide when a change belongs in Marker props, Popup props, marker DOM, or React state.

## Constraints

- Stay focused on the current stack in this repo: `react-map-gl` with Mapbox.
- Teach through short lessons tied directly to `app/locations/locations-map.tsx`.
- Prioritize marker and popup behavior over broader Mapbox topics.

## Out of scope

- Full Mapbox style authoring and custom basemap design.
- Route planning and geospatial algorithms.
- Advanced data-layer clustering or deck.gl integration.
