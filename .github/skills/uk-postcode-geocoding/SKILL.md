---
name: uk-postcode-geocoding
description: "Use this skill when implementing, refactoring, or reviewing UK postcode to latitude/longitude conversion, postcode lookup APIs, coordinate enrichment, or map features that depend on postcode geocoding."
---

# UK Postcode Geocoding

Use this skill when work in this repository needs to turn a UK postcode into latitude and longitude coordinates.

## Goals

- Prefer a postcode-specific data source over general-purpose geocoding when the input is a UK postcode.
- Keep postcode lookup logic in a server-side utility or API route unless the task explicitly requires direct browser access.
- Normalize and validate postcode input before calling an external service.
- Make the lookup path easy to test by isolating provider access behind a small function.

## Recommended Approach

1. Treat this as UK postcode lookup, not generic address geocoding.
2. Prefer a UK postcode service such as `postcodes.io` for direct postcode to coordinate lookup.
3. Normalize incoming postcodes before lookup:
   - trim leading and trailing whitespace
   - collapse repeated internal whitespace
   - uppercase the value
4. Validate obvious bad input early and return a clear error for empty or malformed values.
5. Keep provider calls on the server when possible so provider details, rate limits, and retries stay under application control.
6. Return a minimal stable shape from lookup code, such as postcode, latitude, longitude, and any small amount of metadata the caller actually needs.

## Implementation Guidance

- Prefer a focused utility for the provider interaction and call that utility from routes or server components.
- Avoid mixing postcode normalization, network access, and UI formatting in one function.
- If the repo adds batch enrichment for multiple postcodes, consider simple caching or deduplication for repeated lookups in the same request flow.
- If the provider distinguishes invalid, unknown, or terminated postcodes, preserve that distinction in error handling when it matters to the feature.
- If a fallback provider is added later, keep the provider interface small so the calling code does not depend on provider-specific response shapes.

## Testing Guidance

- Test postcode normalization separately from network behavior.
- Mock the provider boundary instead of hitting a live geocoding service in automated tests.
- Cover at least these cases:
  - valid postcode returns coordinates
  - invalid or empty postcode returns a controlled failure
  - provider failure is surfaced without leaking raw upstream details to the UI

## When Not To Use

- Do not use this skill for general address search, place search, or non-UK geocoding.
- Do not use a broad map search API when the input is already a UK postcode unless the task explicitly requires a different provider.