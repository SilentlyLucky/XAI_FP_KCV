<div align="center">

<br/>

# 🔍 VISIONGUARD
### XAI Diagnostic Dashboard for Autonomous Vehicle Perception

<p align="center">
  <strong>Explainable AI • Object Detection • Vision-Language Model</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PyTorch-2.5+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/CUDA-12.4-76B900?style=for-the-badge&logo=nvidia&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/YOLOv11-Ultralytics-0075FF?style=flat-square" />
  <img src="https://img.shields.io/badge/Qwen2--VL--2B-QDoRA-blueviolet?flat-square" />
  <img src="https://img.shields.io/badge/EigenCAM-Heatmap-orange?flat-square" />
  <img src="https://img.shields.io/badge/Final_Project-KCV-green?flat-square" />
</p>

</div>

---

## 📖 Overview

**VISIONGUARD** is a full-stack web dashboard for **Explainable AI (XAI)** applied to autonomous vehicle perception. It diagnoses *why* a computer vision model succeeded or failed on any given image — surfacing not just detections, but the model's internal reasoning through heatmaps and natural language explanations.

The system integrates:
- 🎯 **YOLOv11s** — real-time object detection with bounding boxes, labels, and confidence scores
- 🔥 **EigenCAM** — gradient-free heatmap visualization showing *which image regions* drove the model's decision
- 🧠 **Qwen2-VL-2B + QDoRA** — a fine-tuned Vision-Language Model producing written diagnostic explanations in structured sections (Observation → Evidence → Diagnosis → Verdict)

> Built as a final project for the **Komputer Visi (KCV)** course.

---

## ✨ How It Works

```
┌─────────────┐      ┌──────────────┐     ┌─────────────────┐      ┌────────────────┐
│     RGB     │────▶│  YOLOv11s    │────▶│  EigenCAM       │────▶│  Qwen2-VL-2B   │
│    Image    │      │  Detection   │     │  Heatmap        │      │  VLM Diagnosis │
└─────────────┘      └──────────────┘     └─────────────────┘      └────────────────┘

```

1. **Image Selection** — user selects or the system auto-picks a test image from the dataset
2. **YOLO Detection** — YOLOv11s runs on the image, producing bounding boxes with TP/FP/FN classification against ground truth
3. **EigenCAM Heatmap** — the YOLO backbone is probed using EigenCAM to generate a saliency map, highlighting discriminative regions
4. **XAI Metrics** — per-object metrics (heatmap energy, coverage ratio, attention shift) and global image-level metrics are computed
5. **VLM Diagnosis** — the Qwen2-VL-2B model (fine-tuned with QDoRA adapter) receives the 3-panel composite image and generates a structured written diagnosis
6. **Streaming UI** — the frontend displays everything live: bounding boxes overlaid on the image, heatmap, and streamed VLM text

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.3 | React framework, SSR, routing |
| **React** | 19.2.4 | UI component library |
| **TypeScript** | 5+ | Type-safe development |
| **Tailwind CSS** | 4 | Utility-first styling |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.115.0 | Async REST API + SSE streaming |
| **PyTorch** | 2.5.1+cu124 | Deep learning runtime (CUDA) |
| **Ultralytics** | ≥8.3.0 | YOLOv11 object detection |
| **Transformers** | ≥4.46.0 | Qwen2-VL model loading |
| **PEFT** | ≥0.13.0 | QDoRA adapter (LoRA + DoRA) |
| **bitsandbytes** | ≥0.44.0 | 4-bit NF4 quantization |
| **pytorch-grad-cam** | ≥1.5.0 | EigenCAM heatmap generation |
| **OpenCV** | ≥4.9.0 | Image processing, colormap |
| **Pillow** | 10.4.0 | Image manipulation |
| **accelerate** | ≥1.0.0 | Multi-device model loading |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20+
- **Python** 3.10+
- **NVIDIA GPU** with CUDA 12.4+ *(strongly recommended; CPU is ~100x slower for VLM)*
- ~6 GB free VRAM *(Qwen2-VL-2B in 4-bit NF4 quantization)*

---

### Backend Setup

```powershell
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

# Install dependencies (PyTorch with CUDA 12.4 + all packages)
pip install -r requirements.txt

# Copy and configure environment variables
copy .env.example .env
# Then edit .env: set ALLOWED_ORIGINS to your frontend URL
```

**Create your `.env` file:**
```env
# Allow requests from these origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

**Run the backend:**
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

---

### Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
copy .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL
```

**Create your `.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run the frontend:**
```powershell
npm run dev
```

The dashboard will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
XAI_website/
├── 📁 backend/
│   ├── main.py                  # FastAPI app entry point, CORS config
│   ├── requirements.txt         # Python dependencies (PyTorch CUDA + ML libs)
│   ├── Dockerfile               # Container build config
│   ├── .env.example             # Environment variable template
│   │
│   ├── 📁 routers/
│   │   └── api.py               # All API route handlers
│   │
│   ├── 📁 services/
│   │   ├── model_loader.py      # Lazy loader: YOLO, EigenCAM, VLM
│   │   ├── data_loader.py       # Dataset & annotation loading
│   │   ├── image_service.py     # Image path resolution & cropping
│   │   ├── prompt_builder.py    # Dynamic VLM prompt generation
│   │   └── xai_metrics.py      # Per-object & global XAI metrics
│   │
│   ├── 📁 model/
│   │   └── yolov11s_best.pt     # YOLOv11s fine-tuned weights
│   │
│   └── 📁 qwen_vlm_qdora_v2/
│       └── lora_adapter/        # QDoRA adapter (LoRA + DoRA) weights
│
└── 📁 frontend/
    ├── next.config.ts           # Next.js config, env variable passthrough
    ├── package.json             # Node.js dependencies
    │
    └── 📁 src/
        ├── 📁 app/
        │   ├── page.tsx         # Main dashboard page
        │   ├── layout.tsx       # Root layout
        │   └── globals.css      # Global styles
        │
        └── 📁 components/
            ├── Dashboard.tsx    # Main dashboard logic & state
            ├── Header.tsx       # Navigation header
            ├── ImageViewer.tsx  # Image + heatmap + bbox overlay
            └── PipelineStepper.tsx  # Pipeline stage progress indicator
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health check & data store status |
| `GET` | `/models/status` | Model load status, device info (CPU/GPU) |
| `GET` | `/api/images` | List available images with TP/FP/FN stats |
| `GET` | `/api/generate` | **SSE** — run full pipeline on a random image |
| `GET` | `/api/results/{image_id}` | Get detection results for an image |
| `GET` | `/api/diagnosis/{image_id}/{object_idx}` | **SSE** — stream VLM diagnosis token by token |
| `GET` | `/api/image/{image_id}` | Serve raw image file |
| `GET` | `/api/heatmap/{image_id}` | Serve EigenCAM heatmap image |
| `GET` | `/api/panel/{image_id}` | Serve 3-panel composite image |
| `GET` | `/api/summary` | Global dataset metrics (precision, recall, etc.) |

> Endpoints marked **SSE** use `text/event-stream` for real-time streaming to the frontend.

---

## 🌍 Deployment

### Frontend
The frontend is deployed on **Vercel**. Set the environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL = https://your-backend-url.com
```

### Backend (with Ngrok for demo)
Since the backend requires a GPU, the simplest public deployment is tunneling your local machine:

```powershell
# Terminal 1 — run backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2 — expose to internet
ngrok http 8000
```

Then update `NEXT_PUBLIC_API_URL` in Vercel with the ngrok HTTPS URL.

> For production deployment, consider **RunPod** (GPU cloud) or **Modal** (serverless GPU).

---

## 📊 XAI Metrics

The system computes several explainability metrics per detected object and globally:

| Metric | Description |
|---|---|
| **Heatmap Energy** | Total saliency intensity within object bounding box |
| **Coverage Ratio** | Fraction of object bbox covered by high-attention regions |
| **Attention Shift** | Distance between attention centroid and object center |
| **Global Entropy** | Spread/uniformity of attention across the full image |

---

## ⚠️ Known Issues & Notes

- **First inference is slow** (~30–60s): models are loaded lazily on first request and cached for the session
- **Ngrok free tier**: URL changes every restart — must update Vercel env var accordingly

---

## 🙏 Acknowledgments

- [**Ultralytics**](https://github.com/ultralytics/ultralytics) — YOLOv11 object detection framework
- [**jacobgil/pytorch-grad-cam**](https://github.com/jacobgil/pytorch-grad-cam) — EigenCAM and gradient-based CAM methods
- [**Qwen Team (Alibaba)**](https://github.com/QwenLM/Qwen2-VL) — Qwen2-VL Vision-Language Model
- [**HuggingFace**](https://huggingface.co) — Transformers, PEFT, and model hosting

---

<div align="center">

Built with ❤️ for **Komputer Visi (KCV)** Final Project

</div>
