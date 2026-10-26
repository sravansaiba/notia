# Architecture

## A focused library

Notia's identity comes from its restrained ripple animation, consistent typography, and predictable behavior. The library focuses on notification behavior, with an interactive website demonstrating the public API.

## State outside React

A small immutable store lets browser utilities trigger notifications without hooks or context. React subscribes through useSyncExternalStore with cached snapshots and a stable empty server snapshot. The public API makes server mutations inert to avoid sharing notification state between requests. One mounted Toaster per app keeps queue, lifecycle, and screen reader announcements predictable.

## Timing as behavior

The store owns deadlines instead of individual React components. Independent pause reasons prevent a hover-end event from restarting a timer while focus remains inside the toast. Queued entries receive a full duration only when visible. Loading notifications persist, and promise resolution updates the existing ID. An exiting entry cannot be revived by an async settlement.

## Explicit duplicates

IDs identify notifications. Equal text is not evidence that two events are duplicates. Reusing an ID updates the existing entry, including queued entries. The queue is bounded to avoid unbounded state if a consumer generates many notifications before mounting the UI.

## Accessible by default

Visual cards and screen reader announcements use separate markup so close controls are not read as notification content. Errors use an assertive region; routine messages are polite. Notifications never steal focus, and Escape acts only inside a focused toast. Reduced motion disables entry, ripple, exit, and spinner animations. Custom content can supply a plain-text announcement.

## Small distribution

React and ReactDOM remain peers. There are no additional runtime dependencies, and consumers import precompiled CSS explicitly. Separate JavaScript and CSS gzip measurements avoid hiding CSS costs. The main entry ships ESM, CJS, and declarations with a preserved client directive for Next.js.

## Documentation as a real consumer

The documentation app imports the built library rather than aliases to source files. A second check installs the tarball into isolated consumers. The docs use plain CSS so the project does not need an extra styling tool merely to render its own examples.

## Interactive notifications

Actions run against a notification instance, so a late promise cannot mutate another notification that reused the same ID. Pending actions pause their clock and preserve keyboard focus through aria-disabled controls. Failures update the current notification and allow retry.

Progress reuses the loading lifecycle and the existing update API. A clamped visual value is exposed through a labeled progressbar; percentage changes do not modify the live message. Completion remains the application's decision.

Expandable stacks keep the store's ordering and limits. Hidden cards remain mounted with the hidden attribute and paused clocks; their controls cannot receive focus. Expanding through hover, focus, or a toggle pauses the group. Direction and translated labels belong to the Toaster; positions keep their physical meaning.

## Documentation examples

Feature guides use the same components as their contained live previews. The snippet generator derives JavaScript from those TypeScript components, and verification rejects stale generated code. Both languages are checked against the public API. Embedded examples configure one website Toaster through a small host adapter. Generated snippets replace that adapter import with the public Toaster. Cleanup restores default settings and dismisses example notifications. Website appearance is separate from playground notification settings.
