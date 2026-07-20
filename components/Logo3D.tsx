import React from 'react';

export const Logo3D = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      {/* Official F1 Vector Logo */}
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg" 
        alt="Formula 1" 
        style={{ height: '32px', width: 'auto', flexShrink: 0, filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))' }} 
      />
      
      {/* Crisp App Branding */}
      <div className="brand-text" style={{ paddingTop: '4px' }}>
        DASH
      </div>
    </div>
  );
};
