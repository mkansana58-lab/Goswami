
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { getStudent, updateStudent, getEnrollmentsForStudent, redeemWinningsForAttempts, deleteTestEnrollment, type StudentData, type TestEnrollment } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Edit, Banknote, IndianRupee, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { fileToDataUrl } from "@/lib/utils";

const profileSchema = z.object({
    fatherName: z.string().min(3, "Father's name is required"),
    class: z.string().min(1, "Class is required"),
    age: z.coerce.number().min(8, "Age must be at least 8"),
    address: z.string().min(10, "Full address is required"),
    school: z.string().min(3, "School name is required"),
    photo: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ATTEMPT_COST = 20000;

export default function AccountPage() {
    const { t } = useLanguage();
    const { student, refreshStudentData, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [enrollments, setEnrollments] = useState<TestEnrollment[]>([]);
    const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
    const [isUnenrolling, setIsUnenrolling] = useState<string | null>(null);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (student?.name) {
            getStudent(student.name).then(data => {
                if (data) {
                    setStudentData(data);
                    form.reset({
                        fatherName: data.fatherName || "",
                        class: data.class || "",
                        age: data.age || undefined,
                        address: data.address || "",
                        school: data.school || ""
                    });
                    if (!data.fatherName || !data.class) {
                        setIsEditing(true);
                    }
                } else {
                    setStudentData({ name: student.name, createdAt: Date.now() });
                    setIsEditing(true);
                }
            }).finally(() => setIsLoading(false));
            getEnrollmentsForStudent(student.name).then(setEnrollments);
        } else {
            setIsLoading(false);
        }
    }, [student?.name, form]);

    const handleProfileUpdate = async (values: ProfileFormValues) => {
        if (!student?.name) return;
        setIsSaving(true);
        
        let photoUrl = studentData?.photoUrl;
        const photoFile = values.photo?.[0];

        if (photoFile) {
            try {
                photoUrl = await fileToDataUrl(photoFile);
            } catch (e: any) {
                toast({ variant: 'destructive', title: 'Image Error', description: e.message });
                setIsSaving(false);
                return;
            }
        }
        
        const { photo, ...dataToSave } = values;
        const dataToUpdate: Partial<Omit<StudentData, 'id' | 'createdAt'>> = { ...dataToSave, photoUrl, name: student.name };

        try {
            await updateStudent(student.name, dataToUpdate);
            await refreshStudentData(student.name);
            setStudentData(prev => ({ ...prev, ...dataToUpdate } as StudentData));
            setIsEditing(false);
            toast({ title: "Profile Updated", description: "Your information has been saved." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRedeem = async (enrollmentId: string) => {
        if (!student?.name || (student.quizWinnings || 0) < ATTEMPT_COST) {
            toast({ variant: 'destructive', title: 'Not enough winnings!' });
            return;
        }
        setIsRedeeming(enrollmentId);
        try {
            await redeemWinningsForAttempts(student.name, enrollmentId, ATTEMPT_COST, 1);
            await refreshStudentData(student.name);
            const updatedEnrollments = await getEnrollmentsForStudent(student.name);
            setEnrollments(updatedEnrollments);
            toast({ title: 'Success!', description: '1 extra attempt has been added.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Redemption failed. Please try again.' });
        } finally {
            setIsRedeeming(null);
        }
    };
    
    const handleUnenroll = async (enrollmentId: string) => {
        if (!student?.name) return;
        setIsUnenrolling(enrollmentId);
        try {
            await deleteTestEnrollment(enrollmentId);
            toast({ title: 'Unenrolled', description: 'You have successfully unenrolled from the test.' });
            const updatedEnrollments = await getEnrollmentsForStudent(student.name);
            setEnrollments(updatedEnrollments);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to unenroll. Please try again.' });
        } finally {
            setIsUnenrolling(null);
        }
    };

    if (isLoading || isAuthLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-primary">{t('profile')}</h1>
            </div>

            <Card>
                <form onSubmit={form.handleSubmit(handleProfileUpdate)}>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{isEditing ? t('editProfile') : t('accountDetails')}</CardTitle>
                                <CardDescription>
                                    {isEditing ? t('completeProfileDesc') : t('accountDetailsDescription')}
                                </CardDescription>
                            </div>
                            {!isEditing && (
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={student?.photoUrl || `https://placehold.co/100x100.png?text=${student?.name?.[0]}`} alt="User profile" data-ai-hint="user avatar" />
                                <AvatarFallback>{student?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{student?.name}</h2>
                                {isEditing && (
                                    <div className="mt-2">
                                        <Label htmlFor="photo">{t('profilePhoto')}</Label>
                                        <Input id="photo" type="file" accept="image/*" {...form.register('photo')} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div><Label>{t('fathersName')}</Label><Input {...form.register('fatherName')} /><p className="text-destructive text-xs">{form.formState.errors.fatherName?.message}</p></div>
                                <div><Label>{t('selectClass')}</Label><Input {...form.register('class')} /><p className="text-destructive text-xs">{form.formState.errors.class?.message}</p></div>
                                <div><Label>{t('age')}</Label><Input type="number" {...form.register('age')} /><p className="text-destructive text-xs">{form.formState.errors.age?.message}</p></div>
                                <div><Label>{t('schoolName')}</Label><Input {...form.register('school')} /><p className="text-destructive text-xs">{form.formState.errors.school?.message}</p></div>
                                <div className="md:col-span-2"><Label>{t('fullAddress')}</Label><Input {...form.register('address')} /><p className="text-destructive text-xs">{form.formState.errors.address?.message}</p></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-4">
                                <p className="font-semibold">{t('fathersName')}:</p><p>{studentData?.fatherName || 'N/A'}</p>
                                <p className="font-semibold">{t('selectClass')}:</p><p>{studentData?.class || 'N/A'}</p>
                                <p className="font-semibold">{t('age')}:</p><p>{studentData?.age || 'N/A'}</p>
                                <p className="font-semibold">{t('schoolName')}:</p><p>{studentData?.school || 'N/A'}</p>
                                <p className="font-semibold">{t('fullAddress')}:</p><p>{studentData?.address || 'N/A'}</p>
                            </div>
                        )}
                    </CardContent>
                    {isEditing && (
                        <CardFooter className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>{t('cancel')}</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('updateProfile')}
                            </Button>
                        </CardFooter>
                    )}
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Banknote /> Redeem Winnings</CardTitle>
                    <CardDescription>Use your quiz winnings to buy more test attempts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-4 rounded-lg bg-accent">
                        <p className="text-sm text-accent-foreground">Your Winnings Balance</p>
                        <p className="text-4xl font-bold text-primary flex items-center justify-center">
                            <IndianRupee className="h-8 w-8" />
                            {(student?.quizWinnings || 0).toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">Your Enrolled Tests:</h4>
                        {enrollments.length > 0 ? (
                            enrollments.map(e => (
                                <div key={e.id} className="flex justify-between items-center p-3 border rounded-lg bg-background/50">
                                    <div>
                                        <p className="font-medium">{e.testName}</p>
                                        <p className="text-xs text-muted-foreground">Allowed Attempts: {e.allowedAttempts || 0}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleRedeem(e.id!)}
                                            disabled={isRedeeming === e.id || (student?.quizWinnings || 0) < ATTEMPT_COST}
                                            className="shrink-0"
                                        >
                                            {isRedeeming === e.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Buy 1 Attempt <IndianRupee className="h-3 w-3 ml-1" />{ATTEMPT_COST.toLocaleString('en-IN')}</>}
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want to unenroll?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will remove your enrollment for "{e.testName}". You will lose any purchased extra attempts. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleUnenroll(e.id!)} disabled={isUnenrolling === e.id}>
                                                        {isUnenrolling === e.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Unenroll'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">You have not enrolled in any tests yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
