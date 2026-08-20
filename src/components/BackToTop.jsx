import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到頂部"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 100%)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.08)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(59, 130, 246, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3)';
      }}
    >
      <ChevronUp size={24} strokeWidth={2.8} />
    </button>
  );
}
