
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays, ListChecks, Megaphone } from 'lucide-react';

// Placeholder data
const scheduleData = {
  en: [
    { time: "08:00 AM - 09:00 AM", subject: "Physical Training", teacher: "Sgt. Major Rakesh" },
    { time: "09:30 AM - 11:00 AM", subject: "Mathematics", teacher: "Mr. Sharma" },
    { time: "11:30 AM - 01:00 PM", subject: "General Knowledge", teacher: "Ms. Priya" },
    { time: "02:00 PM - 03:30 PM", subject: "English", teacher: "Mr. David" },
  ],
  hi: [
    { time: "सुबह 08:00 - 09:00", subject: "शारीरिक प्रशिक्षण", teacher: "सार्जेंट मेजर राकेश" },
    { time: "सुबह 09:30 - 11:00", subject: "गणित", teacher: "श्री शर्मा" },
    { time: "सुबह 11:30 - दोपहर 01:00", subject: "सामान्य ज्ञान", teacher: "सुश्री प्रिया" },
    { time: "दोपहर 02:00 - 03:30", subject: "अंग्रेज़ी", teacher: "श्री डेविड" },
  ]
};

const homeworkData = {
  en: [
    { subject: "Mathematics", task: "Complete Chapter 5 exercises.", dueDate: "Tomorrow" },
    { subject: "English", task: "Write an essay on 'My Role Model'.", dueDate: "Next Monday" },
  ],
  hi: [
    { subject: "गणित", task: "अध्याय 5 के अभ्यास पूरे करें।", dueDate: "कल" },
    { subject: "अंग्रेज़ी", task: "'मेरा आदर्श' पर एक निबंध लिखें।", dueDate: "अगले सोमवार" },
  ]
};

const updatesData = {
  en: [
    { title: "Guest Lecture", message: "Special guest lecture on leadership by Col. Verma (Retd.) on Friday at 10 AM.", date: "This Friday" },
    { title: "Mock Test Scheduled", message: "Full syllabus mock test on Saturday. Be prepared.", date: "This Saturday" },
  ],
  hi: [
    { title: "अतिथि व्याख्यान", message: "शुक्रवार सुबह 10 बजे कर्नल वर्मा (सेवानिवृत्त) द्वारा नेतृत्व पर विशेष अतिथि व्याख्यान।", date: "इस शुक्रवार" },
    { title: "मॉक टेस्ट निर्धारित", message: "शनिवार को पूर्ण पाठ्यक्रम मॉक टेस्ट। तैयार रहें।", date: "इस शनिवार" },
  ]
};


export default function SchedulePage() {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t('navSchedule')}</h1>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center space-x-3">
          <CalendarDays className="h-8 w-8 text-accent" />
          <div>
            <CardTitle className="text-2xl font-headline text-primary">{t('classScheduleTitle')}</CardTitle>
            <CardDescription>Today's classes and timings.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {scheduleData[language].map((item, index) => (
              <li key={index} className="p-3 bg-muted/50 rounded-md">
                <p className="font-semibold text-secondary-foreground">{item.time}: {item.subject}</p>
                <p className="text-sm text-muted-foreground">Teacher: {item.teacher}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center space-x-3">
            <ListChecks className="h-8 w-8 text-accent" />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">{t('homeworkAssignments')}</CardTitle>
              <CardDescription>Upcoming homework and due dates.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {homeworkData[language].map((item, index) => (
                <li key={index} className="p-3 bg-muted/50 rounded-md">
                  <p className="font-semibold text-secondary-foreground">{item.subject}: {item.task}</p>
                  <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center space-x-3">
            <Megaphone className="h-8 w-8 text-accent" />
            <div>
              <CardTitle className="text-2xl font-headline text-primary">{t('importantUpdates')}</CardTitle>
              <CardDescription>Latest news and announcements.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {updatesData[language].map((item, index) => (
                <li key={index} className="p-3 bg-muted/50 rounded-md">
                  <p className="font-semibold text-secondary-foreground">{item.title} ({item.date})</p>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
