import React from 'react';
import LiveNEOBrowse from './components/LiveNEOBrowse';
import LiveNEOFeed from './components/LiveNEOFeed';

type View =  'browse' | 'feed';

const App: React.FC = () => {
    const [view, setView] = React.useState<View>('feed');

    return (
        <div style={{ padding: 16 }}>


            {view === 'browse' && (
                <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button onClick={() => setView('feed')}>Open Live Feed</button>
                    </div>
                    <LiveNEOBrowse />
                </div>
            )}

            {view === 'feed' && (
                <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <button onClick={() => setView('browse')}>Open Live Browse</button>
                    </div>
                    <LiveNEOFeed />
                </div>
            )}
        </div>
    );
};

export default App;
