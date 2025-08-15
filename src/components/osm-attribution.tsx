import { FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa'

interface OSMAttributionProps {
  className?: string
  showLimitations?: boolean
}

export default function OSMAttribution({ className = '', showLimitations = false }: OSMAttributionProps) {
  return (
    <div className={`text-xs text-gray-600 font-nunito ${className}`}>
      <div className="flex items-center gap-1 mb-1">
        <FaMapMarkerAlt className="text-[#ef4e2d]" />
        <span>Powered by OpenStreetMap</span>
      </div>
      
      <div className="text-gray-500">
        © OpenStreetMap contributors (ODbL)
      </div>
      
      {showLimitations && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="flex items-start gap-2">
            <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-blue-800 mb-1">OpenStreetMap Limitations:</div>
              <ul className="text-blue-700 space-y-1">
                <li>• No ratings or price levels</li>
                <li>• No photos available</li>
                <li>• Limited location accuracy</li>
                <li>• Requires coordinates for search</li>
              </ul>
              <div className="mt-2 text-blue-600">
                For enhanced features, consider upgrading to premium Google Maps access.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
