# 🧘 YogaAI – Smart Yoga Trainer

> Real-time AI-powered pose detection, classification, and guided yoga flow system built with MediaPipe, Random Forest, Flask, React.js, and MongoDB.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Trainer │  │  Flows   │  │Dashboard │  │  HomePage │  │
│  │   Page   │  │   Page   │  │   Page   │  │           │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────────┘  │
│       │              │              │                         │
│       └──────────────┴──────────────┘                        │
│                       Axios REST Client                       │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/JSON
┌───────────────────────────▼─────────────────────────────────┐
│                   FLASK BACKEND (Python)                      │
│                                                               │
│  Routes Layer:                                                │
│  ┌───────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │ /api/pose │  │ /api/session  │  │    /api/yoga       │   │
│  └─────┬─────┘  └──────┬────────┘  └─────────┬──────────┘   │
│        │               │                       │              │
│  Services Layer:        │                       │              │
│  ┌─────▼──────────┐  ┌─▼──────────────┐  ┌───▼──────────┐  │
│  │PoseDetection   │  │SessionService  │  │YogaFlowSvc   │  │
│  │Service         │  │                │  │              │  │
│  └────┬───────────┘  └──────┬─────────┘  └──────────────┘  │
│       │                     │                                 │
│  Utils / Models:             │                                │
│  ┌────▼──────┐  ┌────────┐  │  ┌─────────────────────────┐ │
│  │pose_utils │  │ML Model│  │  │     yoga_poses.py       │ │
│  │image_utils│  │(joblib)│  │  │  (pose definitions +    │ │
│  └───────────┘  └────────┘  │  │   flow sequences)       │ │
│                              │  └─────────────────────────┘ │
│  Database Layer:             │                                │
│                    ┌─────────▼──────────────┐                │
│                    │   MongoDB (PyMongo)     │                │
│                    │   sessions collection   │                │
│                    └─────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  ML PIPELINE                                  │
│                                                               │
│  Raw Frame → MediaPipe Pose → 33 Keypoints                   │
│      → Joint Angle Extraction (10 angles)                    │
│      → Random Forest Classifier → Pose Label + Confidence    │
│      → Accuracy Calculation (angle diff vs ideal)            │
│      → Feedback Generation                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
yoga-trainer/
├── backend/
│   ├── app.py                        # Flask app factory
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── routes/
│   │   ├── pose_routes.py            # POST /api/pose/detect
│   │   ├── session_routes.py         # CRUD /api/session/*
│   │   └── yoga_routes.py            # Flow management /api/yoga/*
│   ├── services/
│   │   ├── pose_detection_service.py # MediaPipe + ML inference
│   │   ├── yoga_flow_service.py      # Sequence state machine
│   │   └── session_service.py        # Session CRUD wrapper
│   ├── models/
│   │   ├── yoga_poses.py             # Pose + flow definitions
│   │   └── session_model.py          # MongoDB data model
│   ├── utils/
│   │   ├── pose_utils.py             # Angle calc + accuracy
│   │   └── image_utils.py            # Frame decode/encode
│   ├── database/
│   │   └── mongo.py                  # PyMongo init
│   └── ml/
│       ├── train_model.py            # Training pipeline script
│       ├── pose_classifier.pkl       # Trained Random Forest
│       ├── label_encoder.pkl         # Class label encoder
│       └── feature_names.pkl         # Feature ordering
│
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js                    # Router + navbar
│       ├── App.css                   # Global design system
│       ├── index.js
│       ├── pages/
│       │   ├── HomePage.js           # Landing / hero
│       │   ├── TrainerPage.js        # Core training UI
│       │   ├── FlowsPage.js          # Flow browser
│       │   └── DashboardPage.js      # Progress charts
│       ├── components/
│       │   ├── WebcamView.js         # Live camera feed
│       │   ├── AccuracyRing.js       # SVG accuracy ring
│       │   ├── FeedbackPanel.js      # AI feedback list
│       │   ├── JointScoreGrid.js     # Per-joint breakdown
│       │   ├── FlowSequenceBar.js    # Pose progress bar
│       │   ├── HoldTimer.js          # Hold duration timer
│       │   └── Toast.js              # Notification toasts
│       ├── hooks/
│       │   └── useYogaTrainer.js     # Camera + detection hook
│       └── services/
│           └── api.js                # Axios API client
│
└── docker-compose.yml               # Full stack orchestration
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- Webcam

### Option A: Docker (Recommended)
```bash
git clone <repo>
cd yoga-trainer
docker compose up --build
# Visit: http://localhost:3000
```

### Option B: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Train the ML model
python ml/train_model.py

# Copy and configure environment
cp .env.example .env
# Edit .env: set MONGO_URI

# Start backend
python app.py
# → Running on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# → Running on http://localhost:3000
```

---

## 🤖 ML Pipeline

### Model: Random Forest Classifier
- **Input:** 10 joint angles (degrees) extracted from MediaPipe keypoints
- **Output:** Pose label + class probabilities
- **Test Accuracy:** 99.6%
- **Cross-validation:** 99.8% ± 0.4%

### Joint Angles Extracted
| Joint | Points Used |
|-------|-------------|
| Left/Right Knee | Hip → Knee → Ankle |
| Left/Right Hip | Shoulder → Hip → Knee |
| Left/Right Elbow | Shoulder → Elbow → Wrist |
| Left/Right Shoulder | Elbow → Shoulder → Hip |
| Left/Right Ankle | Knee → Ankle → Foot |

### Accuracy Calculation
```python
# Per-joint scoring
if abs(detected - ideal) <= tolerance:
    score = max(0, 100 - (diff / tolerance) * 50)  # 100→50
else:
    score = max(0, 50 - ((diff - tolerance) / tolerance) * 50)  # 50→0

# Overall accuracy = mean of all joint scores
```

### Retrain with Real Data
```bash
# Collect real pose data and save to CSV:
# columns: left_knee, right_knee, ..., right_ankle, label

# Modify train_model.py to load your CSV instead of synthetic data
python ml/train_model.py
```

---

## 🔌 REST API Reference

### Pose Detection
```
POST /api/pose/detect
Body: { "image": "<base64>", "target_pose": "warrior_1" }
Response: {
  "pose_detected": true,
  "classified_pose": "warrior_1",
  "confidence": 94.2,
  "accuracy": 87.5,
  "joint_accuracy": { "left_knee": { "detected": 88.3, "ideal": 90, "score": 98.0 }, ... },
  "feedback": ["Great pose! Minor adjustments needed.", "Deepen your front knee bend"],
  "landmarks": [...],
  "pose_completed": true
}
```

### Session Management
```
POST   /api/session/create           → Create session
POST   /api/session/:id/record       → Record pose attempt
POST   /api/session/:id/end          → End session
GET    /api/session/:id              → Get session
GET    /api/session/history          → Get all sessions
GET    /api/session/stats            → Aggregate stats
```

### Yoga Flows
```
GET    /api/yoga/flows               → List all flows
POST   /api/yoga/flows/:key/start    → Start a flow session
POST   /api/yoga/flows/:sid/update   → Update with accuracy → get advance/hold/incorrect
GET    /api/yoga/flows/:sid/status   → Current flow state
POST   /api/yoga/flows/:sid/end      → End flow session
```

---

## 🧘 Supported Poses

| Pose | Sanskrit | Difficulty | Hold |
|------|----------|------------|------|
| Mountain Pose | Tadasana | Beginner | 5s |
| Warrior I | Virabhadrasana I | Beginner | 5s |
| Warrior II | Virabhadrasana II | Beginner | 5s |
| Tree Pose | Vrksasana | Intermediate | 8s |
| Downward Dog | Adho Mukha Svanasana | Beginner | 5s |
| Chair Pose | Utkatasana | Beginner | 5s |
| Triangle Pose | Trikonasana | Intermediate | 5s |

---

## 🔄 Yoga Flows

| Flow | Poses | Duration | Level |
|------|-------|----------|-------|
| Beginner Morning Flow | 7 | ~20 min | Beginner |
| Strength Builder | 7 | ~25 min | Intermediate |
| Balance & Focus | 7 | ~20 min | Intermediate |

### Auto-Progression Logic
1. Detect pose each frame (~4 FPS)
2. Compute accuracy vs ideal angles
3. If accuracy ≥ 80% → increment hold counter
4. If hold_frames ≥ (3s × FPS) → advance to next pose
5. Show "🎉 Flow Complete!" when all poses done

---

## 🛠️ Extending the System

### Add a New Pose
1. Add entry to `backend/models/yoga_poses.py` → `YOGA_POSES` dict
2. Add ideal joint angles and tolerances
3. Add feedback cues per joint
4. Add to a flow sequence in `YOGA_FLOWS`
5. Retrain: `python ml/train_model.py`

### Add a New Flow
```python
# In yoga_poses.py → YOGA_FLOWS
"my_flow": {
    "name": "My Custom Flow",
    "description": "...",
    "difficulty": "intermediate",
    "estimated_duration": 25,
    "poses": ["mountain_pose", "warrior_1", "tree_pose", ...]
}
```

### Replace Synthetic Data with Real Data
```python
# In train_model.py, replace generate_synthetic_data() with:
import pandas as pd
df = pd.read_csv("pose_data.csv")
X = df[FEATURE_NAMES].values
y = df["label"].values
```

---

## 📊 MongoDB Schema

```js
// sessions collection
{
  _id: ObjectId,
  user_id: "guest",
  started_at: ISODate,
  ended_at: ISODate | null,
  flow_name: "beginner_flow" | null,
  completed: false,
  total_poses: 7,
  average_accuracy: 84.3,
  poses: [
    {
      pose_name: "warrior_1",
      accuracy: 87.5,
      duration_seconds: 4.2,
      timestamp: ISODate,
      feedback: ["Great pose!", "Deepen knee bend"],
      completed: true
    },
    ...
  ]
}
```

---

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://localhost:27017/yoga_trainer` | MongoDB connection |
| `SECRET_KEY` | `yoga-secret-key-2024` | Flask secret |
| `ACCURACY_THRESHOLD` | `80.0` | % to pass a pose |
| `HOLD_DURATION` | `3` | Seconds to hold |
| `REACT_APP_API_URL` | `http://localhost:5000/api` | Backend URL |

---

## 🔮 Future Enhancements

- [ ] Voice feedback via Web Speech API
- [ ] User authentication with JWT
- [ ] Custom pose creation UI
- [ ] Video upload + batch analysis
- [ ] 3D skeleton visualization using Three.js
- [ ] Real training data collection pipeline
- [ ] Mobile app with React Native
- [ ] WebSocket for lower latency streaming

---

## 📄 License
MIT License – free to use, modify, and distribute.
