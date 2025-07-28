import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleCallback = () => {
    const location = useLocation();

    useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    
    if (code && window.opener) {
        window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            code: code
        }, window.location.origin);
        window.close();
    }
}, [location]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-4">Processing Authentication...</h2>
                <p className="text-center">Please wait while we complete your login.</p>
            </div>
        </div>
    );
};

export default GoogleCallback;