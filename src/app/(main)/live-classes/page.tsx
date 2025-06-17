
"use client";
import { useEffect, useState } from "react";
import { getLiveClasses } from "@/lib/firebase";
import type { Timestamp } from "firebase/firestore";

// इंटरफ़ेस Firestore से अपेक्षित डेटा संरचना को परिभाषित करता है
interface LiveClassData {
  id: string;
  title?: string; // पहले 'Title' था
  scheduledAt?: Timestamp; // पहले 'Time' था और Timestamp प्रकार का होना चाहिए
  link?: string; // पहले 'Link' था
  // Firestore से आने वाले अन्य फ़ील्ड यहाँ जोड़े जा सकते हैं
  [key: string]: any; // अतिरिक्त फ़ील्ड्स के लिए
}

export default function LiveClassesPage() {
  const [liveClasses, setLiveClasses] = useState<LiveClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      setIsLoading(true);
      try {
        const classes = await getLiveClasses();
        // सुनिश्चित करें कि classes एक ऐरे है
        setLiveClasses(Array.isArray(classes) ? classes as LiveClassData[] : []);
      } catch (error) {
        console.error("Error fetching live classes in component:", error);
        setLiveClasses([]); // त्रुटि होने पर खाली ऐरे सेट करें
      } finally {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">आगामी लाइव क्लासें</h1>
      {isLoading ? (
        <p className="text-center text-muted-foreground">लोड हो रहा है...</p>
      ) : liveClasses.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">कोई क्लास उपलब्ध नहीं है...</p>
      ) : (
        <div className="space-y-4">
          {liveClasses.map((liveClass) => (
            <div key={liveClass.id} className="p-4 border rounded-lg shadow-md bg-card">
              <h2 className="text-xl font-semibold text-secondary-foreground">{liveClass.title || "N/A"}</h2>
              <p className="text-sm text-muted-foreground mb-2">
                {liveClass.scheduledAt && typeof liveClass.scheduledAt.toDate === 'function'
                  ? liveClass.scheduledAt.toDate().toLocaleString('hi-IN', { dateStyle: 'long', timeStyle: 'short' })
                  : "अमान्य तिथि"}
              </p>
              {liveClass.link ? (
                <a
                  href={liveClass.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
                >
                  क्लास में शामिल हों
                </a>
              ) : (
                <p className="text-sm text-red-500">जॉइनिंग लिंक उपलब्ध नहीं है।</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
