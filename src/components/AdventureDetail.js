import React, { useState, useEffect, useCallback } from 'react';

function AdventureDetail({ adventure, onBack, onEdit, onDelete }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openViewer = (index) => {
    setCurrentImageIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  const goToPrevious = useCallback(() => {
    if (adventure.images && adventure.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? adventure.images.length - 1 : prev - 1
      );
    }
  }, [adventure.images]);

  const goToNext = useCallback(() => {
    if (adventure.images && adventure.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === adventure.images.length - 1 ? 0 : prev + 1
      );
    }
  }, [adventure.images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewerOpen) return;
      
      if (e.key === 'Escape') {
        closeViewer();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerOpen, goToPrevious, goToNext]);

  return (
    <div className="detail-view">
      <div className="detail-header">
        <div className="detail-header-buttons">
          <button className="back-btn" onClick={onBack}>
            ← Back to List
          </button>
          <button className="edit-btn" onClick={() => onEdit(adventure)}>
            ✏️ Edit Visit
          </button>
          <button className="delete-btn" onClick={() => onDelete(adventure)}>
            🗑️ Remove Visit
          </button>
        </div>
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
                  alt={`${adventure.name} ${index + 1}`}
                  className="gallery-image"
                  onClick={() => openViewer(index)}
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

      {/* Photo Viewer Modal */}
      {viewerOpen && adventure.images && (
        <div className="photo-viewer-overlay" onClick={closeViewer}>
          <div className="photo-viewer" onClick={(e) => e.stopPropagation()}>
            <button className="viewer-close-btn" onClick={closeViewer}>
              ✕
            </button>
            
            <button 
              className="viewer-nav-btn viewer-prev" 
              onClick={goToPrevious}
              disabled={adventure.images.length <= 1}
            >
              ‹
            </button>
            
            <div className="viewer-image-container">
              <img
                src={adventure.images[currentImageIndex]}
                alt={`${adventure.name} ${currentImageIndex + 1}`}
                className="viewer-image"
              />
            </div>
            
            <button 
              className="viewer-nav-btn viewer-next" 
              onClick={goToNext}
              disabled={adventure.images.length <= 1}
            >
              ›
            </button>
            
            <div className="viewer-counter">
              {currentImageIndex + 1} / {adventure.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdventureDetail;
