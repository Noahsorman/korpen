const LoadingModal = ({text, image}: {text: string | undefined, image?:string}) => {

  if (!text) return <></>

  return <div style={styles.overlay}>
    <div style={styles.modal}>      
      <div style={{padding: 10}}>
        <span className="rotate2" style={{overflow: "hidden", fontSize: 48}}>..</span>
        <span className="rotate" style={{overflow: "hidden", fontSize: 48}}>..</span>
      </div>
      <h1 style={{marginTop: "7rem"}}>{text}</h1>
      <img 
        src={`/korpen/${image}`}
        style={{
          opacity: .5,
          //filter: "blur(1px)",
          width: "50svw",
          height: "50svh"
        }}
      />
    </div>
  </div>
}

const theme = {
  colors: {
    background: '#101010',
    surface: '#1a1a1a',
    primary: '#39ff14',
    text: '#ffffff',
    error: '#ff4b2b',
    pitch: '#142014',
  }
};

const styles: Record<string, React.CSSProperties> = {
  // Modal Styles
  overlay: {
    position: 'fixed',
    inset: 0,
    background: "rgba(0, 0, 0, 0.3)",
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '20px',
    padding: '32px',
    position: 'relative',
    maxHeight: '90vh',
    overflow: "hidden"
  },
  modalContent: {
    gap: 16,
    display: 'flex',
    overflowX: "clip",
    flexWrap: "wrap",
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: theme.colors.text,
    fontSize: '1.2rem',
    cursor: 'pointer',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '20px',
    color: theme.colors.text
  }
};

export default LoadingModal