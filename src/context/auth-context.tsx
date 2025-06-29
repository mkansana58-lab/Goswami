
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getStudent, type StudentData } from '@/lib/firebase';
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { db } from '@/lib/firebase';
import { z } from 'zod';

interface Admin {
  name: string;
}

const registerSchema = z.object({
    username: z.string().min(3, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fatherName: z.string().min(3, "Father's name is required"),
    class: z.string().min(1, "Class is required"),
    age: z.coerce.number().min(8, "Age must be at least 8"),
    address: z.string().min(10, "Full address is required"),
    school: z.string().min(3, "School name is required"),
    photo: z.any().optional(),
});

export type RegisterValues = z.infer<typeof registerSchema>;


interface AuthContextType {
  student: StudentData | null;
  admin: Admin | null;
  isLoading: boolean;
  loginStudent: (name: string, password?: string) => Promise<boolean>;
  registerStudent: (data: RegisterValues) => Promise<boolean>;
  loginAdmin: (accessKey: string) => Promise<boolean>;
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
    // This is a mock login. In a real app, you'd verify password against a hash.
    const studentData = await getStudent(name);
    if (studentData) {
        setStudent(studentData);
        localStorage.setItem('student', JSON.stringify(studentData));
        return true;
    }
    return false;
  }, []);

  const registerStudent = useCallback(async (data: RegisterValues): Promise<boolean> => {
    // This allows re-registration with the same username, overwriting old data.
    let photoUrl = "";
    const photoFile = data.photo?.[0];

    if (photoFile) {
        photoUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(photoFile);
        });
    }
    
    // We don't store the password, but in a real app, you'd hash and store it.
    // Destructure 'photo' out to prevent saving the FileList object to Firestore.
    const { password, username, photo, ...restOfData } = data;
    
    const newStudentData: StudentData = {
        name: username,
        ...restOfData,
        photoUrl: photoUrl,
        createdAt: Timestamp.now()
    };

    try {
        await setDoc(doc(db, "students", username), newStudentData, { merge: true });
        setStudent(newStudentData);
        localStorage.setItem('student', JSON.stringify(newStudentData));
        return true;
    } catch (error) {
        console.error("Error creating student:", error);
        return false;
    }
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
