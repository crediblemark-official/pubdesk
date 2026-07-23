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
  const opacityValue = activeProfile?.watermarkOpacity !== undefined ? Math.max(0.15, activeProfile.watermarkOpacity / 100) : 0.22;

  const isMultiLine = text === 'BELUM LUNAS';
  const fontSize = isMultiLine ? '36px' : (text === 'LUNAS' || text === 'DP') ? '54px' : text === 'BERMASALAH' ? '34px' : '44px';
  const letterSpacing = isMultiLine ? '3px' : (text === 'LUNAS' || text === 'DP') ? '6px' : text === 'BERMASALAH' ? '2.5px' : '4px';

  const textContent = isMultiLine ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ 
        fontSize: fontSize, 
        fontWeight: '900', 
        color: color,
        letterSpacing: letterSpacing, 
        paddingLeft: letterSpacing,
        lineHeight: '0.95' 
      }}>
        BELUM
      </div>
      <div style={{ 
        width: '100%', 
        height: '2px', 
        background: color, 
        margin: '4px 0' 
      }} />
      <div style={{ 
        fontSize: fontSize, 
        fontWeight: '900', 
        color: color,
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
      color: color,
      letterSpacing: letterSpacing, 
      paddingLeft: letterSpacing,
      lineHeight: '1' 
    }}>
      {text}
    </div>
  );

  return (
    <div
      className="invoice-watermark"
      style={{
        position: 'absolute',
        top: '62%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-15deg)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 10,
        opacity: opacityValue,
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
            backgroundColor: 'transparent',
            border: `2px solid ${color}`,
            padding: isMultiLine ? '10px 22px' : '8px 26px',
            borderRadius: '5px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            lineHeight: '1',
            fontFamily: '"Impact", "Arial Black", Arial, "Segoe UI", sans-serif',
            boxShadow: `0 0 2px ${color}`
          }}
        >
          {textContent}
        </div>
      </div>
    </div>
  );
};
export default Watermark;
