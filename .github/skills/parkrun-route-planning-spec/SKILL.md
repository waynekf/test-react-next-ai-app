---
name: parkrun-route-planning-spec
description: "Use this skill when you need a requirements interview or implementation brief for a route-planning, train route, tube route, or parkrun transport feature between a saved home location and a prospective parkrun. Trigger phrases include route planning, train route, tube route, parkrun transport, implementation brief, and requirements interview."
---

# Parkrun Route Planning Spec

Use this skill when the user wants to define a build-ready feature spec for planning a train-and-Tube journey from a selected home location to a prospective parkrun.

## When To Use

- Use when the user asks for route planning, a train route, a Tube route, parkrun transport, an implementation brief, or a requirements interview.
- Use when the task needs implementation-shaping decisions before code is written.
- Use when the output should be a short executive summary followed by a fixed markdown implementation brief.

## Workflow

1. Confirm the feature is a train-and-Tube route-planning flow between one selected home location and one prospective parkrun.
2. Conduct the interview one question at a time.
3. Resolve foundational product and data decisions before UI or copy details.
4. Prefer recommended answers when one option is clearly better for implementation simplicity, product clarity, or future extensibility.
5. Stop asking questions once the major implementation-shaping branches are resolved.
6. Finish with a short executive summary plus the fixed markdown template in this file.

## Interview Rules

- Ask exactly one question per turn.
- Keep each question narrowly scoped to a decision that changes architecture, data shape, provider choice, validation rules, or key UX behavior.
- Do not ask for visual polish, wording, or secondary edge cases until the core route model is settled.
- If the user has already given a clear constraint, accept it and move to the next unresolved branch.
- If a default below is acceptable, state the recommendation briefly and ask only whether the user wants to override it.
- Stop when the remaining open points would not materially change the first implementation.

## Default Decisions

Assume these defaults unless the user overrides them:

- Provider-agnostic routing design.
- One live transport provider implemented first.
- Fastest route that arrives by a target time.
- Destination is the nearest viable station or Tube stop plus a final walking leg to the parkrun.
- Origin is the saved home coordinates, with departure station derived automatically.
- One selected home location at a time.
- Default arrival rule with an optional override.
- One best itinerary only.
- Train, Tube, and walking only.
- Strict no-viable-route outcome with the best available reason.
- Route action lives in the selected parkrun details surface.
- Minimum result fields: departure time, arrival time, total duration, total walking time, number of changes, final walking leg distance or duration, origin station, destination station.

## Recommended Interview Order

Ask only the unresolved items, in roughly this order:

1. Confirm the journey objective: arrive by a target time versus depart at a target time.
2. Confirm or override the default arrival rule.
3. Confirm the first live transport provider and any hard constraints on provider availability, API terms, or quota.
4. Confirm how to determine the destination stop when several nearby stations are viable.
5. Confirm whether any walking limit, accessibility rule, or mode exclusion changes the route search.
6. Confirm the no-viable-route behavior and what reason detail must be exposed.
7. Confirm where the route action appears in the selected parkrun details surface and whether it needs any gating or loading states beyond the default.
8. Confirm whether any additional result fields are required beyond the minimum set.

If one of these branches is already fixed by the user, skip it.

## Recommendation Style

- When a recommendation is stronger than the alternatives, say so directly.
- Explain the recommendation in one or two sentences.
- Then ask whether to keep the default or override it.

Example pattern:

"Recommendation: keep provider-agnostic routing with one live provider first. It keeps the first implementation smaller while avoiding a provider-shaped domain model. Do you want to keep that default, or do you already need a provider-specific design?"

## Completion Rule

End the interview as soon as the major implementation-shaping branches are settled. Do not continue into low-impact polish questions once the first build-ready version can be specified.

## Final Output Template

Use this exact structure for the final response.

```md
## Executive Summary

[2-4 sentences summarizing the agreed feature scope, the important constraints, and any explicit overrides from the defaults.]

## Implementation Brief

### Feature

- Build a train-and-Tube route-planning feature from the selected home location to a prospective parkrun.
- Show one best itinerary for arriving by a target time, unless overridden below.

### Confirmed Decisions

- Routing architecture: [provider-agnostic or overridden choice]
- First live provider: [provider name or constraint]
- Journey objective: [arrive by target time or overridden choice]
- Arrival rule: [default rule and any override]
- Origin model: saved home coordinates with auto-derived departure station [or override]
- Destination model: nearest viable station/Tube stop plus final walking leg [or override]
- Home selection scope: one selected home location at a time [or override]
- Supported modes: train, Tube, and walking only [or override]
- Result scope: one best itinerary only [or override]
- No-route behavior: strict no-viable-route outcome with best available reason [or override]
- Route action surface: selected parkrun details surface [or override]

### Required Result Fields

- Departure time
- Arrival time
- Total duration
- Total walking time
- Number of changes
- Final walking leg distance or duration
- Origin station
- Destination station
- [Any extra agreed fields]

### User Flow

1. User opens a selected parkrun details surface.
2. User triggers the route action.
3. System resolves the selected home coordinates and derives the departure station.
4. System resolves the nearest viable destination station or Tube stop and final walking leg.
5. System queries the live transport provider through a provider-agnostic routing boundary.
6. System returns either one best itinerary or a no-viable-route outcome with reason.

### Domain And Integration Notes

- Home location source: [agreed source]
- Parkrun destination source: [agreed source]
- Provider adapter boundary: [describe the interface at a high level]
- Station/stop selection rule: [agreed rule]
- Arrival/departure time handling: [agreed rule]
- Error and empty-state handling: [agreed rule]
- Observability or analytics needs: [only if agreed]

### Delivery Notes

- Prioritize foundational routing and data decisions before UI polish.
- Keep the first implementation extensible to additional providers without changing the feature contract.
- Exclude unsupported modes and multi-itinerary comparison from the first version unless explicitly required.

### Open Items

- [Only include if a material implementation decision remains unresolved. If none, write "None."]
```
