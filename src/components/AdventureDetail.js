import React from 'react';

function AdventureDetail({ adventure, onBack }) {
  return (
    <div className="detail-view">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to List
        </button>
        <h2>🎉 {adventure.name}</h2>
        {adventure.dateVisited && (
          <p>
            📅 Visited on {new Date(adventure.dateVisited).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>
      
      <div className="detail-content">
        {adventure.memories && (
          <div className="detail-section">
            <h3>💭 Our Memories</h3>
            <div className="memories-text">
              {adventure.memories}
            </div>
          </div>
        )}
        
        {adventure.images && adventure.images.length > 0 && (
          <div className="detail-section">
            <h3>📷 Photos</h3>
            <div className="photo-gallery">
              {adventure.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${adventure.name} - Photo ${index + 1}`}
                  className="gallery-image"
                />
              ))}
            </div>
          </div>
        )}
        
        {!adventure.memories && (!adventure.images || adventure.images.length === 0) && (
          <div className="detail-section">
            <p style={{ textAlign: 'center', color: '#666' }}>
              No memories or photos recorded yet for this adventure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdventureDetail;
