
import React from 'react';
import { Plus, Minus } from 'lucide-react'; 
import './TripMapSection.css';


const TripMapSection = () => {

  return (
    <div className="trip-detail-map-container" style={{ position: 'relative' }}>
      
      
      <div className="map-zoom-controls">
        <button className="zoom-btn" aria-label="Zoom In">
          <Plus size={20} />
        </button>
        <button className="zoom-btn" aria-label="Zoom Out">
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
};

export default TripMapSection;