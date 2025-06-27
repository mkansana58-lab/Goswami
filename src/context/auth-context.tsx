
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { addStudent, getStudent } from '@/lib/firebase';

interface Student {
  name: string;
  photoUrl?: string;
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
  refreshStudentData: (name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'director@goswami.edu';
const ADMIN_PASS = 'G0swam!Def_2024';
const ADMIN_NAME = 'GSDA Director';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStudentData = useCallback(async (name: string) => {
    const freshData = await getStudent(name);
    if (freshData) {
        const studentToSave = {
            name: freshData.name,
            photoUrl: freshData.photoUrl,
        };
        setStudent(studentToSave);
        localStorage.setItem('student', JSON.stringify(studentToSave));
    }
  }, []);

  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) {
        const parsedStudent = JSON.parse(storedStudent);
        setStudent(parsedStudent);
        refreshStudentData(parsedStudent.name); // Refresh data on load
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
  }, [refreshStudentData]);

  const loginStudent = useCallback(async (name: string): Promise<boolean> => {
    await addStudent(name); // Add student if they don't exist
    const freshData = await getStudent(name); // Fetch their full profile
    if (freshData) {
        const studentToSave = { name: freshData.name, photoUrl: freshData.photoUrl };
        setStudent(studentToSave);
        localStorage.setItem('student', JSON.stringify(studentToSave));
    } else {
        // Fallback for new user just in case getStudent fails
        const studentData = { name };
        setStudent(studentData);
        localStorage.setItem('student', JSON.stringify(studentData));
    }
    return true;
  }, []);

  const loginAdmin = useCallback(async (email: string, pass: string): Promise<boolean> => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
      const adminData = { name: ADMIN_NAME, email: ADMIN_EMAIL };
      setAdmin(adminData);
      localStorage.setItem('admin', JSON.stringify(adminData));
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

  const value = { student, admin, isLoading, loginStudent, loginAdmin, logout, refreshStudentData };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
