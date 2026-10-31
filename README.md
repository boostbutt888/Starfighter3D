# Starfighter 3D — Rebel Command

A playable 3D reimagining of Starfighter · Rebel Command. The original Rust project is unchanged.

## Play

GitHub Pages target: https://boostbutt888.github.io/Starfighter3D/ — once published, this HTTPS link works without a local server or shared Wi-Fi. Use a modern WebGL browser; phones use landscape controls.

Double-click `Play.command` on macOS, or run `python3 -m http.server 8080 --bind 127.0.0.1` in this folder and open http://localhost:8080. Everything is bundled locally; no build or internet connection is required. A WebGL-capable browser is required.

WASD/arrows steer, Space/Z fires, C changes weapons, B/X drops a bomb, Shift enables precision steering, P/Escape pauses and M toggles effects. Drag on touch screens to steer with automatic fire. Sound starts after Launch or an audio-control click. Music output is boosted by a further 50 percent at the bus while retaining saved slider settings and the existing effects level. Music and effects have independent toggles; pause to adjust orchestral volume. Backgrounding the game pauses it.

Open `hangar.html` (Ship Archive from the menu) to rotate and zoom all eight models.

## Level 01

Fly a 67-second canyon approach through Imperial patrols, then defeat Jabba's Khetanna. All ten independent turret emplacements must be destroyed before the command deck can take damage. A bomb removing the final turret cannot damage the command deck in the same blast.

- X-wing: four wingtip cannons, open S-foils, four engines and astromech; balanced handling, 7 bombs.
- Y-wing: twin open-frame engine nacelles, exposed machinery and gold cockpit markings; slower and heavily armored, 10 bombs.
- A-wing: arrowhead fuselage, twin engines, tall fins and side cannons; fastest handling, 5 bombs.
- TIE fighters: hexagonal solar panels, standard patrol formations.
- TIE interceptors: four dagger wings and wingtip cannons, faster weaving passes.
- TIE bombers: double hulls and bent solar panels, heavier armor and multi-shot attacks.
- Khetanna: tapered copper hull, slatted windows, railing, deck, rigging and two curved cloth sails. Its ten guns are an arcade adaptation. The updated hull has hard chines and horizontal plated cladding.

Ship hulls now use a generated weathered surface atlas, with distinct Rebel paint, Imperial gunmetal, tarnished copper cladding and woven sail cloth. The TIE interceptor has inward-bent dagger arrays, a deep central notch and four wingtip cannons; the standard TIE has flat-topped hexagonal panels. TIE maneuvers now include break turns, vertical weaving and interceptor rolls. Agility is explicitly interceptor > fighter > bomber.

A small red corner bracket marks an acquired target, with a lead dot predicting where the shot will meet it. A limited forward aiming cone assists convergence; it does not acquire targets across the screen. Shielded command cores use a blue marker.

Rebel bolts are red and TIE bolts green, with luminous cores and colored halos. The canyon uses continuously connected eroded walls, photographic rock/sand surface and normal maps, strata coloring, moving dust and shadows.

## Ground defenses and changing scenery

The approach now streams unique route sections instead of recycling the same short canyon. It moves through Red Rock Narrows, Dune Sea Basin, Stone Arch Pass, The Needles, and the Khetanna Badlands. Width, cliff height, erosion, rock colors and landmarks change along the route; arches and rock formations occur at specific locations.

Imperial ground laser batteries scroll with the landscape, aim twin green lasers at the player and can be destroyed with lasers or bombs. For floor guns, fly below altitude 15 and line up horizontally to acquire a ground lock. For wall guns, match their height and move toward their side of the trench. Your cannons automatically aim downward and lead the scrolling target. A destroyed gun ejects its barrels, becomes a charred wreck, emits smoke, stops firing and awards points.

## Boss destruction and escape

Each Khetanna turret has a visible destruction effect: ejected barrels, sparks, a fireball and a smoking gun mount. The bridge remains protected until all ten guns are gone. The exposed command core now has 600 armor, five times its former 120. Its shield alternates between 4.2 seconds open and 2 seconds closed. Fast 67-unit/second bolt volleys and paired beam attacks require dodging. Beams mark their paths for 0.8 seconds before firing for 0.7 seconds, then expire.

Destroying the command deck begins an approximately 19-second cinematic: localized explosions propagate through the barge, the main blast throws hull fragments and debris outward, a subtle ground-level shockwave expands, and the camera shakes. Fire and smoke use interpolated animation frames from a generated transparent atlas, while actual hull surfaces and torn sails break into physical 3D fragments. Enemy aircraft also eject wings, cockpit parts and smoking debris during larger explosions. The fighter then climbs out of the canyon, passes the planet's atmospheric horizon into a starfield, turns to face clear space away from the planet, accelerates through white-blue starlines and enters a volumetric blue-white cloud flow. Hyperspace is now rendered without the earlier cylinder, jagged rings or circular end cap. The result screen appears only after the jump and reads **LEVEL 01 PASSED**. Pause and backgrounding also pause the cinematic; returning to the hangar resets it for the next sortie.

## Compact magnetic pickups

- Amber **P**: upgrade spread (six levels) and equip it.
- Green **L**: upgrade direct lasers (four levels) and equip them.
- Blue **FC**: restore 35 Force, capped at 150.

Icons have no text boards. Supplies latch onto nearby craft within a range reduced by 30 percent on each axis from the previous revision, accelerate toward them and are consumed once on contact, including when a resource is full. This avoids the previous capture/release flicker. Each weapon retains its own upgrade level. Force reduces incoming laser damage.

## Audio

The music is a locally sampled orchestral game arrangement of the 1978 Battlestar Galactica theme by Stu Phillips and Glen A. Larson. It builds during the final approach and restarts the brass statement with a faster, louder boss arrangement. Twenty instrument recordings cover strings, horns, trumpet, trombone, contrabass, timpani and harp. It is not the original soundtrack recording.

The Rebel laser is a synthesized X-wing-style recreation, with a metallic spring transient, pitch drop and short reflection. Film sound-effect recordings are not bundled. See `assets/CREDITS.md` for references and licenses.

## Verification

`node --test tests/mechanics.test.js` checks pickup attraction, one-time collection even at capacity, independent weapon upgrades, swept laser collision, bomb/command-deck ordering, ship geometry, turret and sail counts, theme timing, ground interception, nonrepeating scenic regions, turret effects, the complete cinematic/reset sequence, all difficulty pressure/reaction settings, three-axis boss motion, Vader’s sixteen gun mounts, and Death Star departure/reset. `tests/mission.html` provides isolated integration controls for ground batteries, turret destruction and cinematic phases. These controls are absent from the normal game. `tests/audio.html` exercises production sample loading and the approach-to-boss music transition in a browser.

Two missions are independently selectable from the hangar; there is no campaign progression yet.

New image assets and the exact generation prompts are documented in `assets/ART-PROMPTS.md`.

## Missions and difficulty

Choose **Tatooine Run** or **Death Star Trench Run**, then **Rookie**, **Pilot**, or **Ace** before launch. Your choices are remembered locally. In the hangar, Q/E switches missions and 1/2/3 selects difficulty.

Rookie reduces incoming damage, armor, patrol pressure and projectile speed, with longer beam warnings and core openings. Pilot is the standard fight. Ace increases damage, armor, fire rate, flight speed, boss movement and patrol density, with shorter warnings and core openings. Score multipliers are 0.75×, 1× and 1.5× respectively.

The Tatooine Khetanna is 40% larger in every dimension. It strafes, rises, retreats and banks while all surviving guns track the player, with additional nose volleys. The exposed core continues firing fans and paired beams. Aim assistance predicts the boss’s future position and rotation.

Death Star Trench Run has a 75-second approach through armored walls, surface panels, pipes and destructible floor and wall batteries. It retains all three Rebel craft, enemy TIE variants, powerups and weapon mechanics. Its boss is a five-times enlarged TIE Advanced x1 with sixteen individual wing and hull guns, rolling and turning through a three-dimensional flight pattern. The shielded core has 780 armor on Pilot; difficulty scales this. After its destruction the fighter climbs clear of the Death Star and enters hyperspace before **LEVEL 02 PASSED** appears.

## Hit feedback, TIE flybys and trench guns

All missions now use 18 hull damage for a Force-shielded laser hit, 30 unshielded, and 40 for a beam or collision before difficulty scaling. Hit protection lasts 0.65 seconds on Rookie, 0.48 on Pilot and 0.36 on Ace. The player hit radius is 1.7 units. Hits trigger a dedicated metallic thud, a 0.46-second damped ship wobble, light camera shake and a brief red edge flash. The ship remains visible during the grace period.

TIE fighter, interceptor and bomber engines now have a synthesized ion-engine howl. Distance controls volume and filtering, lateral position controls stereo panning, and passing the player lowers pitch. Up to six nearest ships have continuous voices; destroying ships, pausing or leaving gameplay fades and releases them. This is an original synthesized recreation, not a film audio sample.

Trench batteries deploy in staggered pairs every 3.6 seconds on Pilot (previously one per 6.2 seconds), scaling with difficulty. Half mount on the left and right walls; the rest use tapered floor towers. Film-miniature-inspired square sloping housings, twin stepped barrels, panel seams, cooling vents and rotating gun heads replace the earlier generic ground battery in the trench. Both forms remain targetable and destructible, with ejected barrel assemblies and smoking wrecks.

## Death Star trench architecture revision

The trench now follows the gray, densely layered practical-miniature design of A New Hope. The route progresses through Outer Defense Cut, Heat-Sink Galleries, Service Wells, Buttress Corridor, Thermal Conduits, and Vader Intercept. Each 160-unit section has deterministic but unique bays on each side, with different plate widths, heights, relief and machinery types. It does not reuse a seven-section layout after recycling.

Wall architecture includes sloped buttresses, framed recessed equipment wells, cooling louvers, round conduit banks, layered access skins and clustered machinery. Uneven upper decks and towers break up the skyline. Floor panel islands have unequal sizes, inset channels and low mechanical relief. The previous regular red light strips, lane markings and recurring overhead gantry are removed; only sparse small indicator lights remain. Neutral light and gray materials replace the blue tunnel palette. Geometry is batched by shape and material to keep the additional detail efficient. The center flight corridor remains clear, with floor and wall guns retaining their normal positions and targeting.

## Phone landscape play and scenery contact

On the same Wi-Fi, run `Play on Phone.command` on the Mac and open the printed address on the phone. The phone server uses port 8081 and serves this project folder. Turn the phone sideways. The left thumbstick steers; automatic fire starts enabled, with separate Auto Fire, Fire, Weapon and Bomb controls on the right. The FULL SCREEN button requests full screen where supported and gives Home Screen web-app instructions on iPhone. Rotating upright or leaving the page pauses flight; upright mode shows a rotation prompt. The layout respects screen notches and smaller landscape viewports. Touch devices use a lower pixel ratio and smaller shadow maps.

Touching canyon walls, trench armor/relief, or turret bodies now deals 5 hull damage before difficulty scaling, at most once per 0.8 seconds of continuous contact. Wing clearance differs by craft. Contact produces a short ship wobble, impact sound, sparks and light camera shake; sustained scraping keeps the wobble active. Scenery contact does not grant a new grace period against enemy lasers. Trench walls push the craft back into the channel. Destroyed gun bodies remain physical wrecks. The camera follows wider lateral movement so walls are reachable. The minimum altitude now permits close passes around the low Tatooine batteries.

`tests/phone.html` previews the production game at 844×390, 667×375 and 390×844 without changing the normal game UI. Regression checks cover collision bounds, canyon geometry, light scrape damage and normalized thumbstick movement.

## GitHub Pages deployment

The repository’s Pages source must be **GitHub Actions**. Every push to `main` runs the gameplay tests, packages only runtime files into `dist`, and deploys through the `github-pages` environment. `npm run build` creates the same artifact locally. All JavaScript, textures, fonts, audio and links use relative paths so the site works under `/Starfighter3D/`. Local launchers, QA fixtures and screenshots are not in the deployed artifact. Audio starts after the user launches the mission; full-screen and orientation locking depend on browser support.

## iPhone Safari fixes

Audio resumes directly from the Launch/Enable Audio gesture before any full-screen request. On supported Safari versions the audio session uses `playback` so media audio is not tied to the phone’s ringer setting. **ENABLE AUDIO** is available in the header and pause panel to recover after Safari interrupts the audio session. Instrument decoding is limited to three simultaneous loads.

Touch weapon and bomb actions fire on pointer-down with duplicate-click suppression. The selected weapon appears on its button immediately. Steering and held fire use independent pointer lifetimes.

Phones render at up to 60 fps with a lower pixel ratio, cheaper antialiasing/shadows, and less frequent HUD text updates. Explosions reuse two permanent lights so kills do not change shader light counts. The next canyon/trench section is prepared in idle time before the recycling boundary.

**FULL SCREEN** requests native full screen where supported. Safari on iPhone may not support full screen for arbitrary game elements; the button then explains Safari → Share → Add to Home Screen → Open as Web App. The manifest and Apple web-app metadata support launching without browser bars from the Home Screen. This does not install an offline cache; loading the game still needs a connection. See [Apple’s Home Screen web-app guide](https://support.apple.com/guide/iphone/iphea86e5236/ios) and [WebKit’s audio-session issue](https://bugs.webkit.org/show_bug.cgi?id=237322).
