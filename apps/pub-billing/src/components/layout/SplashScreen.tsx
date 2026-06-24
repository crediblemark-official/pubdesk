import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  initError?: string | null;
  onRetry?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ initError, onRetry }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menginisialisasi aplikasi...');
  const [splashLogo, setSplashLogo] = useState('📚');
  const [logoType, setLogoType] = useState<'emoji' | 'image'>('emoji');

  const [appName, setAppName] = useState('PubDesk');

  useEffect(() => {
    const savedLogo = localStorage.getItem('splash_logo');
    if (savedLogo) {
      setSplashLogo(savedLogo);
      if (savedLogo.startsWith('data:image')) {
        setLogoType('image');
      } else {
        setLogoType('emoji');
      }
    }
    const publisherName = localStorage.getItem('publisher_name');
    if (publisherName && publisherName.trim()) {
      setAppName(`PubDesk - ${publisherName.trim()}`);
    } else {
      setAppName('PubDesk');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    const statusTimers = [
      setTimeout(() => setStatusText('Membuka database lokal...'), 500),
      setTimeout(() => setStatusText('Memuat data master & tim...'), 1100),
      setTimeout(() => setStatusText('Sinkronisasi folder pintar...'), 1700),
      setTimeout(() => setStatusText('Menyiapkan workspace...'), 2200),
    ];

    return () => {
      clearInterval(interval);
      statusTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#ffffff',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      userSelect: 'none',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        animation: 'fadeIn 0.8s ease-out'
      }}>
        {/* Visualisasi Logo (Tampil apa adanya) */}
        <div style={{
          width: '120px',
          height: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: logoType === 'emoji' ? '64px' : 'unset',
          overflow: 'hidden'
        }}>
          {logoType === 'emoji' ? (
            splashLogo
          ) : (
            <img src={splashLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            margin: 0,
            background: 'linear-gradient(to right, #0f172a, #334155)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {appName}
          </h1>
          <p style={{
            fontSize: '11px',
            color: '#64748b',
            margin: '4px 0 0 0',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            Workspace Penerbitan Buku
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        width: '260px',
        marginTop: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        {initError ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: '8px', padding: '12px 16px', marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#b91c1c', marginBottom: '4px' }}>
                Gagal Inisialisasi Database
              </div>
              <div style={{ fontSize: '10px', color: '#7f1d1d', fontWeight: '500', wordBreak: 'break-word' }}>
                {initError}
              </div>
            </div>
            {onRetry && (
              <button onClick={onRetry} style={{
                padding: '8px 24px', borderRadius: '6px', border: 'none',
                background: '#3b82f6', color: '#ffffff', fontWeight: '600',
                fontSize: '13px', cursor: 'pointer'
              }}>
                Coba Lagi
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{
              width: '100%',
              height: '4px',
              background: '#e2e8f0',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
                borderRadius: '2px',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 8px #3b82f6'
              }} />
            </div>

            <span style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500',
              height: '16px',
              display: 'inline-block'
            }}>
              {statusText}
            </span>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLogo {
          0% { transform: scale(1); box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15); }
          50% { transform: scale(1.05); box-shadow: 0 8px 40px rgba(59, 130, 246, 0.25); }
          100% { transform: scale(1); box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
