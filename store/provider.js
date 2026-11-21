'use client';

import React, { useRef, useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { makeStore } from './index';
import { restoreUser } from './slices/authSlice';
import { selectCurrentTheme, setTheme } from './slices/themeSlice';

function ThemeManager({ children }) {
  const dispatch = useDispatch();
  const theme = useSelector(selectCurrentTheme);

  // 1. Restore saved theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          dispatch(setTheme(savedTheme));
        } else if (
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
          dispatch(setTheme('dark'));
        }
      } catch (err) {
        console.error('Failed to read theme from localStorage:', err);
      }
    }
  }, [dispatch]);

  // 2. Synchronize theme with DOM elements (<html class="dark"> and <body data-theme="dark">)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const root = document.documentElement;
        const body = document.body;

        if (theme === 'dark') {
          root.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
          if (body) {
            body.setAttribute('data-theme', 'dark');
          }
          localStorage.setItem('theme', 'dark');
        } else {
          root.classList.remove('dark');
          root.removeAttribute('data-theme');
          if (body) {
            body.removeAttribute('data-theme');
          }
          localStorage.setItem('theme', 'light');
        }
      } catch (err) {
        console.error('Failed to apply theme to DOM:', err);
      }
    }
  }, [theme]);

  return <>{children}</>;
}

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && storeRef.current) {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        if (storedUser && token) {
          const parsed = JSON.parse(storedUser);
          storeRef.current.dispatch(restoreUser(parsed));
        } else {
          storeRef.current.dispatch(restoreUser(null));
        }
      } catch (err) {
        console.error('Failed to restore user from localStorage:', err);
      }
    }
  }, []);

  return (
    <Provider store={storeRef.current}>
      <ThemeManager>{children}</ThemeManager>
    </Provider>
  );
}
