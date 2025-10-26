import React from 'react';
import './SportsGallery.css';

const SportsGallery: React.FC = () => {
  const sportsData = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'NBA',
      description: 'Professional Basketball',
      color: '#ff6b35'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'NFL',
      description: 'Professional Football',
      color: '#00d4aa'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'NCAA Basketball',
      description: 'College Basketball',
      color: '#f7931e'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'WNBA',
      description: 'Women\'s Basketball',
      color: '#e74c3c'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1508098687282-5c9b5a0e8c5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'NCAA Football',
      description: 'College Football',
      color: '#9b59b6'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      title: 'CFL',
      description: 'Canadian Football',
      color: '#3498db'
    }
  ];

  return (
    <div className="sports-gallery">
      <div className="container">
        <div className="gallery-header">
          <h2 className="gallery-title">🏆 Live Sports Coverage</h2>
          <p className="gallery-subtitle">Experience the thrill of betting on all major American sports leagues</p>
        </div>
        
        <div className="gallery-grid">
          {sportsData.map((sport) => (
            <div key={sport.id} className="gallery-item">
              <div className="gallery-image-container">
                <img 
                  src={sport.image} 
                  alt={sport.title}
                  className="gallery-image"
                  loading="lazy"
                />
                <div className="gallery-overlay">
                  <div className="gallery-content">
                    <h3 className="gallery-item-title" style={{ color: sport.color }}>
                      {sport.title}
                    </h3>
                    <p className="gallery-item-description">
                      {sport.description}
                    </p>
                    <div className="gallery-badge" style={{ backgroundColor: sport.color }}>
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportsGallery;