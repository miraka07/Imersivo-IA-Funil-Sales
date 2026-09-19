# Mobile performance audit

## Before

Baseline supplied from Lighthouse Mobile (Moto G Power, slow 4G):

- Performance: 33
- FCP: 4.8 s
- LCP: 5.9 s
- TBT: 20,900 ms
- CLS: 0
- Speed Index: 7.3 s

## Main problems found

1. The Framer main runtime and module graph were eligible during the initial mobile load.
2. The page contained seven videos and their sources were available before the user reached those sections.
3. The captured Framer reveal state delayed the first mobile content while the runtime initialized.
4. The captured editor/event bootstrap was unnecessary for the production landing page.

## Changes implemented

1. The first mobile viewport is made visible immediately; lower reveal animations remain available after the runtime loads.
2. The Framer main bundle is deferred on mobile until the first interaction or a 15-second safety timeout.
3. The CODEBEN copy/video hydration script follows the same mobile interaction gate; desktop keeps the existing eager behavior.
4. Module preloads and the captured editor/event bootstrap are removed from the production HTML.
5. Videos below the first viewport use `preload="none"` and receive their source only near the viewport through `IntersectionObserver`.
6. The runtime is deferred, while local resource paths and the production build remain unchanged.

## Controlled after trace

The production `dist/` output was served over HTTP and tested at 390×844 with 4× CPU throttling and a slow cellular profile. This is an engineering trace, not a Lighthouse score:

- FCP: 2.26 s
- LCP: 4.14 s
- Long tasks observed in the trace: 0
- Initial video transfers: 0
- Horizontal overflow: none
- Console errors: none

After a scroll interaction, the deferred runtime and CODEBEN script load and the video sources are attached progressively.

## Validation note

The Lighthouse CLI could not finish its run in this Windows environment because Chrome Launcher failed to remove its temporary profile with `EPERM`. The supplied baseline is retained above; no post-change Lighthouse score is claimed without a successful Lighthouse run.
