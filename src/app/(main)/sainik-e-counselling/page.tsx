
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sainikSchoolsData, type SainikSchool, indianStates } from '@/lib/sainik-schools-data';
import { School, User, Mail, Phone, MapPin, ChevronDown, Loader2 } from 'lucide-react';

const formSchemaDefinition = (t: (key: string) => string) => z.object({
  studentName: z.string().min(2, { message: t('studentNameValidation') }),
  currentClass: z.string().min(1, { message: t('classValidation') }),
  phoneNumber: z.string().min(10, { message: t('phoneValidation') }).regex(/^\+?[0-9\s-()]*$/, { message: t('phoneInvalidChars') }),
  emailAddress: z.string().email({ message: t('emailValidation') }),
  examType: z.string().min(1, { message: t('examValidation') }),
  studentState: z.string().min(1, { message: t('stateValidation') }),
  studentDistrict: z.string().min(2, { message: t('districtValidation') }),
});

type ECounsellingFormValues = z.infer<ReturnType<typeof formSchemaDefinition>>;

export default function SainikECounsellingPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState<SainikSchool[]>([]);
  const [searched, setSearched] = useState(false);

  const currentFormSchema = formSchemaDefinition(t);

  const form = useForm<ECounsellingFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      studentName: "",
      currentClass: "",
      phoneNumber: "",
      emailAddress: "",
      examType: "",
      studentState: "",
      studentDistrict: "",
    },
  });

  const onSubmit: SubmitHandler<ECounsellingFormValues> = async (data) => {
    setIsLoading(true);
    setSearched(true);
    console.log("E-Counselling form data:", data);

    // Simulate API call or heavy computation
    await new Promise(resolve => setTimeout(resolve, 500));

    let sortedSchools = [...sainikSchoolsData];

    // Simplified sorting logic for prototype
    sortedSchools.sort((a, b) => {
      let scoreA = a.simulatedProximityScore;
      let scoreB = b.simulatedProximityScore;

      // Prioritize schools in the same state
      if (a.state.toLowerCase() === data.studentState.toLowerCase()) {
        scoreA -= 50; // Big bonus for same state
      }
      if (b.state.toLowerCase() === data.studentState.toLowerCase()) {
        scoreB -= 50;
      }

      // Prioritize schools in the same district (within the same state)
      if (a.state.toLowerCase() === data.studentState.toLowerCase() && a.district.toLowerCase() === data.studentDistrict.toLowerCase()) {
        scoreA -= 100; // Even bigger bonus for same district
      }
      if (b.state.toLowerCase() === data.studentState.toLowerCase() && b.district.toLowerCase() === data.studentDistrict.toLowerCase()) {
        scoreB -= 100;
      }
      
      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }
      // Fallback to alphabetical sort if scores are equal
      return a.name.localeCompare(b.name);
    });
    
    setFilteredSchools(sortedSchools);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <School className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('sainikECounsellingTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('sainikECounsellingDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="mb-6 bg-muted/50 p-0">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary-foreground">{t('sainikECounsellingFormTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="studentName" render={({ field }) => (<FormItem><FormLabel><User className="inline h-4 w-4 mr-1" />{t('studentName')}</FormLabel><FormControl><Input placeholder={t('studentName')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="currentClass" render={({ field }) => (<FormItem><FormLabel>{t('currentClass')}</FormLabel><FormControl><Input placeholder={t('currentClass')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel><Phone className="inline h-4 w-4 mr-1" />{t('phoneNumber')}</FormLabel><FormControl><Input type="tel" placeholder={t('phoneNumber')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="emailAddress" render={({ field }) => (<FormItem><FormLabel><Mail className="inline h-4 w-4 mr-1" />{t('emailAddress')}</FormLabel><FormControl><Input type="email" placeholder={t('emailAddress')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="examType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('selectExam')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectExam')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sainik_school">{t('sainikSchoolExam')}</SelectItem>
                            <SelectItem value="rms">{t('rmsExam')}</SelectItem>
                            <SelectItem value="other">{t('otherExam')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="studentState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel><MapPin className="inline h-4 w-4 mr-1" />{t('studentState')}</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('studentState')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {indianStates.map(state => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField control={form.control} name="studentDistrict" render={({ field }) => (<FormItem><FormLabel><MapPin className="inline h-4 w-4 mr-1" />{t('studentDistrict')}</FormLabel><FormControl><Input placeholder={t('studentDistrict')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg h-12" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t('loading')}</>) : t('findSchools')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">{t('loading')}</p>
            </div>
          )}

          {!isLoading && searched && filteredSchools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary">{t('sainikSchoolListTitle')}</CardTitle>
                <CardDescription>{t('distanceDisclaimer')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('schoolName')}</TableHead>
                      <TableHead>{t('schoolLocation')}</TableHead>
                      <TableHead>{t('schoolType')}</TableHead>
                      {/* <TableHead className="text-right">{t('schoolDistance')}</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.city}, {school.district}, {school.state}</TableCell>
                        <TableCell>{school.type}</TableCell>
                        {/* <TableCell className="text-right">{school.simulatedProximityScore}</TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 <p className="text-xs text-muted-foreground mt-2 text-center">
                    {sainikSchoolsData.length} {t('sampleSchoolsNote') || "नमूना स्कूल दिखाए गए हैं। वास्तविक सूची भिन्न हो सकती है।"}.
                    {t('totalSchoolsNoteGovt') || " (कुल 33 सरकारी और "}
                    {t('totalSchoolsNotePrivate') || "45 प्राइवेट सैनिक स्कूल हैं)।"}
                  </p>
              </CardContent>
            </Card>
          )}

          {!isLoading && searched && filteredSchools.length === 0 && (
            <p className="text-center text-muted-foreground py-6">{t('noSchoolsFound')}</p>
          )}
           {!isLoading && !searched && (
            <p className="text-center text-muted-foreground py-6">{t('enterDetailsToSeeSchools')}</p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
// Add new translation keys:
// sainikECounsellingTitle: "Sainik School E-Counselling",
// sainikECounsellingDesc: "Enter your details to find Sainik Schools near you.",
// sainikECounsellingFormTitle: "Student Information",
// selectExam: "Select Exam",
// sainikSchoolExam: "Sainik School Entrance",
// rmsExam: "RMS Entrance",
// otherExam: "Other",
// studentState: "Your State",
// studentDistrict: "Your District",
// findSchools: "Find Schools",
// schoolName: "School Name",
// schoolLocation: "Location",
// schoolType: "Type (Govt/Private)",
// schoolDistance: "Proximity/Distance", // Or "निकटता/दूरी"
// noSchoolsFound: "No schools found based on your criteria, or data is not yet available.",
// enterDetailsToSeeSchools: "Please enter your state and district to see relevant Sainik Schools."
// sainikSchoolListTitle: "List of Sainik Schools"
// distanceDisclaimer: "Note: Distance shown is a simulation for prototype purposes and may not be accurate."
// examValidation: "Please select an exam type."
// stateValidation: "Please enter your state."
// districtValidation: "Please enter your district."
// sampleSchoolsNote: "sample schools shown. Actual list may vary."
// totalSchoolsNoteGovt: "(Total 33 Govt. and "
// totalSchoolsNotePrivate: "45 Private Sainik Schools exist)."


// For Hindi:
// sainikECounsellingTitle: "सैनिक स्कूल ई-काउंसलिंग",
// sainikECounsellingDesc: "अपने आस-पास सैनिक स्कूल खोजने के लिए अपना विवरण दर्ज करें।",
// sainikECounsellingFormTitle: "छात्र जानकारी",
// selectExam: "परीक्षा चुनें",
// sainikSchoolExam: "सैनिक स्कूल प्रवेश परीक्षा",
// rmsExam: "RMS प्रवेश परीक्षा",
// otherExam: "अन्य",
// studentState: "आपका राज्य",
// studentDistrict: "आपका जिला",
// findSchools: "स्कूल खोजें",
// schoolName: "स्कूल का नाम",
// schoolLocation: "स्थान",
// schoolType: "प्रकार (सरकारी/प्राइवेट)",
// schoolDistance: "निकटता/दूरी",
// noSchoolsFound: "आपके मानदंडों के आधार पर कोई स्कूल नहीं मिला, या डेटा अभी उपलब्ध नहीं है।",
// enterDetailsToSeeSchools: "संबंधित सैनिक स्कूल देखने के लिए कृपया अपना राज्य और जिला दर्ज करें।"
// sainikSchoolListTitle: "सैनिक स्कूलों की सूची"
// distanceDisclaimer: "ध्यान दें: दिखाई गई दूरी प्रोटोटाइप उद्देश्यों के लिए एक सिमुलेशन है और सटीक नहीं हो सकती है।"
// examValidation: "कृपया एक परीक्षा प्रकार चुनें।"
// stateValidation: "कृपया अपना राज्य दर्ज करें।"
// districtValidation: "कृपया अपना जिला दर्ज करें।"
// sampleSchoolsNote: "नमूना स्कूल दिखाए गए हैं। वास्तविक सूची भिन्न हो सकती है।"
// totalSchoolsNoteGovt: "(कुल 33 सरकारी और "
// totalSchoolsNotePrivate: "45 प्राइवेट सैनिक स्कूल हैं)।"
    