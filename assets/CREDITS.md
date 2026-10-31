# Asset and reference credits

## 3D models

All game meshes are original procedural models in `models.js`, built using the official Star Wars Databank references. No Lucasfilm photographs or third-party ship models are redistributed. Star Wars names, ships and designs are owned by their respective owners. This is an unofficial fan game.

- T-65 X-wing: https://www.starwars.com/databank/x-wing-starfighter
- BTL-A4 Y-wing: https://www.starwars.com/databank/y-wing-starfighter
- RZ-1 A-wing: https://www.starwars.com/databank/a-wing-fighter
- TIE fighter: https://www.starwars.com/databank/tie-fighter/
- TIE interceptor: https://www.starwars.com/databank/tie-interceptor
- TIE bomber: https://www.starwars.com/databank/tie-bomber
- The Khetanna: https://www.starwars.com/databank/the-khetanna-jabba-s-sail-barge

The ten-turret boss loadout preserves the original game's arcade mechanics; it is not a claim about the barge's film armament. Ship sizes are adapted for arcade readability.

## Terrain

Photographic PBR texture maps, downloaded unchanged at 1K from Poly Haven:

- Rock Face 03: photography Dario Barresi, processing Rico Cilliers. https://polyhaven.com/a/rock_face_03
- Sand 02: https://polyhaven.com/a/sand_02
- CC0: https://polyhaven.com/license

The connected canyon meshes, erosion, strata colors, terrain motion and dust are generated in `environment.js`.

## Music

Battlestar Galactica (1978), composed by Stu Phillips and Glen A. Larson. `bsg-theme.js` contains a sampled game arrangement. It is not the original soundtrack recording. The theme composition remains the property of its respective rights holders. Published score reference: Editions Marc Reift, Galactica medley, EMR 12175 (public score preview). https://files.reift.ch/files/scores/EMR12175.pdf

Instrument samples: FluidR3 GM, Frank Wen and contributors; pre-rendered by Benjamin Gleitzman / MIDI.js Soundfonts. https://github.com/gleitz/midi-js-soundfonts

Sample distribution license: Creative Commons Attribution 3.0, as documented by the source repository. https://creativecommons.org/licenses/by/3.0/us/

Twenty unmodified MP3 samples are bundled for strings, French horn, trumpet, trombone, contrabass, timpani and orchestral harp. Game playback transposes, envelopes, pans and reverberates these samples. Percussion noise and laser/explosion effects are synthesized in `audio.js`.

The Rebel laser is an original spring-like metallic recreation shaped toward the X-wing's sound; no film or game sound-effect recordings are included.

## Runtime and typography

Three.js 0.170.0: MIT license in `vendor/LICENSE`.
Barlow / Barlow Condensed: SIL Open Font License in `assets/OFL.txt`, copied from the original Starfighter project.

## Hyperspace and destruction effects

The shader-based hyperspace tunnel, starlines, curved planet, explosions, shockwaves, smoke and hull debris are original real-time effects. Visual direction for the sequence of starlines followed by a blue simu-tunnel: https://www.starwars.com/news/star-wars-inside-intel-hyperspace

## Revision 5 generated artwork

A built-in image-generation tool produced the material atlas at `assets/materials/ship-surfaces-v1.png` and transparent explosion animation at `assets/vfx/explosion-atlas-v1.png`. Exact prompts and dimensions are recorded in `assets/ART-PROMPTS.md`. These are original generated game assets, not film imagery. No original images were overwritten.

The interceptor's inward panel bend, notched silhouette and wingtip cannon locations were reviewed against the official Databank photograph linked above. Hyperspace was rebuilt as an original volumetric cloud shader; no film footage is bundled.

### Death Star Trench Run

The trench and TIE Advanced x1 are original procedural geometry created for this game. Vader’s ship silhouette reference: [StarWars.com — Darth Vader’s TIE Fighter](https://www.starwars.com/databank/darth-vader-s-tie-fighter). The enlarged sixteen-turret loadout is an arcade adaptation requested for this boss. Trench plating reuses the existing generated Imperial material atlas.

Trench turret silhouette and barrel proportions were referenced against Propstore’s original [A New Hope Death Star Turbolaser Tower filming miniature](https://propstore.com/product/star-wars-a-new-hope-1977/lot-382-death-star-turbolaser-tower-model-miniature/). Procedural geometry and material work are original; reference photos are not bundled. The Death Star defense types are described in [Lucasfilm’s Inside Intel](https://www.starwars.com/news/star-wars-inside-intel-the-death-star). TIE engine howls and player hit impacts are newly synthesized locally.

### Trench architecture references

The redesigned trench uses original procedural geometry informed by the archival miniature photographs shown with [Hake’s original A New Hope trench-run surface panel](https://www.hakes.com/Auction/ItemDetail/274090/STAR-WARS-EPISODE-IV-A-NEW-HOPE-DEATH-STAR-TRENCH-RUN-SURFACE-PANEL-SECTION-ORIGINAL-MOVIE-PROP). Reference photographs are not included as game textures. Existing generated Imperial surface art supplies subtle weathering and bump detail; large-scale plates, recesses, pipes, louvers and buttresses are actual instanced meshes. Six route regions are an original gameplay arrangement, rather than a claim to reconstruct the exact filming model layout.
