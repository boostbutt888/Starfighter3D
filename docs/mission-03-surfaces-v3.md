# Mission 03 surfaces and landing revision

Escape speeds relative to the previous 36-unit/s escape: Rookie 54 (+50%), Pilot 72 (+100%), Ace 90 (+150%). All use the same 1296-unit route. Entry speed remains 36.

The Death Star sheds curved, textured armour sections with varied orange/red/blue/violet/white bursts. Yavin uses a real 3D foreground temple, apron and landing pad with stone seams, buttresses, doorway depth, gear, and a panning camera while descending. The photoreal environment backdrop remains behind the 3D scene.

Generated asset: assets/materials/yavin-surfaces-v3.jpg. Built-in imagegen prompt: a square four-quadrant neutral photoreal material atlas of mossy temple limestone, weathered concrete apron, worn steel landing plates with yellow paint fragments, and tropical soil. No text, perspective or baked dramatic lighting. Albedo also supplies subtle surface bump.

Tunnel walls/obstacles reuse assets/materials/death-star-hull-v2.jpg with world-scale triplanar mapping and subtle bump. Raised panels, seams, bolts and outlined obstacle reinforcement add geometric detail. Pooled instances keep added draw calls bounded.

Validation: difficulty/route invariants, landing descent/camera pan, obstacle clearances and streaming checks. Full rendering and real-device visual review remain necessary because the cloud browser has WebGL disabled.
