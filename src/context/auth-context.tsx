
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { addStudent } from '@/lib/firebase';

interface Student {
  name: string;
}

interface Admin {
  name: string;
  email: string;
}

interface AuthContextType {
  student: Student | null;
  admin: Admin | null;
  isLoading: boolean;
  loginStudent: (name: string) => Promise<boolean>;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'director@goswami.edu';
const ADMIN_PASS = 'G0swam!Def_2024';
const ADMIN_NAME = 'GSDA Director';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) {
        setStudent(JSON.parse(storedStudent));
      }
      const storedAdmin = localStorage.getItem('admin');
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem('student');
      localStorage.removeItem('admin');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginStudent = useCallback(async (name: string): Promise<boolean> => {
    const studentData = { name };
    localStorage.setItem('student', JSON.stringify(studentData));
    setStudent(studentData);
    try {
        await addStudent(name);
    } catch (error) {
        console.error("Failed to add student to Firestore", error);
    }
    return true;
  }, []);

  const loginAdmin = useCallback(async (email: string, pass: string): Promise<boolean> => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
      const adminData = { name: ADMIN_NAME, email: ADMIN_EMAIL };
      localStorage.setItem('admin', JSON.stringify(adminData));
      setAdmin(adminData);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('student');
    localStorage.removeItem('admin');
    setStudent(null);
    setAdmin(null);
  }, []);

  const value = { student, admin, isLoading, loginStudent, loginAdmin, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
