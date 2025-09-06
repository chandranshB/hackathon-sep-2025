# AirWatch - Technical Specifications & Architecture

## 🚀 Technology Stack

### Frontend Framework
- **React 18.3.1** - Modern functional components with hooks
- **TypeScript** - Type-safe development environment
- **Vite** - Lightning-fast build tool and development server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Radix UI** - Headless, accessible component primitives
- **Shadcn/ui** - Beautiful, customizable component library
- **Lucide React** - Consistent, scalable icon system
- **Next Themes** - Dark/light mode support

### Maps & Geolocation
- **Leaflet 1.9.4** - Open-source JavaScript mapping library
- **React Leaflet 5.0.0** - React components for Leaflet maps
- **OpenStreetMap** - Free, collaborative map data
- **Leaflet.heat** - Heatmap overlay for pollution visualization
- **Nominatim API** - Reverse geocoding for address resolution

### State Management & Data
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** - Performant form handling
- **Zod** - Runtime type validation
- **Date-fns** - Modern date utility library

### PWA & Performance
- **Vite PWA Plugin** - Service worker generation and manifest
- **Service Worker** - Offline functionality and caching
- **Web App Manifest** - Native app-like experience
- **WebP Image Compression** - Optimized image storage

### Development Tools
- **ESLint** - Code linting and style enforcement
- **PostCSS** - CSS post-processing
- **Path Aliases** - Clean import statements with @/ prefix

## 🏗️ Architecture Overview

### Component Structure
```
src/
├── components/
│   ├── ui/                    # Reusable UI components (Shadcn)
│   ├── PollutionMap.tsx       # Interactive Leaflet map component
│   ├── ReportForm.tsx         # Pollution reporting form
│   ├── PublicDashboard.tsx    # Citizen-facing dashboard
│   ├── GovernmentDashboard.tsx # Authority dashboard
│   └── Header.tsx             # Navigation header
├── pages/
│   ├── Index.tsx              # Main application page
│   └── NotFound.tsx           # 404 error page
├── hooks/
│   ├── use-toast.ts           # Toast notification hook
│   └── use-mobile.tsx         # Mobile detection hook
├── lib/
│   └── utils.ts               # Utility functions
└── assets/                    # Static assets and images
```

### Data Flow Architecture
1. **Presentation Layer** - React components with TypeScript
2. **State Management** - React hooks + React Query for server state
3. **Business Logic** - Custom hooks and utility functions
4. **Data Access** - API calls with error handling and caching
5. **External Services** - Maps API, geolocation, image processing

## 🗺️ Map System Implementation

### Leaflet Configuration
- **Base Layer**: OpenStreetMap tiles
- **Custom Markers**: Pollution level indicators with HSL color coding
- **Heatmap Overlay**: Dynamic pollution visualization
- **Interactive Popups**: Detailed zone information
- **Responsive Design**: Mobile-optimized controls

### Pollution Data Visualization
```typescript
// Color coding based on AQI levels
const aqiColors = {
  excellent: 'hsl(120, 61%, 34%)',  // Green
  good: 'hsl(75, 70%, 41%)',        // Light Green
  moderate: 'hsl(45, 93%, 47%)',    // Yellow
  poor: 'hsl(25, 95%, 53%)',        // Orange
  severe: 'hsl(0, 84%, 60%)',       // Red
  hazardous: 'hsl(300, 76%, 32%)'   // Purple
};
```

### Geographic Focus
- **Primary Location**: Dehradun, Uttarakhand (30.3165°N, 78.0322°E)
- **Coverage Area**: Major urban zones and industrial areas
- **Zoom Levels**: City-wide to street-level detail
- **Location Services**: GPS-based user positioning

## 📱 Progressive Web App Features

### Service Worker Capabilities
- **Offline Functionality**: Core features work without internet
- **Background Sync**: Queue reports when offline
- **Push Notifications**: Alert for pollution level changes
- **Update Management**: Automatic app updates

### Installation Features
- **Add to Home Screen**: Native app-like installation
- **Splash Screen**: Custom branding during app launch
- **Shortcuts**: Quick actions from home screen
- **Icon Set**: Adaptive icons for various device types

### Performance Optimizations
- **Code Splitting**: Lazy-loaded components
- **Image Optimization**: WebP conversion with compression
- **Caching Strategy**: Intelligent resource caching
- **Bundle Size**: Optimized for mobile networks

## 🔐 Security & Privacy

### Data Protection
- **Client-side Image Processing**: No sensitive data sent to server
- **Location Privacy**: Precise coordinates stored locally
- **Form Validation**: Input sanitization and validation
- **XSS Protection**: React's built-in security features

### API Security
- **Rate Limiting**: Prevent abuse of reporting system
- **Input Validation**: Server-side data verification
- **Authentication**: Secure user identification
- **HTTPS Only**: Encrypted data transmission

## 📊 Real-time Data Integration

### Sensor Data Pipeline
1. **IoT Sensors** → **Edge Computing** → **Cloud Processing**
2. **Data Validation** → **Quality Checks** → **Database Storage**
3. **Real-time Updates** → **WebSocket/SSE** → **Frontend Updates**
4. **Caching Layer** → **CDN Distribution** → **Global Availability**

### Data Sources Integration
- **Government APIs**: Official pollution monitoring stations
- **Citizen Reports**: Crowdsourced pollution incidents
- **Satellite Data**: Remote sensing for large-scale monitoring
- **Weather APIs**: Environmental context for pollution levels

## 🎨 Design System

### Color Palette (HSL)
```css
/* Authority & Trust */
--primary: 219 43% 24%;           /* Deep Government Blue */
--primary-foreground: 0 0% 98%;   /* White */

/* Pollution Levels */
--air-excellent: 120 61% 34%;     /* Deep Green */
--air-good: 75 70% 41%;           /* Light Green */
--air-moderate: 45 93% 47%;       /* Yellow */
--air-poor: 25 95% 53%;           /* Orange */
--air-severe: 0 84% 60%;          /* Red */
--air-hazardous: 300 76% 32%;     /* Purple */
```

### Typography Scale
- **Headlines**: Inter font family, responsive sizing
- **Body Text**: Optimized for readability across devices
- **Data Display**: Monospace for numerical values
- **Icons**: Lucide React for consistency

### Responsive Breakpoints
- **Mobile**: < 768px (touch-optimized)
- **Tablet**: 768px - 1024px (hybrid navigation)
- **Desktop**: > 1024px (full feature set)
- **Large Screens**: > 1400px (expanded layouts)

## 🔧 Build & Deployment

### Development Workflow
```bash
# Development server
npm run dev          # Vite dev server with HMR

# Production build
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build locally

# Code quality
npm run lint         # ESLint code checking
npm run type-check   # TypeScript validation
```

### Production Optimizations
- **Tree Shaking**: Remove unused code
- **Minification**: Compressed JavaScript and CSS
- **Asset Optimization**: Compressed images and fonts
- **CDN Ready**: Static asset hosting optimization

### Browser Support
- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 88+
- **PWA Support**: Chrome, Edge, Samsung Internet
- **Fallbacks**: Graceful degradation for older browsers

## 📈 Performance Metrics

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

### Monitoring & Analytics
- **Performance Monitoring**: Real User Monitoring (RUM)
- **Error Tracking**: Crash reporting and debugging
- **Usage Analytics**: Feature adoption and user behavior
- **A/B Testing**: Feature optimization and user experience

## 🔄 Future Scalability

### Microservices Architecture
- **API Gateway**: Centralized request routing
- **Authentication Service**: User management and security
- **Notification Service**: Push notifications and alerts
- **Data Processing**: Real-time analytics and ML

### Cloud Infrastructure
- **Container Deployment**: Docker + Kubernetes
- **Auto Scaling**: Dynamic resource allocation
- **Global CDN**: Worldwide content distribution
- **Database Scaling**: Horizontal scaling strategies

This technical specification provides a comprehensive overview of the AirWatch pollution monitoring system's architecture, implementation details, and technical capabilities.