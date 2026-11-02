# Falcon and reactor visual reference

Reference era: Return of the Jedi (1983). Models are original game approximations, not licensed film meshes or exact film-scale reconstructions.

Falcon: weathered double-saucer silhouette, open front mandibles, starboard cockpit corridor, circular dish, dorsal/ventral quad guns, rear cooling fans and blue rear engine arc. Original texture is generated deterministically from UV panel lines, replaced panels, scratches and soot.

Reactor: opposing tapered polar towers and power-regulator collars around a compact central assembly. Fight takes place in a stationary enclosed cavity with distant structural ribs. Twenty defensive turrets and sustained TIE waves are gameplay adaptations; not asserted to reproduce the film.

Sources:
- https://www.starwars.com/databank/millennium-falcon
- https://www.starwars.com/news/ships-of-the-galaxy-the-millennium-falcon
- https://www.starwars.com/databank/death-star-ii
- https://scifi.stackexchange.com/questions/268491/when-lando-refers-to-the-north-tower-in-return-of-the-jedi-how-can-one-deter (secondary reference reproducing Complete Locations reactor diagram/context)

Validation: syntax checks on changed modules; 8 mobile tests pass; reactor fixed-pose assertion passes. Full mechanics tests and visual/browser QA remain pending: the connector could not transfer the vendored 1.3 MB Three.js module to this workspace. Do not treat this as visually approved or deploy it without previewing.

November 2026 correction: fixed the reversed forward mandibles, narrowed outer tip width from 4.9 at the roots to 2.8 at the nose, tapered vertical thickness, opened the central notch, and aligned the circular dish concave face/feed toward -Z (slightly raised). Blue engine illumination and thrust occupy only the rear +Z arc. Film references above guide the silhouette; no 100% film accuracy claim is made.
