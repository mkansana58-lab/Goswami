
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getStudent, type StudentData, db, timestampToDate } from '@/lib/firebase';
import { set, ref, serverTimestamp } from "firebase/database";
import { z } from 'zod';
import { fileToDataUrl } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';


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

const convertTimestamps = (data: any): any => {
    if (data?.createdAt && typeof data.createdAt === 'number') {
        return { ...data, createdAt: timestampToDate(data.createdAt) };
    }
    return data;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStudentData = useCallback(async (name: string) => {
    const freshData = await getStudent(name);
    if (freshData) {
        const convertedData = convertTimestamps(freshData);
        setStudent(convertedData);
        localStorage.setItem('student', JSON.stringify(convertedData));
    }
  }, []);

  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem('student');
      if (storedStudent) {
        const parsedStudent: StudentData = JSON.parse(storedStudent);
        const convertedData = convertTimestamps(parsedStudent);
        setStudent(convertedData);
        refreshStudentData(convertedData.name); // Refresh data on load
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
    const studentData = await getStudent(name);
    if (studentData) {
        const convertedData = convertTimestamps(studentData);
        setStudent(convertedData);
        localStorage.setItem('student', JSON.stringify(convertedData));
        return true;
    }
    return false;
  }, []);

  const registerStudent = useCallback(async (data: RegisterValues): Promise<boolean> => {
    let photoUrl = "";
    const photoFile = data.photo?.[0];

    if (photoFile) {
        try {
            photoUrl = await fileToDataUrl(photoFile);
        } catch (e) {
            console.error("Image processing error:", e);
            throw e;
        }
    }
    
    const { password, username, photo, ...restOfData } = data;
    
    const newStudentData: Omit<StudentData, 'id'> = {
        name: username,
        ...restOfData,
        photoUrl: photoUrl,
        createdAt: Date.now() // Use simple timestamp number
    };

    try {
        if (!db) return false;
        await set(ref(db, `students/${username}`), newStudentData);
        
        const finalStudentData = {
            ...newStudentData,
            id: username,
            createdAt: timestampToDate(newStudentData.createdAt)
        } as StudentData;

        setStudent(finalStudentData);
        localStorage.setItem('student', JSON.stringify(finalStudentData));
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
