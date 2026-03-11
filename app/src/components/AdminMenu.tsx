import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export function AdminMenu() {
    const location = useLocation();

    // Check for secret shared link directly in URL or in prior memory
    const query = new URLSearchParams(location.search);
    const hasAccessKey = query.get('access') === 'cornerstone2024';

    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (hasAccessKey) {
            localStorage.setItem('adminAccess', 'true');
            setIsAuthorized(true);
        } else if (localStorage.getItem('adminAccess') === 'true') {
            setIsAuthorized(true);
        }
    }, [hasAccessKey, location.search]);

    if (!isAuthorized) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-md border border-gray-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-[9999] animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-2 font-bold text-sm text-[#d63384] pr-0">
                <ShieldAlert className="w-4 h-4" /> SECURE ADMIN ACCESS
            </div>
        </div>
    );
}
