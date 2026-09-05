import React from 'react';

const EnvTest: React.FC = () => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const isLoaded = apiKey && apiKey.length > 10;

    return (
        <div style={{
            padding: '20px',
            margin: '20px',
            borderRadius: '8px',
            backgroundColor: isLoaded ? '#dcfce7' : '#fee2e2',
            border: `2px solid ${isLoaded ? '#16a34a' : '#dc2626'}`,
            color: isLoaded ? '#166534' : '#991b1b',
            fontFamily: 'monospace',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            zIndex: 9999,
            position: 'relative'
        }}>
            {isLoaded ? (
                <span>✅ API Key Loaded successfully ({apiKey.slice(0, 5)}...)</span>
            ) : (
                <span>❌ API Key MISSING or undefined</span>
            )}
            <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>
                Check console for full env object if needed.
            </div>
        </div>
    );
};

export default EnvTest;
