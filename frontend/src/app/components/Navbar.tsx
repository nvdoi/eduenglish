"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    // Đóng dropdown khi click outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                EduEnglish
              </h1>
            </div>
          </div>

          {/* Desktop Menu - Ẩn khi user là admin */}
          {(!isLoggedIn || user?.role !== 'admin') && (
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="relative text-gray-700 hover:text-violet-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 group">
                TRANG CHỦ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/features" className="relative text-gray-700 hover:text-violet-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 group">
                TÍNH NĂNG
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/courses" className="relative text-gray-700 hover:text-violet-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 group">
                KHOÁ HỌC
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/contact" className="relative text-gray-700 hover:text-violet-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 group">
                LIÊN HỆ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          )}

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative dropdown-container">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-violet-600 hover:to-blue-600 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold">
                    {user?.username}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ADMIN
                    </span>
                  )}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    {user?.role === 'admin' ? (
                      // Admin Menu
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">Quản trị viên</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/admin');
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Trang thống kê</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/admin/lessons');
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Quản lý bài học</span>
                        </button>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button 
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      // User Menu
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">Học viên</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/profile');
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Trang cá nhân</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push('/achievements');
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <span>Thành tích</span>
                        </button>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button 
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Đăng xuất</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="text-gray-700 hover:text-violet-600 px-4 py-2 text-sm font-semibold uppercase transition-colors duration-300"
                >
                  ĐĂNG NHẬP
                </button>
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold uppercase hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  ĐĂNG KÝ
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-violet-600 inline-flex items-center justify-center p-2 rounded-lg focus:outline-none transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Chỉ hiện navigation links khi không phải admin */}
            {(!isLoggedIn || user?.role !== 'admin') && (
              <>
                <a href="/" className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 block px-3 py-3 text-base font-semibold uppercase tracking-wide rounded-lg transition-all duration-300">
                  TRANG CHỦ
                </a>
                <a href="/features" className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 block px-3 py-3 text-base font-semibold uppercase tracking-wide rounded-lg transition-all duration-300">
                  TÍNH NĂNG
                </a>
                <a href="/courses" className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 block px-3 py-3 text-base font-semibold uppercase tracking-wide rounded-lg transition-all duration-300">
                  KHOÁ HỌC
                </a>
                <a href="/contact" className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 block px-3 py-3 text-base font-semibold uppercase tracking-wide rounded-lg transition-all duration-300">
                  LIÊN HỆ
                </a>
              </>
            )}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex flex-col space-y-3 px-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center space-x-3 py-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white px-4 rounded-xl">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {user?.username}
                        </p>
                        <p className="text-white/80 text-xs">
                          {user?.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                        </p>
                      </div>
                      {user?.role === 'admin' && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    
                    {user?.role === 'admin' ? (
                      // Admin Menu Mobile
                      <>
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push('/admin');
                          }}
                          className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 text-left py-3 px-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Trang thống kê</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push('/admin/lessons');
                          }}
                          className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 text-left py-3 px-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Quản lý bài học</span>
                        </button>
                      </>
                    ) : (
                      // User Menu Mobile
                      <>
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push('/profile');
                          }}
                          className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 text-left py-3 px-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Trang cá nhân</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push('/achievements');
                          }}
                          className="text-gray-700 hover:text-violet-600 hover:bg-gray-50 text-left py-3 px-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center space-x-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <span>Thành tích</span>
                        </button>
                      </>
                    )}
                    
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-left py-3 px-3 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center space-x-3"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => window.location.href = '/login'}
                      className="text-gray-700 hover:text-violet-600 text-left py-2 text-sm font-semibold uppercase transition-colors duration-300"
                    >
                      ĐĂNG NHẬP
                    </button>
                    <button 
                      onClick={() => window.location.href = '/register'}
                      className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-3 rounded-xl text-sm font-semibold text-center uppercase transition-all duration-300"
                    >
                      ĐĂNG KÝ
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
