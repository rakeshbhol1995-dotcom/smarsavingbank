import React from 'react';

class GlobalError extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical System Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: '#1a0505', color: '#ff4444',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', padding: '20px', zIndex: 9999
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>SYSTEM CRASHED (GLOBAL)</h1>
                    <div style={{
                        backgroundColor: 'rgba(255,0,0,0.1)', padding: '20px',
                        borderRadius: '10px', maxWidth: '800px', width: '100%',
                        border: '1px solid #ff4444'
                    }}>
                        <strong style={{ display: 'block', marginBottom: '10px', color: 'white' }}>
                            Error: {this.state.error?.toString()}
                        </strong>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '30px', padding: '12px 24px',
                            backgroundColor: '#ff4444', color: 'white',
                            border: 'none', borderRadius: '5px',
                            cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        RESTART APP
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalError;
