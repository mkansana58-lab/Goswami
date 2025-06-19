
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
import { School, User, Mail, Phone, MapPin, Loader2, ExternalLink, LogIn, ListChecks, LayoutGrid } from 'lucide-react'; // Added ExternalLink, LogIn, ListChecks, LayoutGrid

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
    console.log("E-Counselling form data for proximity search:", data);

    await new Promise(resolve => setTimeout(resolve, 500));

    let sortedSchools = [...sainikSchoolsData];

    sortedSchools.sort((a, b) => {
      let scoreA = a.simulatedProximityScore;
      let scoreB = b.simulatedProximityScore;
      if (a.state.toLowerCase() === data.studentState.toLowerCase()) scoreA -= 50;
      if (b.state.toLowerCase() === data.studentState.toLowerCase()) scoreB -= 50;
      if (a.state.toLowerCase() === data.studentState.toLowerCase() && a.district.toLowerCase() === data.studentDistrict.toLowerCase()) scoreA -= 100;
      if (b.state.toLowerCase() === data.studentState.toLowerCase() && b.district.toLowerCase() === data.studentDistrict.toLowerCase()) scoreB -= 100;
      return scoreA !== scoreB ? scoreA - scoreB : a.name.localeCompare(b.name);
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
          {/* Official E-Counselling Links Section */}
          <Card className="mb-8 bg-muted/30">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary-foreground">{t('officialECounsellingLinksTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                <a href="https://pesa.ncog.gov.in/sainikschoolecounselling/signin" target="_blank" rel="noopener noreferrer">
                  <LogIn className="mr-2 h-4 w-4"/> {t('eCounsellingLoginButton')} <ExternalLink className="ml-auto h-4 w-4 opacity-70"/>
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                <a href="https://pesa.ncog.gov.in/sainikschoolecounselling/WaitingListForCandidate" target="_blank" rel="noopener noreferrer">
                  <ListChecks className="mr-2 h-4 w-4"/> {t('waitingListButton')} <ExternalLink className="ml-auto h-4 w-4 opacity-70"/>
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 sm:col-span-2 lg:col-span-1">
                <a href="https://pesa.ncog.gov.in/sainikschoolecounselling/ViewSeatAllocationMatrix" target="_blank" rel="noopener noreferrer">
                  <LayoutGrid className="mr-2 h-4 w-4"/> {t('seatMatrixButton')} <ExternalLink className="ml-auto h-4 w-4 opacity-70"/>
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Find Schools by Proximity Section */}
          <Card className="mb-6 bg-muted/50 p-0">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-secondary-foreground">{t('findSchoolsByProximityTitle')}</CardTitle>
                <CardDescription>{t('findSchoolsByProximityDesc')}</CardDescription>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchools.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">{school.name}</TableCell>
                        <TableCell>{school.city}, {school.district}, {school.state}</TableCell>
                        <TableCell>{school.type}</TableCell>
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
    
