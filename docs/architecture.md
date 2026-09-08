# NEMO Architecture

## v0.1 boundary

NEMO separates fast local systems from remote reasoning.

### Local

- Rendering and procedural animation
- Cursor gaze
- Mood values
- Autonomous idle scheduler
- Speech synthesis
- UI state

### Remote

- `/api/chat`
- OpenRouter language reasoning

The separation prevents every animation or idle decision from becoming an API request.
