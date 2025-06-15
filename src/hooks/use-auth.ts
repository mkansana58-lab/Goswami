
"use client";
import { useContext } from 'react';
// Correct the import path if AuthContext is in src/contexts/auth-context.tsx
import { AuthContext } from '@/contexts/auth-context'; 

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
