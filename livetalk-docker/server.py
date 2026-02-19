"""LiveTalk Web Server -- upload image + audio, get a lip-synced video."""

import os
import sys

# Must be set before any LiveTalk imports (parse_args runs at module level)
os.chdir("/app")
sys.path.insert(0, "/app")
sys.path.append("/app/OmniAvatar")
sys.argv = ["server", "--config", os.environ.get("CONFIG", "configs/causal_inference.yaml")]

import torch
import numpy as np
import imageio
import subprocess
import uuid
import threading
import time
from pathlib import Path
from flask import Flask, request, render_template_string, send_file, jsonify

# LiveTalk imports (triggers module-level parse_args)
from scripts.inference_example import CausalInferencePipeline, load_models
import scripts.inference_example as _infer_mod

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024  # 100MB upload limit

# ---------------------------------------------------------------------------
# Global state
# ---------------------------------------------------------------------------
pipeline = None
args = None
jobs = {}
gpu_lock = threading.Lock()

JOBS_DIR = Path("/tmp/livetalk_jobs")
JOBS_DIR.mkdir(parents=True, exist_ok=True)


class Job:
    def __init__(self, job_id, image_path, audio_path, duration, prompt):
        self.id = job_id
        self.status = "queued"
        self.progress = "Waiting..."
        self.error = None
        self.image_path = image_path
        self.audio_path = audio_path
        self.duration = int(duration)
        self.prompt = prompt
        self.output_path = str(JOBS_DIR / f"{job_id}.mp4")


def init_pipeline():
    """Load all models into GPU. Called once at startup."""
    global pipeline, args
    args = _infer_mod.args
    device = torch.device("cuda:0")
    load_models(args)
    pipeline = CausalInferencePipeline.from_pretrained(args=args, device=device)
    print(f"[server] Pipeline ready on {device}")


def run_inference(job):
    """Background worker -- one job at a time."""
    with gpu_lock:
        try:
            job.status = "running"
            device = torch.device("cuda:0")
            dtype = torch.bfloat16 if args.dtype == "bf16" else torch.float16

            num_frames = (job.duration * args.fps + 4) // 4
            job.progress = f"Generating noise ({num_frames} latent frames)..."
            noise = torch.randn(
                [1, num_frames, 16, 64, 64], device=device, dtype=dtype
            )

            job.progress = "Running diffusion (this takes a few minutes)..."
            video = pipeline(
                noise=noise,
                text_prompts=job.prompt,
                image_path=job.image_path,
                audio_path=job.audio_path,
                initial_latent=None,
                return_latents=False,
            )

            job.progress = "Encoding video..."
            video_np = (
                (video.squeeze(0).permute(0, 2, 3, 1).cpu().float().numpy() * 255)
                .astype(np.uint8)
            )

            tmp_path = str(JOBS_DIR / f"{job.id}_tmp.mp4")
            imageio.mimsave(
                tmp_path,
                video_np,
                fps=args.fps,
                codec="libx264",
                macro_block_size=None,
                ffmpeg_params=["-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p"],
            )

            job.progress = "Merging audio..."
            subprocess.run(
                [
                    "ffmpeg", "-y", "-loglevel", "error",
                    "-i", tmp_path, "-i", job.audio_path,
                    "-map", "0:v:0", "-map", "1:a:0",
                    "-c:v", "copy", "-c:a", "aac", "-ar", "48000", "-ac", "1",
                    "-b:a", "96k", "-movflags", "+faststart", "-shortest",
                    job.output_path,
                ],
                check=True,
            )
            os.remove(tmp_path)

            # Also copy to /app/output/ for the volume mount
            vol_path = Path("/app/output") / f"{job.id}.mp4"
            if Path("/app/output").is_dir():
                subprocess.run(["cp", job.output_path, str(vol_path)], check=True)

            job.status = "done"
            job.progress = "Complete!"
            del video, video_np, noise
            torch.cuda.empty_cache()

        except Exception as exc:
            job.status = "error"
            job.error = str(exc)
            job.progress = f"Error: {exc}"
            torch.cuda.empty_cache()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LiveTalk</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;background:#0f0f0f;color:#d4d4d4;min-height:100vh}
.wrap{max-width:680px;margin:0 auto;padding:2.5rem 1.5rem}
h1{font-size:1.4rem;font-weight:700;letter-spacing:-.02em}
.sub{color:#666;font-size:.85rem;margin-top:.25rem;margin-bottom:2rem}
.uploads{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1.25rem}
.ubox{border:2px dashed #2a2a2a;border-radius:8px;padding:1.5rem .75rem;text-align:center;cursor:pointer;transition:border-color .15s}
.ubox:hover{border-color:#444}
.ubox.ok{border-color:#3d8;border-style:solid}
.ubox input{display:none}
.ubox .lbl{font-size:.8rem;color:#666;margin-top:.4rem}
.ubox .fname{font-size:.78rem;color:#3d8;margin-top:.3rem;word-break:break-all}
.ubox .ic{font-size:1.6rem;color:#444;margin-bottom:.25rem}
.fg{margin-bottom:1rem}
.fg label{display:block;font-size:.78rem;color:#666;margin-bottom:.25rem}
.fg textarea,.fg select,.fg input[type=text]{width:100%;background:#161616;border:1px solid #2a2a2a;color:#d4d4d4;border-radius:6px;padding:.45rem .6rem;font-size:.85rem;font-family:inherit}
.fg textarea{min-height:52px;resize:vertical}
.row{display:flex;gap:.75rem}
.row .fg{flex:1}
.btn{width:100%;padding:.7rem;background:#3d8;color:#0f0f0f;border:none;border-radius:6px;font-size:.95rem;font-weight:600;cursor:pointer;margin-top:.5rem;transition:background .15s}
.btn:hover{background:#4e9}
.btn:disabled{background:#222;color:#555;cursor:wait}
.st{text-align:center;padding:.8rem;margin-top:1rem;border-radius:6px;font-size:.85rem;display:none}
.st.vis{display:block}
.st.run{background:#0e1f0e;color:#3d8}
.st.err{background:#1f0e0e;color:#e55}
.res{margin-top:1.5rem;display:none}
.res.vis{display:block}
.res video{width:100%;border-radius:8px;background:#000}
.res .dl{display:inline-block;margin-top:.6rem;padding:.4rem .8rem;background:#222;color:#d4d4d4;text-decoration:none;border-radius:5px;font-size:.82rem}
.res .dl:hover{background:#333}
.sep{display:flex;align-items:center;gap:.6rem;margin-bottom:1.25rem;font-size:.78rem;color:#444}
.sep::before,.sep::after{content:"";flex:1;border-top:1px solid #222}
.exbtn{background:#161616;border:1px solid #2a2a2a;color:#666;padding:.35rem .7rem;border-radius:4px;cursor:pointer;font-size:.8rem}
.exbtn:hover{border-color:#444;color:#d4d4d4}
.busy-note{font-size:.78rem;color:#666;text-align:center;margin-bottom:1rem}
.spin{display:inline-block;width:14px;height:14px;border:2px solid #3d8;border-top-color:transparent;border-radius:50%;animation:sp .6s linear infinite;vertical-align:middle;margin-right:6px}
@keyframes sp{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<div class="wrap">
<h1>LiveTalk</h1>
<p class="sub">Real-time talking avatar via video diffusion</p>

<div class="sep"><button class="exbtn" onclick="useExample()">Use bundled example</button></div>

<form id="f" enctype="multipart/form-data">
<div class="uploads">
  <label class="ubox" id="ib">
    <div class="ic">&#9634;</div>
    <div>Reference Image</div>
    <div class="lbl">JPG / PNG</div>
    <div class="fname" id="in"></div>
    <input type="file" id="ii" name="image" accept="image/*">
  </label>
  <label class="ubox" id="ab">
    <div class="ic">&#9835;</div>
    <div>Audio</div>
    <div class="lbl">WAV 16 kHz recommended</div>
    <div class="fname" id="an"></div>
    <input type="file" id="ai" name="audio" accept="audio/*">
  </label>
</div>

<div class="fg">
  <label>Prompt</label>
  <textarea name="prompt">A realistic video of a person speaking directly to the camera. The individual maintains steady eye contact with clear, expressive facial features.</textarea>
</div>

<div class="row">
  <div class="fg">
    <label>Duration</label>
    <select name="duration">
      <option value="5" selected>5 s</option>
      <option value="8">8 s</option>
      <option value="11">11 s</option>
      <option value="14">14 s</option>
      <option value="17">17 s</option>
    </select>
  </div>
</div>

<button type="submit" class="btn" id="btn">Generate</button>
</form>

<div class="st" id="st"></div>
<div class="res" id="res">
  <video id="vid" controls autoplay loop></video>
  <a class="dl" id="dl" download="livetalk_output.mp4">Download MP4</a>
</div>
</div>

<script>
const $=s=>document.getElementById(s);
let exMode=false;

$('ii').onchange=function(){if(this.files[0]){$('ib').classList.add('ok');$('in').textContent=this.files[0].name;exMode=false}};
$('ai').onchange=function(){if(this.files[0]){$('ab').classList.add('ok');$('an').textContent=this.files[0].name;exMode=false}};

function useExample(){
  exMode=true;
  $('ib').classList.add('ok');$('in').textContent='example1.jpg (bundled)';
  $('ab').classList.add('ok');$('an').textContent='example1.wav (bundled)';
}

$('f').onsubmit=async function(e){
  e.preventDefault();
  const btn=$('btn'),st=$('st'),res=$('res');
  btn.disabled=true;
  st.className='st vis run';st.innerHTML='<span class="spin"></span> Submitting...';
  res.className='res';

  const fd=new FormData(this);
  if(exMode) fd.set('use_example','1');
  else if(!fd.get('image')?.size||!fd.get('audio')?.size){
    st.className='st vis err';st.textContent='Upload an image and audio file (or use the bundled example).';
    btn.disabled=false;return;
  }

  try{
    const r=await fetch('/generate',{method:'POST',body:fd});
    const d=await r.json();
    if(d.error) throw new Error(d.error);
    const jid=d.job_id;

    while(true){
      await new Promise(r=>setTimeout(r,3000));
      const s=await fetch('/status/'+jid).then(r=>r.json());
      st.innerHTML='<span class="spin"></span> '+s.progress;
      if(s.status==='done'){
        st.className='st';
        res.className='res vis';
        $('vid').src='/download/'+jid;
        $('dl').href='/download/'+jid;
        break;
      }
      if(s.status==='error') throw new Error(s.error||'Inference failed');
    }
  }catch(err){
    st.className='st vis err';st.textContent=err.message;
  }
  btn.disabled=false;
};
</script>
</body>
</html>"""


@app.route("/")
def index():
    return render_template_string(HTML)


@app.route("/health")
def health():
    return jsonify({"ok": pipeline is not None, "gpu_busy": gpu_lock.locked()})


@app.route("/generate", methods=["POST"])
def generate():
    if pipeline is None:
        return jsonify({"error": "Model still loading, try again shortly."}), 503

    job_id = uuid.uuid4().hex[:10]
    job_dir = JOBS_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    use_example = request.form.get("use_example") == "1"

    if use_example:
        image_path = "/app/examples/inference/example1.jpg"
        audio_path = "/app/examples/inference/example1.wav"
    else:
        img = request.files.get("image")
        aud = request.files.get("audio")
        if not img or not aud:
            return jsonify({"error": "Image and audio files are required."}), 400
        image_path = str(job_dir / "input.jpg")
        audio_path = str(job_dir / "input.wav")
        img.save(image_path)
        aud.save(audio_path)

    duration = int(request.form.get("duration", 5))
    prompt = request.form.get(
        "prompt",
        "A realistic video of a person speaking directly to the camera.",
    )

    job = Job(job_id, image_path, audio_path, duration, prompt)
    jobs[job_id] = job

    t = threading.Thread(target=run_inference, args=(job,), daemon=True)
    t.start()

    return jsonify({"job_id": job_id})


@app.route("/status/<job_id>")
def status(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(
        {"status": job.status, "progress": job.progress, "error": job.error}
    )


@app.route("/download/<job_id>")
def download(job_id):
    job = jobs.get(job_id)
    if not job or job.status != "done":
        return jsonify({"error": "Not ready"}), 404
    return send_file(
        job.output_path,
        mimetype="video/mp4",
        as_attachment=False,
        download_name="livetalk_output.mp4",
    )


if __name__ == "__main__":
    print("[server] Loading models (this takes a few minutes)...")
    init_pipeline()
    print("[server] Starting web server on http://0.0.0.0:7860")
    app.run(host="0.0.0.0", port=7860, threaded=True)
