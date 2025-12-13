import React from 'react';

function AdventureList({ adventures, onRecordVisit, onViewAdventure, isAdmin }) {
  return (
    <div className="adventure-grid">
      {adventures.map(adventure => (
        <div
          key={adventure.id}
          className={`adventure-card ${adventure.visited ? 'visited' : ''}`}
          onClick={() => onViewAdventure(adventure)}
        >
          <div className="adventure-card-header">
            <div className={`adventure-checkbox ${adventure.visited ? 'checked' : ''}`}>
              {adventure.visited ? '✓' : ''}
            </div>
            <span className="adventure-name">{adventure.name}</span>
          </div>
          
          {adventure.visited && adventure.thumbnail && (
            <img
              src={adventure.thumbnail}
              alt={adventure.name}
              className="adventure-thumbnail"
            />
          )}
          
          {adventure.visited && adventure.dateVisited && (
            <div className="adventure-date">
              📅 {new Date(adventure.dateVisited).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
          
          {!adventure.visited && isAdmin && (
            <button
              className="record-visit-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRecordVisit(adventure);
              }}
            >
              📸 Record Visit
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdventureList;
