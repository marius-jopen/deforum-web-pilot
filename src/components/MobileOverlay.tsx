/**
 * MobileOverlay: Full-screen mobile-only overlay with title, message, and video
 */

interface MobileOverlayProps {
  title?: string;
  message?: string;
  /** YouTube video ID */
  videoId?: string;
}

export function MobileOverlay({
  title = 'Deforum Web Pilot',
  message = 'This app is designed for desktop. Please open on a computer for the full experience.',
  videoId = 'efn7dsD0bdE'
}: MobileOverlayProps) {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    background: '#f4e1ff',
    color: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
    fontFamily: 'monospace'
  };

  const headerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '900px',
    textAlign: 'center',
    marginBottom: '16px'
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '24px',
    fontWeight: 400,
    lineHeight: '1.5',
    fontFamily: 'helvetica'
  };

  const messageStyle: React.CSSProperties = {
    margin: '8px 0 16px 0',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#303030'
  };

  const videoOuterStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '900px',
    flex: '0 0 auto'
  };

  const videoWrapStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%',
    background: '#000000',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.1)'
  };

  const iframeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: '0'
  };

  const teaserStyle: React.CSSProperties = {
    marginTop: '12px',
    maxWidth: '900px',
    textAlign: 'center',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#303030'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={messageStyle}>{message}</p>
      </div>

      <div style={videoOuterStyle}>
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

      <p style={teaserStyle}>
        Pilot a 3D camera, record smooth paths, and export Deforum-ready schedules.
      </p>

      <a
        href="https://therobots.world"
        target="_blank"
        rel="noreferrer"
        style={{
          marginTop: '16px',
          background: '#efd7fd',
          color: '#000000',
          borderRadius: '999px',
          padding: '8px 14px',
          fontFamily: 'monospace',
          fontSize: '12px',
          textDecoration: 'none'
        }}
      >
        by THE ROBOTS
      </a>
    </div>
  );
}


