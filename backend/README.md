# XAI Diagnostic Dashboard

A full-stack web dashboard for Explainable AI (XAI) applied to computer vision. It combines YOLOv11 object detection, EigenCAM heatmap visualization, and a fine-tuned Vision-Language Model (Qwen2-VL-2B with QDoRA adapter) to detect objects and explain model behavior in natural language.

Built for a final project course (Komputer Visi / KCV).

## How It Works

1. The user selects or uploads an image through the frontend.
2. The backend runs YOLOv11s to detect objects (bounding boxes, labels, confidence scores).
3. EigenCAM generates a heatmap from the YOLO backbone, showing which image regions influenced the detection.
4. The Qwen2-VL-2B Vision-Language Model produces a written diagnostic explaining what was detected and why.
5. The frontend displays the image with overlaid bounding boxes, heatmap, and the streamed text diagnosis.

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

**Backend:** FastAPI, PyTorch, Ultralytics YOLO, pytorch-grad-cam, Transformers/PEFT, OpenCV, Pillow

## Getting Started

### Prerequisites

- Node.js v20+
- Python 3.10+
- NVIDIA GPU with CUDA (recommended)

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API runs at `http://127.0.0.1:8000`. Models load lazily on first request.

Model files must exist relative to the workspace root:
- YOLO weights: `../model/best (4).pt`
- VLM adapter: `../qwen_vlm_dora_v2/lora_adapter`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI runs at `http://localhost:3000`.

## Project Structure

```
web/
├── backend/
│   ├── main.py                  # FastAPI entrypoint, CORS setup
│   ├── requirements.txt         # Python dependencies
│   ├── routers/
│   │   ├── __init__.py
│   │   └── api.py               # API endpoints (inference, health checks)
│   └── services/
│       ├── __init__.py
│       ├── data_loader.py       # Loads pre-computed datasets
│       ├── image_service.py     # Base64 encoding/decoding, image utils
│       ├── model_loader.py      # Lazy loading for YOLO, EigenCAM, VLM
│       ├── prompt_builder.py    # Prompt construction for the VLM
│       └── xai_metrics.py       # XAI heatmap metric calculations
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── public/                  # Static assets (SVGs)
│   └── src/
│       ├── app/
│       │   ├── layout.tsx       # Root layout
│       │   ├── page.tsx         # Main dashboard page
│       │   ├── globals.css
│       │   └── favicon.ico
│       ├── components/
│       │   ├── ForensicPanel.tsx     # VLM diagnosis display
│       │   ├── Header.tsx           # Page header
│       │   ├── ImageViewer.tsx      # Image canvas with bounding boxes and heatmap overlay
│       │   └── PipelineStepper.tsx  # Inference pipeline progress indicator
│       ├── hooks/
│       │   └── useTypewriter.ts     # Typewriter text animation hook
│       └── lib/
│           ├── api.ts               # Backend API client
│           └── types.ts             # Shared TypeScript interfaces
│
└── README.md
```

## API Endpoints

- `GET /health` -- API and data store status
- `GET /models/status` -- Model load status and device info
- See `backend/routers/api.py` for all endpoints.

## Acknowledgments

- [Ultralytics](https://github.com/ultralytics/ultralytics) for YOLOv11
- [jacobgil/pytorch-grad-cam](https://github.com/jacobgil/pytorch-grad-cam) for EigenCAM
- [Qwen](https://github.com/QwenLM/Qwen2-VL) for the Vision-Language Model
