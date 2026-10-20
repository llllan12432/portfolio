# Akatsuki implementation review

Reviewed 16 October 2026. Original coursework provenance: the final April 2026 submission. The assessed Java Project result was 82%; later changes were not part of that assessment.

## Evidence

Three levels and distinct boss encounters exist in the source. The original recording shows exploration, dialogue and all three encounters. The public clip is a 48-second muted excerpt, predating these maintenance changes. Gameplay design, progression, testing and tuning are described in the original AI declaration; substantial implementation was AI-assisted.

## Fixes in the reviewed copy

- Empty, truncated, malformed or out-of-range saves now fail safely instead of causing parsing/index errors. Non-finite coordinates are rejected; invalid files do not enable Load Game.
- Save points persist the current combat-won state and can update it on re-entry; load restores it.
- Level-owned combat timers pause with the game, retain their remaining initial delay and are disposed on level exit/death. Queued callbacks from a disposed level cannot restart it.
- The camera listener uses the managed lifecycle. Forced-ending state is set before invoking the death handler. Initial Swing window creation runs on the EDT.

## Verification

All Java sources compile with JDK 25 and CityEngine.jar. The dependency-free regression runner passes 23 save-data and timer-lifecycle checks. Run `./test.sh` with a JDK; it uses a temporary directory, not a real save file.

The maintained GUI could not be launched in the current execution environment, so there is no claim of a full playthrough of the changed build. Particle/UI timing and all death/ending transitions still warrant manual regression testing. Compilation and headless checks do not prove every game path correct.

## Source and media boundary

The downloadable source archive excludes the course engine, third-party images and audio, IDE files, generated classes and personal save data. The private local copy retains its existing media for normal development. See `ASSET_REQUIREMENTS.txt` for expected filenames and the original `Use_of_AI.txt` for contribution disclosure. No third-party character or asset rights are claimed.
