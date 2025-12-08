import React, { useState, useRef, useEffect } from 'react';

function RecordVisitModal({ adventure, onSave, onClose, isEditing }) {
  const [dateVisited, setDateVisited] = useState('');
  const [memories, setMemories] = useState('');
  const [images, setImages] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Pre-populate fields when editing
  useEffect(() => {
    if (isEditing && adventure.visited) {
      setDateVisited(adventure.dateVisited || '');
      setMemories(adventure.memories || '');
      if (adventure.images && adventure.images.length > 0) {
        setImages(adventure.images.map((img, index) => ({
          id: Date.now() + index,
          dataUrl: img,
          name: `photo-${index + 1}`
        })));
        // Find the thumbnail index
        if (adventure.thumbnail) {
          const thumbIdx = adventure.images.findIndex(img => img === adventure.thumbnail);
          setThumbnailIndex(thumbIdx >= 0 ? thumbIdx : 0);
        }
      }
    }
  }, [isEditing, adventure]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          dataUrl: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (thumbnailIndex >= newImages.length) {
        setThumbnailIndex(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
  };

  const handleSetThumbnail = (index) => {
    setThumbnailIndex(index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSave({
      dateVisited,
      memories,
      images: images.map(img => img.dataUrl),
      thumbnail: images.length > 0 ? images[thumbnailIndex].dataUrl : null,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? '✏️ Edit Your Visit' : '🎉 Record Your Visit!'}</h2>
          <p>{adventure.name}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label>📅 Date Visited</label>
            <input
              type="date"
              value={dateVisited}
              onChange={(e) => setDateVisited(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>💭 Memories</label>
            <textarea
              value={memories}
              onChange={(e) => setMemories(e.target.value)}
              placeholder="What fun things did you do? What do you remember most about this adventure?"
            />
          </div>
          
          <div className="form-group">
            <label>📷 Photos</label>
            <div
              className="image-upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
              />
              <div className="upload-icon">📸</div>
              <p>Click to add photos from your adventure!</p>
            </div>
            
            {images.length > 0 && (
              <div className="uploaded-images">
                {images.map((image, index) => (
                  <div key={image.id} className="uploaded-image-container">
                    <img
                      src={image.dataUrl}
                      alt={`Upload ${index + 1}`}
                      className={`uploaded-image ${index === thumbnailIndex ? 'thumbnail' : ''}`}
                      onClick={() => handleSetThumbnail(index)}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ✕
                    </button>
                    {index === thumbnailIndex && (
                      <span className="thumbnail-label">Thumbnail</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {images.length > 0 && (
              <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                Click an image to set it as the thumbnail
              </p>
            )}
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? '💾 Update Adventure!' : '🎊 Save Adventure!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordVisitModal;
