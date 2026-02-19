# Building a UE 5.7 + GPT Realtime API + Audio-to-Face Demo

## Executive summary

A practical minimal demo can be built as a single Unreal Engine client (mic capture → Realtime API → receive assistant audio/text) plus a tiny backend “token mint” service (to avoid shipping an API key). The assistant’s returned audio is then used for both playback and speech-driven facial animation (audio-to-face), ideally on a MetaHuman. citeturn2search6turn9view1turn0search1turn7view0

Two implementation constraints dominate the design:

1) **Audio format & streaming**: for `pcm16`, the Realtime API expects **16‑bit PCM, 24 kHz, mono, little-endian** and returns audio at **24 kHz**; audio is streamed via `input_audio_buffer.append` events (base64), with a **15 MB per chunk** limit. citeturn7view1turn2search7turn24view2turn29view1  
2) **Real-time facial animation options**: entity["company","Epic Games","fortnite maker"]’s MetaHuman toolchain supports **realtime animation from an audio source** using Live Link (including a dedicated **MetaHuman Audio Live Link source**) and also supports offline “Audio Driven Animation” processing. citeturn3view0turn3view1turn4view1turn5view0

A recommended “get-to-wow-fast” path is:

- **UE client uses WebSockets** to stream mic audio into the Realtime API and receive **assistant audio deltas** + **transcript deltas**. citeturn10search0turn24view0turn29view1  
- **Assistant audio playback** uses a procedural sound buffer in UE (`USoundWaveProcedural::QueueAudio`). citeturn1search1  
- **Audio-to-face** is driven by either:
  - **MetaHuman Audio Live Link** (fastest “official” path; best for a demo), citeturn5view0turn4view1turn6view0  
  - or a middleware solution (e.g., NVIDIA ACE Audio2Face, Speech Graphics, FaceFX) when you need programmatic control, cross-platform consistency, or a more “productizable” runtime pipeline. citeturn18search0turn17search1turn23view0

## Minimal demo architecture

The following is a minimal but robust architecture that keeps the UE code focused on: audio I/O, websocket messaging, and animation playback, while keeping secrets off the client (via ephemeral tokens). citeturn9view1turn0search1turn7view0

```mermaid
flowchart LR
  subgraph UE[Unreal Engine 5.7 App]
    MIC[Mic capture\nFAudioCapture] --> RESAMPLE[Resample + PCM16 encode\n(24kHz mono LE)]
    RESAMPLE --> WSOUT[WebSocket client\nwss://.../v1/realtime]
    WSIN[Realtime events\n(JSON)] --> PARSE[Parse event types]
    PARSE --> PLAY[Audio playback\nUSoundWaveProcedural]
    PARSE --> TXT[On-screen captions\n(optional)]
    PARSE --> A2F[Audio-to-face driver\n(one of options)]
    A2F --> MH[MetaHuman face rig\n(Live Link / AnimBP / Control Rig)]
  end

  subgraph SVC[Your Backend (small)]
    KEY[Server API key\n(never in UE client)] --> MINT[POST /v1/realtime/client_secrets]
    MINT --> TOKEN[Ephemeral key\n~1 minute TTL]
  end

  UE <-- "GET /token" --> SVC
  WSOUT <-- "Realtime API (model)" --> OAI[OpenAI Realtime API]
```

Key dataflow notes:

- Realtime audio input is streamed with `input_audio_buffer.append`; in **server VAD** mode, the server can auto-commit and auto-trigger responses, while in “push-to-talk” mode you commit (`input_audio_buffer.commit`) and then explicitly trigger inference (`response.create`). citeturn24view0turn24view2turn24view3  
- Audio output arrives as **base64 deltas** via `response.output_audio.delta`, with a terminal `response.output_audio.done`; transcript deltas may arrive via `response.output_audio_transcript.delta`. citeturn29view0turn29view1

## OpenAI Realtime API integration patterns

### Transport choice: WebSocket vs WebRTC vs official SDK approach

OpenAI documents both **WebSocket** and **WebRTC** connection modes. WebSocket is emphasized for **server-to-server** usage; WebRTC is recommended for **browser and mobile** clients and handles media more natively (audio track in/out). citeturn10search0turn7view0turn9view3

| Choice | Best fit | Pros | Cons | Practical note for UE |
|---|---|---|---|---|
| WebSocket (direct) | Desktop/editor prototypes; custom clients | Straightforward JSON event loop; easiest to implement in C++ (UE has WebSockets module) citeturn1search0turn7view0 | You must manually encode, chunk, send, and replay audio; secret management is on you citeturn2search7turn7view1 | Recommended for a UE-only prototype where you control the environment |
| WebRTC (direct) | Web/mobile clients; media-first apps | WebRTC handles audio I/O; events over data channel; less low-level audio buffer handling citeturn9view3turn8view0 | Integrating WebRTC into UE for a custom peer flow is more involved than WebSocket | Consider only if you already use UE WebRTC stack (e.g., Pixel Streaming) and can extend it |
| Official SDK (sidecar) | Fastest iteration outside UE | entity["company","GitHub","code hosting platform"]-hosted official SDKs show Realtime support for JS/TS and Python; can reduce protocol work citeturn25view0turn26view0 | UE is C++; you’d run a Node/Python sidecar or backend and bridge to UE | Great for “demo today”: sidecar manages Realtime; UE connects locally (UDP/TCP/WebSocket) |

### Authentication and token refresh

**Do not ship** a long-lived API key inside a packaged Unreal client. The Realtime docs describe creating **ephemeral keys** via a server-side call; the session creation response includes a `client_secret`, with keys having a **default TTL of ~1 minute**. citeturn0search1turn9view1turn7view1turn10search11

- Current guidance emphasizes generating ephemeral keys via **POST `/v1/realtime/client_secrets`** (GA path), rather than older beta endpoints. citeturn0search5turn9view0  
- A legacy/older create-session endpoint exists, but is documented as **deprecated**. citeturn0search12

Token refresh patterns you can use in practice:

- **Prototype mode**: connect using a server-side key from UE only during internal development (fastest, least safe). WebSocket examples show an Authorization header with a bearer key. citeturn7view0  
- **Demo mode (recommended)**: UE calls your `/token` endpoint, your backend mints an ephemeral key, UE connects, and you reconnect when the ephemeral key expires (or pre-emptively reconnect between turns). The TTL is short enough that you should treat reconnection as normal lifecycle. citeturn0search1turn7view1turn9view1  
- **Productizable mode**: run a backend proxy that maintains the Realtime connection and streams sanitized events to UE; this avoids frequent client reconnects and centralizes policy (rate limits, logging, abuse controls). This aligns with the docs’ framing of WebSocket being a strong fit for server-to-server. citeturn10search0turn7view0

### Audio formats, sample rates, and buffering rules

The Realtime session supports configuring input/output audio formats:

- `pcm16` (requires **24 kHz, mono, 16-bit PCM, little-endian**) citeturn7view1turn0search0  
- `g711_ulaw` / `g711_alaw` (useful for telephony-style pipelines) citeturn0search0turn7view1

Streaming audio input is done by appending base64 audio bytes in **`input_audio_buffer.append`**, with each chunk capped at **15 MB**. Documentation notes that **smaller chunks can improve VAD responsiveness**. citeturn2search7turn2search11

Turn-taking:

- With **server VAD**, the server can detect speech start/stop and commit automatically. citeturn24view2turn7view1  
- With push-to-talk, you typically `input_audio_buffer.clear` at start, append during capture, then `input_audio_buffer.commit` and `response.create`. citeturn24view0turn24view2turn24view3

The API reference provides configurable VAD parameters such as `silence_duration_ms` (default 500ms) and `prefix_padding_ms` (default 300ms). citeturn7view1

### Speech-to-text vs “direct audio” usage in Realtime

The Realtime model consumes audio directly. If you enable input audio transcription, the docs caution that transcription is **asynchronous** and should be treated as guidance (it uses the transcription endpoint rather than being “native” to what the model heard). citeturn7view1turn2search19

Practical implication for UE demos:

- Use transcription events for **UI captions** and debugging.
- Use the raw audio stream for **animation sync**, because your facial animation should align to the sound actually played. citeturn29view1turn3view1

### Rate limits and backoff

OpenAI provides a general rate limits guide, and the Realtime API can emit a `rate_limits.updated`-type event at the beginning of a response to report updated remaining capacity. citeturn2search2turn2search3turn7view1

For retry/backoff strategy, OpenAI cookbook guidance recommends handling rate limit errors explicitly (commonly via exponential backoff). citeturn2search9turn2search2

## UE-side implementation details and minimal code sketches

### Key components and versions for a UE 5.7 demo

A developer-focused UE 5.7 setup (Windows-centric) can be summarized as follows. citeturn16search8turn13search7turn13search22turn13search13

| Component | Recommended baseline | Why it matters | Source |
|---|---|---|---|
| UE project | Unreal Engine **5.7** | Target engine version (your requirement) | citeturn0search2turn0search6 |
| C++ toolchain | Visual Studio 2022 **17.14 recommended** (17.8+) + MSVC/Windows SDK/.NET as listed by Epic | Required for building C++ modules/plugins and consistent packaging | citeturn16search8turn13search15 |
| UE modules | `WebSockets`, `AudioCaptureCore` / `AudioCapture`, `Json` | WebSocket transport + mic capture + JSON messaging | citeturn1search0turn11view0turn30search0 |
| MetaHuman realtime audio solve | MetaHuman Live Link + MetaHuman Animator toolchain | Built-in “audio source → realtime facial animation” pipeline | citeturn4view1turn5view0turn3view0 |
| OS note | Windows is the safest default when using current MetaHuman Animator workflows | MetaHuman Creator plugin is broader-platform; MetaHuman Animator support for Linux/macOS is described as planned for future releases | citeturn13search13turn1search11 |

### Capturing microphone audio in UE (C++)

For raw mic capture, UE exposes `FAudioCapture` and an audio callback type:

- `FAudioCapture::OpenAudioCaptureStream(...)` takes an `FOnAudioCaptureFunction` callback. citeturn11view0turn30search0

A minimal sketch (pseudocode-level) is:

```cpp
// Build.cs: PublicDependencyModuleNames += { "AudioCaptureCore", "WebSockets", "Json", "JsonUtilities" };

#include "AudioCaptureCore.h"

FAudioCapture Capture;
FAudioCaptureDeviceParams Params;        // choose device index or defaults
uint32 NumFramesDesired = 480;           // example chunking enum (frames)

bool bOk = Capture.OpenAudioCaptureStream(
    Params,
    [this](const void* InAudio,
           int32 NumFrames,
           int32 NumChannels,
           int32 SampleRate,
           double StreamTime,
           bool bOverflow)
    {
        // 1) Convert/copy: treat InAudio as float PCM (validate in your build)
        const float* Samples = static_cast<const float*>(InAudio);

        // 2) Downmix to mono if needed, resample to 24000 Hz if SampleRate != 24000
        // 3) Convert float [-1,1] to int16 PCM little-endian
        // 4) Base64 encode bytes and enqueue for websocket send
    },
    NumFramesDesired
);

if (bOk) { Capture.StartStream(); }
```

What matters architecturally is:

- you can query the **capture stream’s sample rate** and resample if needed, because the Realtime API’s `pcm16` format requires 24 kHz mono. citeturn11view0turn7view1  
- small chunks (e.g., 10–40 ms audio per `append`) are commonly used because they improve responsiveness, and the API explicitly notes that smaller chunks can help VAD responsiveness. citeturn2search11turn7view1

### Streaming mic audio to the Realtime API (UE WebSocket client)

UE exposes a WebSockets module (`FWebSocketsModule`) to create WebSocket clients. citeturn1search0turn1search16

OpenAI’s WebSocket guide shows connecting to:

- `wss://api.openai.com/v1/realtime?model=gpt-realtime` with an Authorization header. citeturn7view0turn25view0

A UE-friendly pseudocode outline:

```cpp
#include "WebSocketsModule.h"
#include "IWebSocket.h"

TSharedPtr<IWebSocket> Socket;

void Connect()
{
    FString Url = TEXT("wss://api.openai.com/v1/realtime?model=gpt-realtime");

    // NOTE: UE WebSocket API varies by engine; represent headers in supported way.
    Socket = FWebSocketsModule::Get().CreateWebSocket(Url, TEXT(""));

    Socket->OnConnected().AddLambda([this]()
    {
        // Send session.update with audio formats, VAD, transcription, etc.
        SendJson({
          {"type","session.update"},
          {"session",{
             {"type","realtime"},
             {"input_audio_format","pcm16"},
             {"output_audio_format","pcm16"},
             {"modalities",{"text","audio"}},
             {"turn_detection", {{"type","server_vad"}}}
          }}
        });
    });

    Socket->OnMessage().AddLambda([this](const FString& Msg)
    {
        // Parse JSON. Branch on "type":
        // - "response.output_audio.delta" -> decode base64, QueueAudio
        // - "response.output_text.delta"  -> display subtitles
        // - "response.done"              -> end-of-turn
    });

    Socket->Connect();
}
```

The important event types you will handle come directly from the Realtime API reference:

- Client sends: `session.update`, `input_audio_buffer.append`, optionally `input_audio_buffer.commit`, and `response.create`. citeturn27view0turn24view2turn24view3turn2search7  
- Server sends: `session.created`, `session.updated`, `response.output_audio.delta`, `response.output_audio.done`, `response.output_text.delta`, `response.output_text.done`, `response.done`. citeturn27view0turn29view1turn28view2turn24view3

### Playing assistant audio in UE while preserving lip-sync timing

`USoundWaveProcedural` supports queueing PCM audio via `QueueAudio(...)`, which is commonly used to play streaming audio. citeturn1search1

A minimal “audio sink” concept:

```cpp
#include "Sound/SoundWaveProcedural.h"

USoundWaveProcedural* StreamingWave = /* CreateObject, configure sample rate/channels */;
UAudioComponent* AudioComp = /* Create + attach */;
AudioComp->SetSound(StreamingWave);
AudioComp->Play();

void OnAudioDelta(const TArray<uint8>& Pcm24kMono16)
{
    StreamingWave->QueueAudio(Pcm24kMono16.GetData(), Pcm24kMono16.Num());
}
```

Audio deltas arrive as base64 in `response.output_audio.delta` (field `delta`), and the output audio transcript can stream in parallel via `response.output_audio_transcript.delta`. citeturn29view1turn29view0

### Driving a MetaHuman face via Live Link (Blueprint-level)

Live Link is UE’s standard mechanism for streaming and consuming animation data; it can buffer frames and supports multiple evaluation modes (Engine Time / Latest / Timecode), which directly affects latency vs smoothness trade-offs. citeturn31view0

For runtime-driven animation, Epic notes you typically need the **Live Link Pose** node set up in the target Animation Blueprint. citeturn31view0

For MetaHumans specifically, Epic’s MetaHuman docs describe connecting a Live Link subject to an assembled MetaHuman placed in a level by selecting the subject in the **Live Link** section and ensuring **Use Live Link** is enabled. citeturn6view0turn4view1

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["MetaHuman Animator audio driven animation Unreal Engine","MetaHuman Live Link window MetaHuman audio source","Unreal Engine Live Link Pose node Animation Blueprint","MetaHuman assembled character Live Link subject field"],"num_per_query":1}

## Audio-to-face approaches and plugin options

### Direct audio-to-animation vs text-based lip-sync

There are two broad ways to drive facial animation from a Realtime voice agent:

**Direct audio-to-animation (recommended for sync)**  
Use the assistant’s actual output audio (and/or the user’s input audio) as the driver for visemes/face curves. This naturally synchronizes with what is heard and aligns with MetaHuman’s audio-driven pipelines. citeturn3view1turn29view1

**Text → phonemes/visemes (useful when audio is unavailable or you want pre-roll)**  
Use transcripts (user input transcription or assistant output transcript) to generate viseme curves. This can be easier to integrate with classic lip-sync systems, but transcription is explicitly described as asynchronous guidance and may not match what the model “heard” or spoke. citeturn7view1turn2search19turn29view1

### Comparison table: audio-to-face solutions the demo can use

The table below focuses on the options you explicitly named, plus two “pragmatic add-ons” that are commonly used in production voices-to-faces pipelines.

| Option | Real-time? | What it produces | UE integration shape | Licensing / constraints | Primary sources |
|---|---:|---|---|---|---|
| MetaHuman Audio Live Link source | Yes | Real-time facial animation curves driven from an audio device | Create a “MetaHuman (Audio)” Live Link source; connect a subject; bind subject to MetaHuman actor | Requires UE 5.6+ project + MetaHuman Live Link plugin; uses Live Link workflows | citeturn4view1turn5view0turn6view0 |
| MetaHuman Audio Driven Animation (offline workflow) | “Offline process” (even when using realtime solver mode inside the asset) | Sequencer facial rig tracks from a SoundWave | Build SoundWave → MetaHuman Performance asset → Process → export animation | UE 5.6+ and MetaHuman Animator plugin; doc distinguishes “realtime audio solver” in an offline process vs true realtime Live Link source | citeturn3view1turn3view0 |
| NVIDIA ACE Audio2Face-3D | Often “near-real-time,” depending on how you chunk/submit audio | Facial animation from speech clips (SoundWave assets) | Provide SoundWave; plugin converts to 16 kHz mono and sends to service/local inference; includes Live Link integration paths | Has explicit service licensing/EULA pages; plugin has constraints (e.g., handling of Opus + Force Inline) | citeturn18search0turn1search17turn18search12turn18search16 |
| Speech Graphics (SG Com UE plugin) | Yes | Facial animation driving from speech analysis | UE plugin with project settings requiring license path; drives characters configured for SG Com | Requires a license file; license expects contacting a cloud license server and opening ports | citeturn17search1turn17search14turn17search18 |
| FaceFX (runtime + UE plugin) | Usually offline authoring, runtime playback (can be “real-time playback,” not “real-time solve”) | Authored facial animation (phonemes/curves) generated via FaceFX Studio toolchain, played in-engine | UE plugin (source MIT) + proprietary runtime; typically bake animation data ahead of time | Plugin code is MIT; runtime is under FaceFX Runtime EULA; UE5 plugin notes support for UE5.6 (may need work for 5.7) | citeturn23view0turn17search0turn17search12 |
| Dynamixyz Live Link plugin | Yes (capture-driven) | Real-time facial animation from camera-based solve | Live Link subject driven by Dynamixyz “Grabber” mocap software | Requires Dynamixyz real-time facial mocap software | citeturn17search10turn31view0 |
| Rhubarb Lip Sync | No (offline file analysis) | Automatically generated mouth-shape/viseme timing from audio | Typically used in offline pipelines; can be integrated as a preprocessing step | MIT license | citeturn17search2turn17search4 |
| Wav2Lip | Limited (mostly video-post) | Generates lip-synced talking-head video frames, driven by audio | Not a natural fit for a 3D MetaHuman runtime rig; better for 2D/video pipelines | Upstream repo describes itself as **Non Commercial** open-source version | citeturn19search0 |
| DeepSpeech-based pipeline | Yes (STT) | Speech-to-text (transcripts) that can drive text→viseme workflows | Use transcripts for captions or phoneme estimation (with an extra phonemizer); not inherently “audio-to-face” | entity["organization","Mozilla","firefox maker"]’s DeepSpeech repo is archived; license is MPL-2.0 | citeturn18search5turn18search3 |

Practical recommendation for a **demo**:

- If your goal is “one afternoon to wow,” use **MetaHuman Audio Live Link** and treat it as your audio-to-face component, because it’s directly documented for “realtime animation from an audio device.” citeturn5view0turn4view1  
- If your goal is “demonstrate a production-shaped pipeline,” consider **SG Com** or **NVIDIA ACE** (both offer runtime solving/streaming models, but both introduce licensing and/or service dependencies). citeturn17search14turn18search16turn18search0

## Step-by-step build plan, latency/sync, testing, and deployment

### Step-by-step technical plan

Step one is to set up a UE project that can (a) capture and play audio, (b) talk WebSockets, and (c) drive facial animation via Live Link.

**Environment and project setup**

1) Install Unreal Engine 5.7 and set up your C++ toolchain per Epic’s guidance (VS 2022 17.14 recommended for UE 5.7; required components listed by Epic). citeturn16search8turn13search7  
2) Create a new C++ project and enable UE plugins/modules you need:
   - Live Link plugin (UE Animation category). citeturn31view0  
   - Audio capture module(s) (`AudioCaptureCore` / `AudioCapture`). citeturn11view0turn2search17  
   - WebSockets module. citeturn1search0turn7view0  
   - MetaHuman Live Link and (optionally) MetaHuman Animator plugin for your chosen audio-to-face workflow. citeturn3view0turn4view1turn3view1  
3) Add a MetaHuman to the level (assembled character). When ready, you will bind a Live Link subject to it so it animates in real time. citeturn6view0turn4view1

**Backend token minting (recommended even for demos)**

4) Create a tiny backend endpoint that mints ephemeral keys using `POST /v1/realtime/client_secrets`. The OpenAI WebRTC guide includes example flows and strongly emphasizes keeping standard API keys on the server. citeturn9view0turn9view1turn0search1  
5) UE client calls this endpoint to fetch `client_secret.value` plus `expires_at`. Treat expiry (~1 min) as a normal lifecycle event. citeturn0search1turn7view1

**UE client: Realtime session + mic streaming**

6) In UE on connect, send `session.update` defining:
   - `input_audio_format`: `pcm16`
   - `output_audio_format`: `pcm16`
   - `modalities`: include `"audio"` and (optionally) `"text"`
   - `turn_detection`: `"server_vad"` unless you want push-to-talk
   - optional noise reduction (`near_field` / `far_field`)
   - optional input transcription configuration citeturn7view1turn27view0turn0search0  
7) Capture mic audio via `FAudioCapture`, resample to 24 kHz mono, convert to PCM16 little-endian, then stream via `input_audio_buffer.append`. citeturn11view0turn30search0turn2search7turn7view1  
8) If using push-to-talk:
   - begin: `input_audio_buffer.clear`
   - end: `input_audio_buffer.commit`, then `response.create` citeturn24view0turn24view2turn24view3  
9) If using server VAD:
   - stream continuously
   - listen for `input_audio_buffer.speech_started` / `speech_stopped` events for UX (e.g., cut off playback and show “listening”). citeturn24view2turn7view1

**UE client: assistant audio + face animation**

10) Parse output audio deltas from `response.output_audio.delta`, decode + queue to `USoundWaveProcedural`, and optionally display transcripts from `response.output_audio_transcript.delta` or `response.output_text.delta`. citeturn29view1turn1search1turn28view2  
11) Feed the same decoded PCM stream into your audio-to-face component:

- **MetaHuman Audio Live Link approach** (fastest for a demo):  
  - Create a MetaHuman Audio Live Link source in the Live Link window, pick the target audio device, connect, then bind the resulting subject to your MetaHuman in the level and enable “Use Live Link.” citeturn5view0turn6view0  
  - Your “engineering work” becomes ensuring the assistant audio can be routed into the chosen audio input device (e.g., via a loopback/virtual device in your OS). The MetaHuman docs explicitly frame the input as “an audio device.” citeturn5view0turn4view1  

- **NVIDIA ACE approach** (more programmatic, more dependencies):  
  - Provide assistant speech as a SoundWave clip; the plugin supports “any sample rate” input and converts to 16 kHz mono before inference. citeturn18search0  
  - If using their Live Link interface, NVIDIA documentation describes a Live Link source and MetaHuman Face AnimBP changes (subject binding). citeturn18search13

### Latency and sync mitigation strategies

These are the main levers you can use to keep the demo feeling “real time,” tied back to the constraints documented by the APIs.

- **Use server VAD and tune silence**: Realtime turn detection can be configured; shorter `silence_duration_ms` can make the model respond faster but may cut in on pauses (docs provide defaults). citeturn7view1turn0search8  
- **Stream small audio chunks**: the API supports large chunks up to 15 MB, but documentation notes smaller chunks can make VAD more responsive. citeturn2search7turn2search11  
- **Bind animation evaluation mode to your goals**: Live Link can interpolate/buffer frames and supports evaluation modes (Engine Time / Latest / Timecode), giving you explicit control over smoothing vs latency. citeturn31view0  
- **Avoid GPU contention for MetaHuman realtime sources**: Epic explicitly warns that MetaHuman realtime video/audio sources can be GPU-expensive; they recommend running sources in UE when possible (not in Live Link Hub on the same machine), or running Live Link Hub on a separate machine, and limiting UE framerate using `t.maxfps` to free GPU budget. citeturn4view1turn4view0

### Performance benchmarks to target

These are practical targets for a “good-feeling” demo; treat them as engineering goals rather than guarantees, because actual latency depends on model choice, network, hardware, and scene complexity.

- **Render**: stable 60 FPS (or stable 30 FPS if your MetaHuman scene is heavy) with no hitching during audio decode and animation updates.  
- **Voice interaction**: first audible assistant audio within ~0.3–1.0 s of end-of-speech; interruptions should stop playback in <150 ms once user speech is detected. (Use `input_audio_buffer.speech_started` as your “interrupt now” trigger.) citeturn24view2turn7view1  
- **A/V sync**: lip movement should align within ±80 ms of audio during normal playback; keep buffering small but sufficient to avoid underruns.

### Testing checklist

A concise, developer-oriented test matrix that maps directly to documented behaviors:

- **Audio format compliance**: confirm your outgoing stream is 24 kHz mono PCM16 LE when using `pcm16`. citeturn7view1turn0search0  
- **Event handling**: verify you correctly handle `session.created/session.updated`, `response.output_audio.delta/done`, `response.output_text.delta/done`, and `response.done`. citeturn27view0turn29view1turn28view2turn24view3  
- **Turn-taking**: test both:
  - server VAD (no manual commit), and
  - push-to-talk (`input_audio_buffer.commit` then `response.create`). citeturn24view0turn24view2turn24view3  
- **Rate limit resilience**: log rate limit updates/events and verify backoff/retry behavior on 429s. citeturn2search2turn2search3turn2search9  
- **MetaHuman binding**: confirm the Live Link subject drives the character in real time, and “Use Live Link” is enabled on the assembled MetaHuman. citeturn6view0  
- **Resource contention**: if using Live Link Hub, test the “same machine” case vs “separate machine” and apply `t.maxfps` as recommended by Epic. citeturn4view1turn4view0

### Deployment notes and platform constraints

- **Live Link transport caveat**: Live Link’s “Message Bus Source” path relies on UDP Messaging; the docs state UDP Messaging is not enabled by default in-game and can be enabled with `-messaging`, while “shipping target is not supported” for that flag. This matters if your chosen Live Link source depends on message bus behavior. citeturn31view0  
- **Client secret / key safety**: ephemeral keys are short-lived and intended for client environments; keep standard API keys server-side. citeturn9view1turn0search1turn7view1  
- **MetaHuman platform reality**: MetaHuman Creator plugin availability has broadened, but MetaHuman Animator support for Linux/macOS is described as planned for future releases; plan your demo OS accordingly if you depend on MetaHuman Animator workflows. citeturn13search13turn1search11  
- **Third-party licensing**: SG Com requires a license file and cloud license checks/ports; FaceFX combines MIT-licensed UE plugin code with a proprietary runtime EULA; NVIDIA ACE includes explicit EULA/service terms pages. citeturn17search14turn23view0turn18search16turn18search12  

### Prioritized primary sources

OpenAI:

- Realtime guide + connection modes (WebSocket/WebRTC) + ephemeral key flow. citeturn2search6turn7view0turn8view0turn9view1  
- Realtime API reference for event types (`session.update`, audio deltas, VAD events, formats). citeturn7view1turn29view1turn24view2  
- Rate limits guide + cookbook backoff patterns. citeturn2search2turn2search9  

Epic / MetaHuman:

- MetaHuman Animator overview + realtime animation prerequisites + audio live link source. citeturn3view0turn4view1turn5view0  
- Connecting Live Link subject to MetaHuman and core Live Link behavior (runtime pose node, buffering/evaluation). citeturn6view0turn31view0  
- UE audio capture and procedural audio playback APIs (`FAudioCapture`, callback signature typedefs, `USoundWaveProcedural::QueueAudio`). citeturn11view0turn30search0turn1search1  
- UE toolchain requirements for 5.7 (VS 2022 version compatibility). citeturn16search8