import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faSignOutAlt, faHome, faBook, faChartBar, faClipboardList, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import useAuthStore from '../../store/authStore';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const navbarRef = useRef(null);
    const logoRef = useRef(null);
    const linksRef = useRef([]);
    const hamburgerRef = useRef(null);

    useEffect(() => {
        // أنيميشن دخول النافبار
        const tl = gsap.timeline();

        gsap.set(navbarRef.current, {
            opacity: 0,
            y: -100,
            filter: 'blur(10px)'
        });

        gsap.set(logoRef.current, {
            opacity: 0,
            x: -50,
            scale: 0.5
        });

        tl.to(navbarRef.current, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
        })
            .to(logoRef.current, {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.7)',
            }, '-=0.4');
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.pageYOffset;
            setIsScrolled(scrollY > 50);
            setIsCollapsed(scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
        setShowProfile(false);
    };

    return (
        <nav
            className={`navbar ${isCollapsed ? 'collapsed' : ''} ${isScrolled ? 'scrolled' : ''}`}
            ref={navbarRef}
        >
            <div className="navbar-container">
                {/* الشعار */}
                <a
                    href="/"
                    className="logo"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                    }}
                    ref={logoRef}
                >
                    <span className="logo-text">مكتبة</span>
                    <span className="logo-accent">الأخلاق</span>
                </a>

                {/* روابط التنقل */}
                <div className={`nav-user-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="nav-menu-items">
                        {/* المكتبة */}
                        <button
                            className="nav-menu-item"
                            onClick={() => handleNavigation('/library')}
                        >
                            <FontAwesomeIcon icon={faBook} />
                            المكتبة
                        </button>
                        {/* اختبارات */}
                        <button
                            className="nav-menu-item"
                            onClick={() => handleNavigation('/quizzes')}
                        >
                            <FontAwesomeIcon icon={faClipboardList} />
                            الاختبارات
                        </button>
                        {/* الأوائل العالمية */}
                        <button
                            className="nav-menu-item"
                            onClick={() => handleNavigation('/leaderboard')}
                        >
                            <FontAwesomeIcon icon={faTrophy} />
                            الأوائل
                        </button>

                        {/* لوحة التحكم (للإدمن فقط) */}
                        {user?.role === 'admin' && (
                            <button
                                className="nav-menu-item admin"
                                onClick={() => handleNavigation('/admin')}
                            >
                                <FontAwesomeIcon icon={faChartBar} />
                                الإدارة
                            </button>
                        )}

                        {/* الملف الشخصي */}
                        <div className="profile-menu">
                            <button
                                className="nav-menu-item profile-btn"
                                onClick={() => setShowProfile(!showProfile)}
                            >
                                <div className="avatar">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.username} />
                                    ) : (
                                        <span>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <span>{user?.username}</span>
                            </button>

                            {/* قائمة الملف الشخصي - بدون زر الإعدادات */}
                            {showProfile && (
                                <div className="profile-dropdown">
                                    <div className="profile-info">
                                        <p className="profile-name">{user?.username}</p>
                                        <p className="profile-email">{user?.email}</p>
                                        <p className="profile-role">
                                            {user?.role === 'admin' ? '👨‍💼 مسؤول' : '👤 مستخدم'}
                                        </p>
                                        {user?.totalPoints != null && (
                                          <p className="profile-points">🪙 نقاط: {user.totalPoints}</p>
                                        )}
                                        {user?.globalRank != null && (
                                          <p className="profile-rank">🏆 ترتيبك: {user.globalRank}</p>
                                        )}
                                    </div>
                                    <div className="profile-actions">
                                        {/* تم إزالة زر الإعدادات */}
                                        <button
                                            className="action-btn logout"
                                            onClick={handleLogout}
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                            تسجيل الخروج
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* زر القائمة */}
                <button
                    className={`hamburger ${isMenuOpen ? 'open' : ''}`}
                    onClick={toggleMenu}
                    ref={hamburgerRef}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <FontAwesomeIcon icon={faTimes} className="hamburger-icon" />
                    ) : (
                        <FontAwesomeIcon icon={faBars} className="hamburger-icon" />
                    )}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;