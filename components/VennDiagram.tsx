import { useState, useEffect } from 'react';

interface VennDiagramProps {
  highlightModel: 'public' | 'private' | 'hybrid';
}

export default function VennDiagram({ highlightModel }: VennDiagramProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const getCircleOpacity = (circle: 'public' | 'private' | 'both') => {
    if (highlightModel === 'hybrid') return 'opacity-100';
    if (highlightModel === 'public' && circle === 'public') return 'opacity-100';
    if (highlightModel === 'private' && circle === 'private') return 'opacity-100';
    return 'opacity-40';
  };

  const getIntersectionOpacity = () => {
    return highlightModel === 'hybrid' ? 'opacity-100' : 'opacity-30';
  };

  return (
    <div className="flex items-center justify-center py-6">
      <svg
        width="100%"
        height="200"
        viewBox="0 0 400 200"
        className="max-w-md"
        role="img"
        aria-label="Venn diagram showing relationship between Public, Private, and Hybrid cloud deployment models"
      >
        <defs>
          <radialGradient id="publicGradient">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="privateGradient">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
          </radialGradient>
          <radialGradient id="hybridGradient">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        {/* Public Cloud Circle (Left - Cyan) */}
        <circle
          cx="140"
          cy="100"
          r="70"
          fill="url(#publicGradient)"
          stroke="#06b6d4"
          strokeWidth="2"
          className={`transition-all duration-700 ${getCircleOpacity('public')} ${
            animate ? 'scale-100' : 'scale-0'
          }`}
          style={{ transformOrigin: '140px 100px' }}
        />

        {/* Private Cloud Circle (Right - Green) */}
        <circle
          cx="260"
          cy="100"
          r="70"
          fill="url(#privateGradient)"
          stroke="#10b981"
          strokeWidth="2"
          className={`transition-all duration-700 delay-150 ${getCircleOpacity('private')} ${
            animate ? 'scale-100' : 'scale-0'
          }`}
          style={{ transformOrigin: '260px 100px' }}
        />

        {/* Hybrid Cloud Intersection Highlight */}
        <ellipse
          cx="200"
          cy="100"
          rx="30"
          ry="65"
          fill="url(#hybridGradient)"
          className={`transition-all duration-700 delay-300 ${getIntersectionOpacity()} ${
            animate ? 'scale-100' : 'scale-0'
          }`}
          style={{ transformOrigin: '200px 100px' }}
        />

        {/* Labels */}
        <text
          x="110"
          y="60"
          fill="#67e8f9"
          fontSize="13"
          fontWeight="600"
          textAnchor="middle"
          className={`transition-opacity duration-500 delay-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
        >
          Public
        </text>
        <text
          x="110"
          y="75"
          fill="#67e8f9"
          fontSize="13"
          fontWeight="600"
          textAnchor="middle"
          className={`transition-opacity duration-500 delay-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
        >
          Cloud
        </text>

        <text
          x="290"
          y="60"
          fill="#6ee7b7"
          fontSize="13"
          fontWeight="600"
          textAnchor="middle"
          className={`transition-opacity duration-500 delay-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
        >
          Private
        </text>
        <text
          x="290"
          y="75"
          fill="#6ee7b7"
          fontSize="13"
          fontWeight="600"
          textAnchor="middle"
          className={`transition-opacity duration-500 delay-500 ${animate ? 'opacity-100' : 'opacity-0'}`}
        >
          Cloud
        </text>

        <text
          x="200"
          y="95"
          fill="#c4b5fd"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          className={`transition-opacity duration-500 delay-700 ${animate ? 'opacity-100' : 'opacity-0'}`}
        >
          Hybrid
        </text>
        <text
          x="200"
          y="110"
          fill="#c4b5fd"
          fontSize="14"
          fontWeight="700"
          textAnchor="middle"
          className={`transition-opacity duration-500 delay-700 ${animate ? 'opacity-100' : 'opacity-0'}`}
        >
          Cloud
        </text>

        {/* Icon hints */}
        {/* Globe icon for Public */}
        <g className={`transition-opacity duration-500 delay-600 ${animate ? 'opacity-80' : 'opacity-0'}`}>
          <circle cx="110" cy="120" r="12" fill="none" stroke="#67e8f9" strokeWidth="1.5" />
          <path d="M 98 120 Q 110 110 122 120 M 98 120 Q 110 130 122 120" stroke="#67e8f9" strokeWidth="1.5" fill="none" />
          <line x1="110" y1="108" x2="110" y2="132" stroke="#67e8f9" strokeWidth="1.5" />
        </g>

        {/* Building icon for Private */}
        <g className={`transition-opacity duration-500 delay-600 ${animate ? 'opacity-80' : 'opacity-0'}`}>
          <rect x="282" y="115" width="16" height="18" fill="none" stroke="#6ee7b7" strokeWidth="1.5" />
          <rect x="284" y="118" width="3" height="3" fill="#6ee7b7" />
          <rect x="289" y="118" width="3" height="3" fill="#6ee7b7" />
          <rect x="294" y="118" width="3" height="3" fill="#6ee7b7" />
          <rect x="284" y="123" width="3" height="3" fill="#6ee7b7" />
          <rect x="289" y="123" width="3" height="3" fill="#6ee7b7" />
          <rect x="294" y="123" width="3" height="3" fill="#6ee7b7" />
        </g>

        {/* Arrow/Exchange icon for Hybrid */}
        <g className={`transition-opacity duration-500 delay-800 ${animate ? 'opacity-90' : 'opacity-0'}`}>
          <path 
            d="M 190 125 L 210 125 M 207 122 L 210 125 L 207 128" 
            stroke="#c4b5fd" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M 210 135 L 190 135 M 193 132 L 190 135 L 193 138" 
            stroke="#c4b5fd" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
