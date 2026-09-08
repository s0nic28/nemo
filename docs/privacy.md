# Privacy

NEMO v0.1 does not request camera or microphone permission.

The browser sends chat text to the local `/api/chat` endpoint when OpenRouter is configured. The OpenRouter credential is kept in the server environment and is not embedded in client code.

Future camera and microphone features should remain opt-in, visible, and disable-able.
