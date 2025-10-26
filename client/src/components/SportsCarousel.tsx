import React, { useState, useEffect } from 'react';
import './SportsCarousel.css';

const SportsCarousel: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sportsImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'NBA Basketball Action',
      sport: 'Basketball'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'NFL Football Game',
      sport: 'Football'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'College Basketball',
      sport: 'NCAA Basketball'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'WNBA Championship',
      sport: 'WNBA'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1508098687282-5c9b5a0e8c5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'College Football',
      sport: 'NCAA Football'
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      title: 'CFL Action',
      sport: 'CFL'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === sportsImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [sportsImages.length]);

  return (
    <div className="sports-carousel">
      <div className="carousel-container">
        <div className="carousel-track" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {sportsImages.map((image, index) => (
            <div key={image.id} className="carousel-slide">
              <img 
                src={image.url} 
                alt={image.title}
                className="carousel-image"
                loading="lazy"
              />
              <div className="carousel-overlay">
                <div className="carousel-content">
                  <h3 className="carousel-title">{image.title}</h3>
                  <p className="carousel-sport">{image.sport}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Dots */}
        <div className="carousel-dots">
          {sportsImages.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          className="carousel-arrow carousel-arrow-left"
          onClick={() => setCurrentImageIndex(prev => 
            prev === 0 ? sportsImages.length - 1 : prev - 1
          )}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button 
          className="carousel-arrow carousel-arrow-right"
          onClick={() => setCurrentImageIndex(prev => 
            prev === sportsImages.length - 1 ? 0 : prev + 1
          )}
          aria-label="Next image"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default SportsCarousel;
