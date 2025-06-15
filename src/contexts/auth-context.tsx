
"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, type DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  studentData: StudentProfile | null;
  setStudentData: Dispatch<SetStateAction<StudentProfile | null>>;
}

export interface StudentProfile extends DocumentData {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  surname?: string;
  fatherName?: string;
  phoneNumber?: string;
  address?: string;
  state?: string;
  country?: string;
  currentClass?: string;
  photoURL?: string | null;
  createdAt?: any; // Timestamp
  updatedAt?: any; // Timestamp
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch student data from Firestore
        const studentDocRef = doc(db, "students", currentUser.uid);
        const studentDocSnap = await getDoc(studentDocRef);
        if (studentDocSnap.exists()) {
          setStudentData(studentDocSnap.data() as StudentProfile);
        } else {
          // Potentially create a basic profile if it doesn't exist, e.g., after Google sign-in
          // For now, just set to null or a default structure
          setStudentData(null);
        }
      } else {
        setStudentData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, studentData, setStudentData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
