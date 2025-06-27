"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getStudent, registerStudent as firebaseRegisterStudent, type StudentData } from '@/lib/firebase';

interface Admin {
  name: string;
}

interface AuthContextType {
  student: StudentData | null;
  admin: Admin | null;
  isLoading: boolean;
  loginStudent: (name: string, password?: string) => Promise<boolean>;
  registerStudent: (data: Omit<StudentData, 'id' | 'createdAt' | 'photoUrl'>, photoFile: File) => Promise<boolean>;
  logout: () => void;
  refreshStudentData: (name: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_ACCESS_KEY = 'G$DA_Director_Panel_#2024!_SecureAccessKey';
const ADMIN_NAME = 'GSDA Director';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStudentData = useCallback(async (name: string) => {
    const freshData = await getStudent(name);
    if (freshData) {
        setStudent(freshData);
        localStorage.setItem('student', JSON.stringify(freshData));
    }
  }, []);

  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) {
        const parsedStudent: StudentData = JSON.parse(storedStudent);
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

  const loginStudent = useCallback(async (name: string, password?: string): Promise<boolean> => {
    // This is a mock login. In a real app, you'd verify password.
    const studentData = await getStudent(name);
    if (studentData) {
        setStudent(studentData);
        localStorage.setItem('student', JSON.stringify(studentData));
        return true;
    }
    return false;
  }, []);

  const registerStudent = useCallback(async (data: Omit<StudentData, 'id' | 'createdAt' | 'photoUrl'>, photoFile: File): Promise<boolean> => {
    const photoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(photoFile);
    });

    const fullStudentData = { ...data, photoUrl };
    
    // This will throw if student exists, which is handled in the UI
    await firebaseRegisterStudent(fullStudentData);
    
    // Now log them in
    const newStudent = await getStudent(data.name);
    if (newStudent) {
        setStudent(newStudent);
        localStorage.setItem('student', JSON.stringify(newStudent));
        return true;
    }
    return false;
  }, []);


  const loginAdmin = useCallback(async (accessKey: string): Promise<boolean> => {
    if (accessKey === ADMIN_ACCESS_KEY) {
      const adminData = { name: ADMIN_NAME };
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

  const value = { student, admin, isLoading, loginStudent, registerStudent, loginAdmin, logout, refreshStudentData };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
