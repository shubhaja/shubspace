# S(h)ubspace - Interactive Face Blending

## Phase 1: Foundation & Setup ✅ COMPLETE!

### What's Been Implemented

1. **Project Structure**
   - Next.js 15 with TypeScript
   - Tailwind CSS for styling
   - Shadcn UI component library
   - Directory structure for morphing algorithms

2. **UI Components**
   - **ShubGrid**: 2x3 grid layout with placeholder images
     - 5 original Shub images (top row + bottom left two)
     - 1 interactive composite (bottom right)
   - **ControlPanel**: Interactive sliders for weight adjustment
     - Individual sliders for each Shub (0-100%)
     - Automatic normalization to ensure weights sum to 100%
     - Preset buttons: "Equal Mix" and "Random Mix"
     - Export button (placeholder)

3. **State Management**
   - Global context (ShubspaceContext) for weight management
   - Real-time updates between sliders and grid display
   - Synchronized state across components

### How to Test

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

4. Test the following:
   - Adjust sliders - percentages should update in real-time
   - Weights should automatically normalize to 100%
   - "Equal Mix" button should set all weights to 20%
   - "Random Mix" button should generate random weights
   - UI should be responsive and visually appealing

### Directory Structure

```
shubspace-web/
├── app/
│   ├── page.tsx          # Main page
│   ├── layout.tsx        # Root layout with context provider
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Shadcn UI components
│   └── shubspace/
│       ├── ShubGrid.tsx      # 2x3 grid display
│       └── ControlPanel.tsx  # Weight control sliders
├── lib/
│   ├── context/
│   │   └── ShubspaceContext.tsx  # Global state management
│   ├── morphing/         # (To be implemented)
│   ├── face-detection/   # (To be implemented)
│   └── triangulation/    # (To be implemented)
└── public/
    └── images/           # (Ready for Shub images)
```

### Deployment to shubhaj.com/shubspace

To deploy the site:
```bash
# Build for production
npm run export
# Or use the helper script
./deploy.sh
```

Then upload the contents of the `out` folder to your server's `/shubspace` directory.

## Phase 2: Automatic Face Detection & Landmarks ✅ COMPLETE!

### What's Been Implemented

1. **Face Detection Library**
   - Integrated face-api.js for automatic face detection
   - Downloads and loads SSD MobileNet v1 and 68-point landmark models
   - Detects faces and extracts 68 facial landmark points

2. **Face Preprocessing Component**
   - Interactive UI to start face detection process
   - Progress bar showing processing status
   - Visual feedback for each processed image
   - Canvas-based landmark visualization

3. **Landmark Storage & Management**
   - Global context stores detected landmarks
   - Normalized coordinates (0-1 range) for consistent processing
   - Persistent storage across component renders

4. **Visual Debugging Tools**
   - LandmarkViewer component shows all detected faces
   - Click-to-view detailed landmark visualization
   - Color-coded landmark points on face images

### How Face Detection Works

1. **Click "Start Face Detection"** button
2. Models load from `/public/models/`
3. Each Shub image is processed:
   - Face is detected using SSD MobileNet
   - 68 landmark points are extracted
   - Points are normalized to 0-1 coordinates
4. Results are stored in global context
5. Landmark visualization appears

## Phase 3: Core Morphing Engine ✅ COMPLETE!

### What's Been Implemented

1. **Delaunay Triangulation**
   - Fast triangulation using Delaunator library
   - Creates mesh of triangles for smooth morphing
   - Includes boundary points for edge handling
   - Visualizer component to see the mesh

2. **Morphing Algorithm**
   - Weighted landmark averaging
   - Affine transformations for triangle warping
   - Pixel-perfect blending of multiple images
   - Real-time updates as weights change

3. **Interactive Composite Display**
   - Live preview in bottom-right grid position
   - Updates instantly when sliders move
   - Shows "morphing" indicator during processing
   - Maintains aspect ratio and quality

4. **Export Functionality**
   - Download composite as PNG
   - Timestamped filenames
   - High-quality output (400x400px)

### How the Morphing Works

1. **Weighted Landmarks**: Calculate average positions based on slider weights
2. **Triangulation**: Create Delaunay mesh from averaged landmarks
3. **Warping**: Transform each source image to match target shape
4. **Blending**: Combine warped images using weighted pixel values
5. **Display**: Show result in real-time on canvas

### Testing the Morphing

1. Complete face detection first (Phase 2)
2. Adjust sliders to see real-time morphing
3. Click "Show Triangulation" to see the mesh
4. Try preset combinations (Equal Mix, Random Mix)
5. Export your favorite composite

### Next Steps (Phase 4)
- Add animation between presets
- Implement shape-only vs color-only modes
- Add more preset combinations
- Optimize performance for mobile

### Technologies Used
- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Context API

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
