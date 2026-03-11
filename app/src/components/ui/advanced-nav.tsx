import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, BookOpen, Microscope, Mail, FlaskConical } from 'lucide-react';

export const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Journals', href: '/journal', icon: BookOpen, external: true },
    { label: 'Research Hub', href: '/research-hub', icon: FlaskConical },
    { label: 'Physics', href: '/physics-resources', icon: Microscope },
    { label: 'Contact', href: '/contact', icon: Mail },
];

export function AdvancedNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 100;
            setIsScrolled(scrolled);
            if (scrolled) {
                document.body.classList.add('scrolled-sidebar');
            } else {
                document.body.classList.remove('scrolled-sidebar');
            }
        };
        handleScroll(); // Initialize state
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.body.classList.remove('scrolled-sidebar');
        };
    }, []);

    const isActive = (href: string) => location.pathname === href;

    return (
        <>
            {/* Desktop Navigation */}
            <nav
                className={`fixed top-0 left-0 z-50 transition-all duration-500 ease-in-out bg-white/80 backdrop-blur-lg hidden md:flex
          ${isScrolled
                        ? 'w-20 h-screen flex-col py-8 border-r border-gray-200 shadow-2xl items-center'
                        : 'w-full h-16 flex-row px-8 border-b border-gray-100 shadow-sm items-center justify-between'
                    }`}
            >
                {/* Logo Area */}
                <div className={`flex items-center transition-all duration-500 flex-shrink-0 ${isScrolled ? 'mb-8 flex-col gap-2' : ''}`}>
                    <button onClick={() => navigate('/')} className={`flex items-center gap-3 transition-all duration-500 ${isScrolled ? 'flex-col' : ''}`}>
                        <img src="/logo.jpeg" alt="Logo" className={`object-contain rounded transition-all duration-500 ${isScrolled ? 'w-12 h-12' : 'w-10 h-10'}`} />
                        <div className={`overflow-hidden transition-all duration-500 ${isScrolled ? 'w-0 h-0 opacity-0' : 'w-[250px] opacity-100'}`}>
                            <span className="text-lg font-bold text-gray-900 leading-tight text-left block w-[250px]">
                                Cornerstone Research<br />
                                <span className="text-[#d63384] text-sm font-semibold">and Publication Services</span>
                            </span>
                        </div>
                    </button>
                </div>

                {/* Links Area */}
                <div className={`flex transition-all duration-500 ${isScrolled ? 'flex-col space-y-6 w-full items-center' : 'flex-row space-x-2'}`}>
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <button
                                key={item.label}
                                onClick={() => {
                                    if (item.external) window.open(item.href, '_blank');
                                    else navigate(item.href);
                                }}
                                className={`relative group flex items-center justify-center transition-all duration-500
                  ${isScrolled ? 'w-12 h-12 rounded-xl' : 'px-3 py-2 -ml-1 mr-1'}
                `}
                                title={isScrolled ? item.label : undefined}
                            >
                                {/* Navbar mode label */}
                                <span className={`relative z-10 font-bold whitespace-nowrap overflow-hidden transition-all duration-500 ${isScrolled ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block text-sm group-hover:text-white'} ${active ? 'text-white' : 'text-[#d63384]'}`}>
                                    {item.label}
                                </span>

                                {/* Sidebar mode icon */}
                                <item.icon className={`relative z-10 w-5 h-5 transition-all duration-500 ${isScrolled ? 'block opacity-100 group-hover:text-white' : 'w-0 opacity-0 hidden'} ${active ? 'text-white' : 'text-[#d63384]'}`} />

                                {/* Navbar hover effect bounds */}
                                <span className={`absolute inset-0 border-t-2 border-b-2 border-[#d63384] transform opacity-0 transition-all duration-300 origin-center pointer-events-none rounded-sm ${!isScrolled ? 'scale-y-[2] group-hover:scale-y-100 group-hover:opacity-100' : 'hidden'}`} />
                                <span className={`absolute top-[2px] left-0 w-full h-[calc(100%-4px)] bg-[#d63384] transform transition-all duration-300 origin-top pointer-events-none rounded-sm ${!isScrolled ? (active ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100') : 'hidden'}`} />

                                {/* Sidebar hover effect bounds */}
                                <span className={`absolute inset-0 border-2 border-[#d63384] transform opacity-0 transition-all duration-300 pointer-events-none rounded-xl ${isScrolled ? 'scale-0 group-hover:scale-100 group-hover:opacity-100' : 'hidden'}`} />
                                <span className={`absolute inset-0 bg-[#d63384] transform transition-all duration-300 pointer-events-none rounded-xl ${isScrolled ? (active ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100') : 'hidden'}`} />
                            </button>
                        )
                    })}
                </div>

                {/* Action Area */}
                <div className={`flex items-center transition-all duration-500 flex-shrink-0 ${isScrolled ? 'mt-auto flex-col space-y-4 w-full' : 'space-x-2'}`}>
                    <div className={`flex items-center justify-center transition-all duration-500 overflow-hidden ${isScrolled ? 'w-0 h-0 opacity-0 hidden' : 'opacity-100 space-x-2'}`}>
                        <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white hover:opacity-90 border-0 text-sm whitespace-nowrap">Get Started</Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 px-4 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="flex items-center gap-3">
                    <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 object-contain rounded" />
                    <span className="text-sm font-bold text-gray-900 leading-tight text-left">
                        Cornerstone Research and Publication Services
                    </span>
                </button>
                <button className="p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {mobileMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col space-y-2 animate-in slide-in-from-top-2">
                        {navItems.map(item => {
                            const active = isActive(item.href);
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        if (item.external) window.open(item.href, '_blank');
                                        else navigate(item.href);
                                    }}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${active ? 'bg-pink-50 text-[#d63384]' : 'text-[#d63384] hover:bg-pink-50'}`}
                                >
                                    <item.icon className={`w-5 h-5 text-[#d63384]`} />
                                    <span className="font-bold text-sm">{item.label}</span>
                                </button>
                            )
                        })}
                        <div className="pt-4 flex flex-col space-y-2 border-t border-gray-100 mt-2">
                            <Button onClick={() => { setMobileMenuOpen(false); navigate('/contact'); }} className="w-full bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white">Get Started</Button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
