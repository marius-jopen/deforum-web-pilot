/**
 * WelcomeBox: Centered tutorial video that can minimize to bottom-left
 */

import { useState, useMemo } from 'react';

interface WelcomeBoxProps {
  title?: string;
  /** YouTube video ID, e.g., "ysz5S6PUM-U" */
  videoId?: string;
}

export function WelcomeBox({ title = 'Deforum Web Pilot', videoId = 'efn7dsD0bdE' }: WelcomeBoxProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const containerStyle: React.CSSProperties = useMemo(() => {
    const common: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1200,
      background: '#f4e1ff',
      color: '#000000',
      borderRadius: '16px',
      overflow: 'hidden',
      border: 'none',
      transition: 'all 0.3s ease',
      fontFamily: 'monospace'
    };

    if (!isMinimized) {
      return {
        ...common,
        width: 'min(80vw, 900px)',
        height: 'min(70vh, 600px)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    return {
      ...common,
      width: '300px',
      height: 'calc(300px * 9 / 16 + 48px)',
      bottom: '20px',
      left: '20px'
    };
  }, [isMinimized]);

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: '#efd7fd',
    borderBottom: '1px solid rgba(0,0,0,0.1)'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '14px',
    fontWeight: 700
  };

  const closeButtonStyle: React.CSSProperties = {
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '999px',
    width: '28px',
    height: '28px',
    lineHeight: '28px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '16px'
  };

  const bodyStyle: React.CSSProperties = {
    padding: '12px',
    width: '100%',
    height: 'calc(100% - 48px)',
    boxSizing: 'border-box'
  };

  const videoWrapStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#000'
  };

  const iframeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: '0'
  };

  return (
    <div
      style={containerStyle}
      onClick={() => {
        // Allow clicking the minimized box to restore
        if (isMinimized) setIsMinimized(false);
      }}
    >
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <button
          aria-label={isMinimized ? 'Restore tutorial' : 'Minimize tutorial'}
          title={isMinimized ? 'Restore' : 'Close'}
          style={closeButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized((v) => !v);
          }}
        >
          {isMinimized ? '+' : '×'}
        </button>
      </div>

      <div style={bodyStyle}>
        <div style={videoWrapStyle}>
          <iframe
            style={iframeStyle}
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}


