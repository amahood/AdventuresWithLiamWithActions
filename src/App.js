import React, { useState, useEffect } from 'react';
import { waStateParks } from './data/waStateParks';
import { usStates } from './data/usStates';
import { nationalParks } from './data/nationalParks';
import { countries } from './data/countries';
import AdventureList from './components/AdventureList';
import RecordVisitModal from './components/RecordVisitModal';
import AdventureDetail from './components/AdventureDetail';

const TABS = [
  { id: 'wa-parks', name: 'WA State Parks', emoji: '🏕️', color: 'wa-parks' },
  { id: 'us-states', name: 'US States', emoji: '🗺️', color: 'us-states' },
  { id: 'national-parks', name: 'National Parks', emoji: '🏞️', color: 'national-parks' },
  { id: 'countries', name: 'Countries', emoji: '🌍', color: 'countries' },
];

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

function App() {
  const [activeTab, setActiveTab] = useState('wa-parks');
  const [adventures, setAdventures] = useState({
    'wa-parks': waStateParks.map(name => ({ id: name, name, visited: false })),
    'us-states': usStates.map(name => ({ id: name, name, visited: false })),
    'national-parks': nationalParks.map(name => ({ id: name, name, visited: false })),
    'countries': countries.map(name => ({ id: name, name, visited: false })),
  });
  const [selectedAdventure, setSelectedAdventure] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingAdventure, setViewingAdventure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisited, setFilterVisited] = useState('all'); // 'all', 'visited', 'not-visited'

  // Load adventures from API on mount
  useEffect(() => {
    const loadAdventures = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/adventures`);
        if (response.ok) {
          const data = await response.json();
          if (data && Object.keys(data).length > 0) {
            // Merge API data with default lists
            setAdventures(prev => {
              const mergedAdventures = { ...prev };
              Object.keys(data).forEach(category => {
                if (mergedAdventures[category]) {
                  mergedAdventures[category] = mergedAdventures[category].map(adventure => {
                    const savedAdventure = data[category].find(a => a.id === adventure.id);
                    return savedAdventure ? { ...adventure, ...savedAdventure } : adventure;
                  });
                }
              });
              return mergedAdventures;
            });
          }
        }
      } catch (error) {
        console.log('Using local storage as fallback');
        // Fallback to localStorage if API is not available
        const saved = localStorage.getItem('adventures');
        if (saved) {
          const savedData = JSON.parse(saved);
          setAdventures(prev => {
            const mergedAdventures = { ...prev };
            Object.keys(savedData).forEach(category => {
              if (mergedAdventures[category]) {
                mergedAdventures[category] = mergedAdventures[category].map(adventure => {
                  const savedAdventure = savedData[category].find(a => a.id === adventure.id);
                  return savedAdventure ? { ...adventure, ...savedAdventure } : adventure;
                });
              }
            });
            return mergedAdventures;
          });
        }
      }
      setLoading(false);
    };
    
    loadAdventures();
  }, []);

  const saveAdventure = async (category, adventure) => {
    try {
      const response = await fetch(`${API_BASE_URL}/adventures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, adventure }),
      });
      if (!response.ok) throw new Error('API save failed');
    } catch (error) {
      console.log('Saving to localStorage as fallback');
      localStorage.setItem('adventures', JSON.stringify(adventures));
    }
  };

  const handleRecordVisit = (adventure) => {
    setSelectedAdventure(adventure);
    setIsEditing(false);
    setShowRecordModal(true);
  };

  const handleEditVisit = (adventure) => {
    setSelectedAdventure(adventure);
    setIsEditing(true);
    setShowRecordModal(true);
    setViewingAdventure(null);
  };

  const handleSaveVisit = async (visitData) => {
    const updatedAdventures = { ...adventures };
    const categoryAdventures = updatedAdventures[activeTab];
    const index = categoryAdventures.findIndex(a => a.id === selectedAdventure.id);
    
    if (index !== -1) {
      categoryAdventures[index] = {
        ...categoryAdventures[index],
        ...visitData,
        visited: true,
      };
      setAdventures(updatedAdventures);
      await saveAdventure(activeTab, categoryAdventures[index]);
    }
    
    setShowRecordModal(false);
    setSelectedAdventure(null);
    setIsEditing(false);
    
    // If we were editing from detail view, update the viewing adventure
    if (isEditing && viewingAdventure) {
      const updatedAdventure = updatedAdventures[activeTab].find(a => a.id === selectedAdventure.id);
      if (updatedAdventure) {
        setViewingAdventure(updatedAdventure);
      }
    }
  };

  const handleViewAdventure = (adventure) => {
    if (adventure.visited) {
      setViewingAdventure(adventure);
    }
  };

  const handleDeleteVisit = async (adventure) => {
    if (!window.confirm(`Are you sure you want to remove the visit record for "${adventure.name}"? This will delete all memories and photos for this adventure.`)) {
      return;
    }

    const updatedAdventures = { ...adventures };
    const categoryAdventures = updatedAdventures[activeTab];
    const index = categoryAdventures.findIndex(a => a.id === adventure.id);
    
    if (index !== -1) {
      // Reset the adventure to unvisited state
      categoryAdventures[index] = {
        id: adventure.id,
        name: adventure.name,
        visited: false,
      };
      setAdventures(updatedAdventures);
      await saveAdventure(activeTab, categoryAdventures[index]);
    }
    
    setViewingAdventure(null);
  };

  const handleBackToList = () => {
    setViewingAdventure(null);
  };

  const currentAdventures = adventures[activeTab] || [];
  const filteredAdventures = currentAdventures.filter(adventure => {
    const matchesSearch = adventure.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVisited === 'all' || 
      (filterVisited === 'visited' && adventure.visited) ||
      (filterVisited === 'not-visited' && !adventure.visited);
    return matchesSearch && matchesFilter;
  });
  const visitedCount = currentAdventures.filter(a => a.visited).length;
  const totalCount = currentAdventures.length;
  const progressPercent = totalCount > 0 ? (visitedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🌟 Adventures with Liam 🌟</h1>
        <p>Exploring the world together, one adventure at a time!</p>
      </header>

      <nav className="tab-navigation">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${tab.color} ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setViewingAdventure(null);
              setSearchTerm('');
              setFilterVisited('all');
            }}
          >
            <span className="tab-emoji">{tab.emoji}</span>
            {tab.name}
          </button>
        ))}
      </nav>

      {viewingAdventure ? (
        <AdventureDetail
          adventure={viewingAdventure}
          onBack={handleBackToList}
          onEdit={handleEditVisit}
          onDelete={handleDeleteVisit}
        />
      ) : (
        <>
          <div className="progress-counter">
            <div className="progress-text">
              {visitedCount} / {totalCount}
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="progress-label">
                {TABS.find(t => t.id === activeTab)?.name} Visited
              </div>
            </div>
          </div>

          <div className="adventure-list">
            <div className="search-filter-container">
              <div className="search-box">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search adventures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterVisited === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterVisited('all')}
                >
                  📋 All
                </button>
                <button
                  className={`filter-btn ${filterVisited === 'visited' ? 'active' : ''}`}
                  onClick={() => setFilterVisited('visited')}
                >
                  ✅ Visited
                </button>
                <button
                  className={`filter-btn ${filterVisited === 'not-visited' ? 'active' : ''}`}
                  onClick={() => setFilterVisited('not-visited')}
                >
                  ⭕ Not Visited
                </button>
              </div>
            </div>
            <AdventureList
              adventures={filteredAdventures}
              onRecordVisit={handleRecordVisit}
              onViewAdventure={handleViewAdventure}
            />
          </div>
        </>
      )}

      {showRecordModal && selectedAdventure && (
        <RecordVisitModal
          adventure={selectedAdventure}
          onSave={handleSaveVisit}
          onClose={() => {
            setShowRecordModal(false);
            setSelectedAdventure(null);
            setIsEditing(false);
          }}
          isEditing={isEditing}
        />
      )}
    </div>
  );
}

export default App;
