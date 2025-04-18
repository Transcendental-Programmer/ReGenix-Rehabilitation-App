# ReGenix-Rehabilitation-App

ReGenix is an AI-powered exercise tracking application that uses **MediaPipe Pose Detection** to analyze workouts in real time.  
It provides **live feedback, rep counting, and posture analysis** while displaying a **skeletal overlay on the video feed**.  
Below the video, **rep counter, stage status, and posture feedback** are shown in **separate boxes** for a clean and intuitive user experience.  

-------------------------------------------------------------------------------

## 🚀 Features  

📹 **Real-time pose detection** using MediaPipe  
🔢 **Automated rep counting** for various exercises  
🏋️ **Posture feedback** to ensure correct form  
📊 **Live statistics display** below the video  
🌐 **Simple HTML frontend & FastAPI backend integration**  
🛠 **Modular design** for adding new exercises  

-------------------------------------------------------------------------------

## 📁 Folder Structure  

```
project/
├── backend/               # Backend API (FastAPI)
│   ├── bicep_curls.py     # Bicep curls logic
│   ├── deadlifts.py       # Deadlifts logic
│   ├── lunges.py          # Lunges logic
│   ├── pushups.py         # Pushups logic
│   ├── situps.py          # Situps logic
│   ├── squats.py          # Squats logic
│   ├── state.py           # Stores real-time exercise state
│   └── main.py            # API entry point (FastAPI)
│
├── frontend/              # Simple HTML/CSS/JS Frontend
│   ├── assets/            # Images, videos and other assets
│   ├── css/               # CSS styling files
│   ├── js/                # JavaScript modules
│   └── index.html         # Main HTML entry point
│
└── README.md              # Project documentation
```

-------------------------------------------------------------------------------

## 🛠 Installation  

### **1️⃣ Clone the Repository**  
```bash
git clone https://github.com/yourusername/ReGenix.git
cd ReGenix
```

### **2️⃣ Setup Virtual Environment (Recommended)**
It is recommended to use a **virtual environment** for the backend to avoid dependency conflicts.

#### **For Windows:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### **For macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

-------------------------------------------------------------------------------

## 🚀 Usage  

### **Run Backend Server (FastAPI)**
```bash
cd backend
source venv/bin/activate  # Activate the virtual environment (Linux/macOS)
# On Windows, use: venv\Scripts\activate

uvicorn main:app --reload
```
- The backend will start at **http://localhost:8000**.

### **Run Frontend**
Simply open the `frontend/index.html` file in your browser.

For the best experience, you can use a simple HTTP server:
```bash
cd frontend
# If you have Python installed
python -m http.server
```
Then open your browser to **http://localhost:8000**.

-------------------------------------------------------------------------------

## 🎯 How It Works  

1️⃣ **Frontend captures video feed** and extracts **pose landmarks** using MediaPipe.  
2️⃣ Only **landmark data** (not full video frames) is sent to the backend.  
3️⃣ The backend processes **rep counting, posture analysis, and stage tracking**.  
4️⃣ The **skeletal overlay is displayed on the video**, while rep stats are shown **below the video**.  

-------------------------------------------------------------------------------

## 📌 Supported Exercises  

✅ **Bicep Curls**  
✅ **Deadlifts**  
✅ **Lunges**  
✅ **Pushups**  
✅ **Situps**  
✅ **Squats**  

-------------------------------------------------------------------------------

## 🤖 Tech Stack  

- **Frontend:** HTML, CSS, JavaScript, MediaPipe Pose API  
- **Backend:** FastAPI, Python, OpenCV, NumPy  

-------------------------------------------------------------------------------

## 📜 License  

This project is **open-source** and available under the **MIT License**.

-------------------------------------------------------------------------------

## 💡 Future Improvements  

📌 **Add new exercises dynamically**  
🎨 **Improve UI/UX** with advanced overlays  
📊 **More detailed analytics** for form improvement  

-------------------------------------------------------------------------------

## 👨‍💻 Author  

Developed by **Debarun Joardar** 🚀  
For inquiries, contact **djoardar2001@gmail.com**
