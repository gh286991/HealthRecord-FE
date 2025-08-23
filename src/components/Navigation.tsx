'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { logout as logoutAction } from '@/lib/authSlice';
import Button from '@/components/Button';
import { useWorkoutTimer } from '@/components/WorkoutTimerContext';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const token = useSelector((s: RootState) => s.auth.token);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLogout = () => {
    dispatch(logoutAction());
    setIsLoggedIn(false);
    closeMenu(); // 登出後關閉選單
    router.push('/');
  };

  // 控制進出場動畫
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setAnimIn(true));
    } else {
      setAnimIn(false);
    }
  }, [open]);

  const closeMenu = () => {
    setAnimIn(false);
    setTimeout(() => setOpen(false), 180);
  };

  // 處理導覽項目點擊，點擊後關閉選單
  const handleNavItemClick = () => {
    closeMenu();
  };

  const MenuItems = ({ stagger = false }: { stagger?: boolean }) => {
    const base = `block sm:inline-block px-3 py-2 rounded-md text-sm font-medium transition-all duration-150`;
    const enter = animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1';
    const item = (i: number, cls: string) => ({
      className: `${base} ${cls} ${stagger ? enter : ''}`,
      style: stagger ? { transitionDelay: `${i * 30}ms` } as React.CSSProperties : undefined,
    });
    return (
      <>
        {isLoggedIn ? (
          <>
            <Link href="/nutrition" onClick={handleNavItemClick} {...item(0, 'text-gray-700 hover:text-gray-900')}>飲食紀錄</Link>
            <Link href="/workout" onClick={handleNavItemClick} {...item(1, 'text-gray-700 hover:text-gray-900')}>健身紀錄</Link>
            <Link href="/profile" onClick={handleNavItemClick} {...item(2, 'text-gray-700 hover:text-gray-900')}>個人資料</Link>
            <div className={`px-3 py-2 sm:px-0 sm:py-0 ${stagger ? enter : ''}`} style={stagger ? { transitionDelay: `${3 * 30}ms` } : undefined}>
              <Button onClick={handleLogout} className="!px-4 !py-2 !text-sm w-full sm:w-auto" variant="secondary">登出</Button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" onClick={handleNavItemClick} {...item(0, 'text-gray-700 hover:text-gray-900')}>登入</Link>
            <Link href="/register" onClick={handleNavItemClick} {...item(1, 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md')}>註冊</Link>
          </>
        )}
      </>
    );
  };

  // 依目前路徑決定標題（APP 風格）
  const getTitleFromPath = (path: string): string => {
    if (!path) return '健康管理系統';
    const clean = path.split('?')[0];
    switch (clean) {
      case '/':
        return '健康管理系統';
      case '/nutrition':
        return '飲食紀錄';
      case '/workout':
        return '健身紀錄';
      case '/profile':
        return '個人資料';
      case '/login':
        return '登入';
      case '/register':
        return '註冊';
      default:
        return '健康管理系統';
    }
  };
  const currentTitle = getTitleFromPath(pathname || '/');
  const workoutFormMode = searchParams?.get('form');
  const isWorkoutForm = (pathname === '/workout') && (workoutFormMode === 'add' || workoutFormMode === 'edit');
  const { totalSeconds, isRunning, formatMMSS } = useWorkoutTimer();
  const displayTime = useMemo(() => formatMMSS(totalSeconds), [formatMMSS, totalSeconds]);
  const forceSticky = (searchParams?.get('navSticky') === '1') || (searchParams?.get('nav') === 'sticky');
  const shouldStick = isWorkoutForm || forceSticky;

  return (
    <nav className={`bg-white shadow-sm border-b ${shouldStick ? 'sticky top-0 z-40' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {isWorkoutForm && (
              <button
                className="mr-2 h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow text-gray-700 hover:bg-white active:scale-95 transition"
                aria-label="返回"
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined' && window.history.length > 1) {
                      window.history.back();
                    } else {
                      router.push('/workout');
                    }
                  } catch {
                    router.push('/workout');
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="text-xl font-bold text-gray-900">{currentTitle}</div>
            {isWorkoutForm && (
              <div className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span className="tabular-nums">{displayTime}</span>
              </div>
            )}
          </div>
          {/* Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            <MenuItems />
          </div>
          {/* Mobile hamburger */}
          <button
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {/* Mobile dropdown as overlay with blur + transition */}
        {open && (
          <>
            <div
              className={`fixed inset-x-0 top-16 bottom-0 z-40 bg-white/40 backdrop-blur-sm sm:hidden transition-opacity duration-200 ${animIn ? 'opacity-100' : 'opacity-0'}`}
              onClick={closeMenu}
            />
            <div className="fixed top-16 inset-x-0 z-50 sm:hidden">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className={`rounded-b-xl border border-t-0 bg-white shadow-md pb-3 pt-2 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                >
                  <MenuItems stagger />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
} 