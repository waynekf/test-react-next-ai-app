# Mapbox marker and popup behavior Resources

## Knowledge

- [react-map-gl Marker API](https://visgl.github.io/react-map-gl/docs/api-reference/mapbox/marker)
  Primary reference for the `Marker` React wrapper used in this repo. Use for: `anchor`, `offset`, `color`, `scale`, click handling, dragging, and the imperative marker ref methods.
- [react-map-gl Popup API](https://visgl.github.io/react-map-gl/docs/api-reference/mapbox/popup)
  Primary reference for the `Popup` React wrapper used in this repo. Use for: `anchor`, `offset`, `maxWidth`, `closeButton`, `closeOnClick`, `closeOnMove`, and popup ref methods.
- [Mapbox GL JS example: Attach a popup to a marker instance](https://docs.mapbox.com/mapbox-gl-js/example/set-popup/)
  Concrete example of the native Mapbox marker-popup model. Use for: understanding popup offset and the relationship between marker interaction and popup content.
- [Mapbox GL JS example: Custom markers with images](https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/)
  Practical marker customization example. Use for: custom marker DOM, accessibility considerations, and icon styling ideas.

## Wisdom (Communities)

- [Mapbox Developer Discord](https://discord.gg/sBBksyMjcd)
  High-signal place to ask implementation questions when docs are clear but behavior in a live map is still surprising.
- [vis.gl react-map-gl GitHub repository](https://github.com/visgl/react-map-gl)
  Use for: checking issues, examples, and library-specific behavior when the React wrapper differs from native Mapbox documentation.
