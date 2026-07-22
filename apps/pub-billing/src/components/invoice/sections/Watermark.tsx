import React from 'react';
import { InvoiceProfile } from '../../../types/invoice.types';

interface WatermarkProps {
  paymentStatus?: string;
  activeProfile: InvoiceProfile | null;
}

export const Watermark: React.FC<WatermarkProps> = ({ paymentStatus, activeProfile }) => {
  if (!paymentStatus) return null;

  let text = '';
  let baseColor = '';

  switch (paymentStatus.toUpperCase()) {
    case 'LUNAS':
      text = 'LUNAS';
      baseColor = '#16a34a';
      break;
    case 'BELUM LUNAS':
      text = 'BELUM LUNAS';
      baseColor = '#dc2626';
      break;
    case 'DP':
      text = 'DP';
      baseColor = '#2563eb';
      break;
    case 'BERMASALAH':
      text = 'BERMASALAH';
      baseColor = '#d97706';
      break;
    default:
      return null;
  }

  const color = activeProfile?.watermarkColor || baseColor;
  const opacityValue = activeProfile?.watermarkOpacity !== undefined ? activeProfile.watermarkOpacity / 100 : 0.08;

  const isMultiLine = text === 'BELUM LUNAS';
  const fontSize = isMultiLine ? '36px' : (text === 'LUNAS' || text === 'DP') ? '54px' : text === 'BERMASALAH' ? '34px' : '44px';
  const letterSpacing = isMultiLine ? '3px' : (text === 'LUNAS' || text === 'DP') ? '6px' : text === 'BERMASALAH' ? '2.5px' : '4px';

  const textContent = isMultiLine ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ 
        fontSize: fontSize, 
        fontWeight: '900', 
        color: '#ffffff',
        letterSpacing: letterSpacing, 
        paddingLeft: letterSpacing,
        lineHeight: '0.95' 
      }}>
        BELUM
      </div>
      <div style={{ 
        width: '100%', 
        height: '1.5px', 
        background: '#ffffff', 
        margin: '4px 0' 
      }} />
      <div style={{ 
        fontSize: fontSize, 
        fontWeight: '900', 
        color: '#ffffff',
        letterSpacing: letterSpacing, 
        paddingLeft: letterSpacing,
        lineHeight: '0.95' 
      }}>
        LUNAS
      </div>
    </div>
  ) : (
    <div style={{ 
      fontSize: fontSize, 
      fontWeight: '900', 
      color: '#ffffff',
      letterSpacing: letterSpacing, 
      paddingLeft: letterSpacing,
      lineHeight: '1' 
    }}>
      {text}
    </div>
  );

  const grungePattern = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='5' cy='15' r='1' fill='%23ffffff' opacity='0.35'/><circle cx='35' cy='8' r='1.5' fill='%23ffffff' opacity='0.4'/><circle cx='60' cy='25' r='0.8' fill='%23ffffff' opacity='0.25'/><circle cx='20' cy='55' r='1.2' fill='%23ffffff' opacity='0.35'/><circle cx='55' cy='60' r='1.8' fill='%23ffffff' opacity='0.45'/><circle cx='10' cy='35' r='1' fill='%23ffffff' opacity='0.35'/><circle cx='65' cy='45' r='1.3' fill='%23ffffff' opacity='0.4'/><circle cx='40' cy='40' r='0.9' fill='%23ffffff' opacity='0.3'/><circle cx='15' cy='65' r='1.4' fill='%23ffffff' opacity='0.35'/><circle cx='70' cy='12' r='1.1' fill='%23ffffff' opacity='0.3'/><circle cx='30' cy='70' r='0.7' fill='%23ffffff' opacity='0.25'/><circle cx='50' cy='20' r='1.6' fill='%23ffffff' opacity='0.4'/></svg>")`;

  return (
    <div
      style={{
        position: 'absolute',
        top: '62%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-15deg)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 10,
        opacity: opacityValue,
        mixBlendMode: 'multiply',
        display: 'inline-block'
      }}
    >
      <div style={{
        border: `4px solid ${color}`,
        padding: '3px',
        background: 'transparent',
        borderRadius: '8px'
      }}>
        <div
          style={{
            backgroundColor: color,
            backgroundImage: grungePattern,
            border: `1.8px solid #ffffff`,
            padding: isMultiLine ? '10px 22px' : '8px 26px',
            borderRadius: '5px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            lineHeight: '1',
            fontFamily: '"Impact", "Arial Black", "Montserrat", "Segoe UI", sans-serif',
            boxShadow: `0 0 1px ${color}`
          }}
        >
          {textContent}
        </div>
      </div>
    </div>
  );
};
export default Watermark;
