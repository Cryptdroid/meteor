# Asteroid Impact Simulator

A comprehensive web-based platform for simulating asteroid impacts, visualizing orbital mechanics, and evaluating planetary defense strategies.

![Asteroid Impact Simulator](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=flat&logo=fastapi)

## 🌍 Features

### Core Functionality
- **Real-time NASA NEO Data**: Fetch and display Near-Earth Objects from NASA's API
- **Advanced Impact Simulation**: Calculate impact energy, crater size, seismic effects, and tsunami propagation
- **USGS Geological Integration**: Real terrain data and elevation for accurate crater modeling
- **Population Density Analysis**: Casualty calculations using real population data
- **3D Orbital Visualization**: Interactive Three.js/React Three Fiber visualization of asteroid orbits
- **2D Impact Mapping**: Leaflet-based Earth surface maps with impact zone overlays
- **Augmented Reality Mode**: View asteroids in real-world space using WebXR AR on mobile devices
- **Deflection Strategies**: Simulate kinetic impactor, gravity tractor, and laser ablation missions
- **Defend Earth Game Mode**: Interactive scenario-based planetary defense challenge

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support (Ctrl+Enter to simulate, Ctrl+R to reset, Tab navigation)
- **Colorblind Modes**: Support for deuteranopia, protanopia, and tritanopia
- **Educational Tooltips**: 30+ scientific terms with formulas and examples
- **Screen Reader Support**: ARIA labels and semantic HTML throughout

### Technical Highlights
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion, GSAP
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei, @react-three/xr
- **WebXR**: Augmented Reality support for mobile devices (iOS ARKit, Android ARCore)
- **Backend**: Python FastAPI with scientific calculations
- **API Caching**: Intelligent caching layer for USGS and Nominatim APIs
- **State Management**: Zustand
- **Mapping**: Leaflet.js / React-Leaflet with click-to-place functionality
- **UI Components**: shadcn/ui with custom space theme

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- NASA API Key (get free at https://api.nasa.gov/)

### Frontend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
echo "NEXT_PUBLIC_NASA_API_KEY=your_api_key_here" > .env.local

# Optional: Enable Python backend for simulations
echo "NEXT_PUBLIC_USE_BACKEND=false" >> .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" >> .env.local

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```

Backend API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

## 📚 Project Structure

```
asteroid-impact-simulator/
├── app/                        # Next.js app directory
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── dashboard/             # Dashboard page
│   └── ar/                    # AR Mode page
│       └── page.tsx
├── components/
│   ├── 3d/                    # Three.js 3D components
│   │   ├── AsteroidModel.tsx
│   │   ├── EarthModel.tsx
│   │   └── OrbitPath.tsx
│   ├── ar/                    # Augmented Reality components
│   │   ├── ARScene.tsx
│   │   ├── ARContent.tsx
│   │   ├── ARAsteroidModel.tsx
│   │   ├── AREarthModel.tsx
│   │   ├── AROrbitPath.tsx
│   │   ├── ARImpactZone.tsx
│   │   ├── ARControls.tsx
│   │   ├── ARHitTest.tsx
│   │   └── ARDistanceMeasurement.tsx
│   ├── dashboard/             # Main dashboard components
│   │   ├── AsteroidList.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── DashboardMain.tsx
│   │   ├── DefendEarthMode.tsx
│   │   ├── ImpactMap.tsx
│   │   ├── ImpactResults.tsx
│   │   └── OrbitalView.tsx
│   ├── layout/                # Layout components
│   │   └── Header.tsx
│   └── ui/                    # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── slider.tsx
│       └── LoadingScreen.tsx
├── lib/                       # Utility libraries
│   ├── cache-service.ts      # API response caching
│   ├── educational-content.ts # Educational terms database
│   ├── impact-simulator.ts   # Impact calculation logic
│   ├── keyboard-handler.ts   # Keyboard shortcuts system
│   ├── nasa-service.ts       # NASA API integration
│   ├── orbital-mechanics.ts  # Orbital physics calculations
│   ├── population-service.ts # Population density data
│   ├── usgs-service.ts       # USGS geological data
│   └── utils.ts              # Helper functions
├── store/                     # State management
│   ├── useAppStore.ts        # Main application state
│   ├── useGameStore.ts       # Game mode state
│   └── useARStore.ts         # AR mode state
├── types/                     # TypeScript definitions
│   └── index.ts
├── backend/                   # Python FastAPI backend
│   ├── main.py               # FastAPI app entry
│   ├── models.py             # Pydantic models
│   ├── simulation.py         # Impact simulation logic
│   ├── routers/
│   │   ├── asteroids.py     # NASA API endpoints
│   │   ├── deflection.py    # Deflection calculations
│   │   └── simulation.py    # Simulation endpoints
│   └── requirements.txt      # Python dependencies
├── AR_USER_GUIDE.md          # AR mode user documentation
├── AR_TECHNICAL_DOCS.md      # AR implementation docs
└── README.md

## 🎮 Usage Guide

### Keyboard Shortcuts
- **Ctrl+Enter**: Run simulation
- **Ctrl+R**: Reset parameters
- **Tab**: Navigate through controls
- **Arrow Keys**: Adjust slider values
- **Ctrl+Shift+H**: Toggle keyboard hints
- **Escape**: Close modals/unfocus inputs

### Accessibility Options
1. **Colorblind Mode**: Click the eye icon in the header to cycle through:
   - Default (normal vision)
   - Deuteranopia (red-green colorblindness)
   - Protanopia (red-weak colorblindness)
   - Tritanopia (blue-yellow colorblindness)

2. **Keyboard Hints**: See available shortcuts at the bottom of the Control Panel

3. **Educational Tooltips**: Hover over info icons to see scientific explanations

### Dashboard View
1. **Asteroid List**: Browse real NASA NEO data, search and filter asteroids
2. **Control Panel**: Adjust impact parameters (size, density, velocity, angle)
3. **Impact Map**: Click anywhere on the map or select a major city from the dropdown
4. **Run Simulation**: Click "Run Simulation" or press Ctrl+Enter
5. **View Results**: See energy, crater size, seismic effects, casualties with terrain and population data
6. **Impact Map**: Visualize affected zones on interactive Earth map

### Orbital View
1. Switch to "Orbital View" in the navigation
2. Select an asteroid to visualize its orbit around the Sun
3. View Earth's orbit and asteroid trajectory in 3D space
4. Use mouse to rotate, zoom, and pan the visualization

### Defend Earth Mode
1. Click "Defend Earth" to start the game
2. Read the scenario description
3. Choose a deflection strategy:
   - **Kinetic Impactor**: Fast, proven technology
   - **Gravity Tractor**: Slow but precise
   - **Laser Ablation**: Experimental, variable effectiveness
4. Deploy before time runs out!
5. View your score based on timing and success

### Augmented Reality Mode
1. Access AR mode by clicking **"AR Mode"** in the navigation bar
2. Allow camera permissions when prompted
3. Click **"Enter AR"** to start the AR session
4. Point camera at a flat surface (table, floor)
5. Tap to place the asteroid scene in real space
6. Interact with asteroids:
   - **Tap**: Select asteroid to see details
   - **Pinch**: Scale the entire scene
   - **Two fingers**: Rotate view
7. Toggle settings with the ⚙️ icon:
   - Scale adjustment
   - Grid/labels/orbits visibility
   - Impact simulation
8. View real-time NASA data in AR space

**AR Requirements:**
- Mobile device with ARKit (iOS 15+) or ARCore (Android 8+)
- Modern mobile browser (Safari on iOS, Chrome on Android)
- Camera permissions enabled
- Good lighting conditions

For detailed AR instructions, see [AR_USER_GUIDE.md](AR_USER_GUIDE.md)

## 🔬 Scientific Background

### Impact Energy Calculation
```
E = 0.5 × m × v²
```
Where:
- m = mass (calculated from size and density)
- v = velocity

### Crater Scaling Laws (Collins et al., 2005)
```
D = K × E^(1/3.4)
```
Where:
- D = crater diameter
- K = scaling constant (1.2 for land, 1.8 for water)
- E = energy in megatons TNT

### Seismic Magnitude (Richter Scale)
```
M = (2/3) × (log₁₀(E) - 4.8)
```

### Deflection Delta-V (Kinetic Impactor)
```
Δv = (β × m_impactor × v_impactor) / m_asteroid
```
Where β is the momentum enhancement factor (1.5-3.0)

## 🛠️ API Endpoints

### Simulation
- `POST /api/simulation/simulate` - Run full impact simulation
- `GET /api/simulation/energy-estimate` - Quick energy calculation

### Asteroids (NASA Data)
- `GET /api/asteroids/neo/feed` - Get NEO feed by date range
- `GET /api/asteroids/neo/{id}` - Get specific asteroid details
- `GET /api/asteroids/neo/browse` - Browse all NEOs
- `GET /api/asteroids/statistics` - Get NEO statistics

### Deflection
- `POST /api/deflection/calculate` - Calculate deflection parameters
- `GET /api/deflection/strategies` - List available strategies

## 🎨 Customization

### Theme Colors (tailwind.config.ts)
```typescript
colors: {
  space: {
    dark: "#0a0e27",
    blue: "#1a2d50",
    purple: "#2d1b69",
    cyan: "#00d4ff",
    neon: "#00ff9f",
  }
}
```

### Custom Impact Parameters
Modify default parameters in `store/useAppStore.ts`:
```typescript
impactParameters: {
  size: 500,        // meters
  density: 3000,    // kg/m³
  velocity: 20,     // km/s
  angle: 45,        // degrees
}
```

## 📊 Data Sources

- **NASA NEO API**: https://api.nasa.gov/
- **Orbital Elements**: JPL Small-Body Database
- **Impact Physics**: Collins et al. (2005), Holsapple (1993)
- **Seismic Data**: Schultz & Gault (1975)

## 🚧 Future Enhancements

- [ ] PostgreSQL database integration
- [ ] Machine learning impact prediction
- [x] **WebXR/AR mode for mobile devices** ✅ **COMPLETED**
- [ ] PDF report generation
- [ ] Social media sharing from AR sessions
- [ ] Multi-language support
- [ ] Real-time multiplayer Defend Earth mode
- [ ] Persistent AR anchors (cloud anchors)
- [ ] AR recording and screenshot functionality
- [ ] Multi-user AR sessions
- [ ] Historical impact database

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- NASA for providing the NEO API
- Scientific community for impact modeling research
- Three.js and React Three Fiber communities
- shadcn/ui for component library

## 📞 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ for planetary defense education and awareness**
