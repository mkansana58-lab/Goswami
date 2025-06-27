"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { getStudent, updateStudent, type StudentData } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
    fatherName: z.string().min(3, "Father's name is required"),
    class: z.string().min(1, "Class is required"),
    age: z.coerce.number().min(8, "Age must be at least 8"),
    address: z.string().min(10, "Full address is required"),
    school: z.string().min(3, "School name is required"),
    photo: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountPage() {
    const { t } = useLanguage();
    const { student } = useAuth();
    const { toast } = useToast();
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (student?.name) {
            getStudent(student.name).then(data => {
                setStudentData(data);
                if (data) {
                    form.reset({
                        fatherName: data.fatherName || "",
                        class: data.class || "",
                        age: data.age || undefined,
                        address: data.address || "",
                        school: data.school || ""
                    });
                    // If essential data is missing, force edit mode
                    if (!data.fatherName || !data.class) {
                        setIsEditing(true);
                    }
                }
            }).finally(() => setIsLoading(false));
        }
    }, [student?.name, form]);

    const handleProfileUpdate = async (values: ProfileFormValues) => {
        if (!student?.name) return;
        setIsSaving(true);
        
        let photoUrl = studentData?.photoUrl;
        const photoFile = values.photo?.[0];

        if (photoFile) {
            const reader = new FileReader();
            reader.readAsDataURL(photoFile);
            photoUrl = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
            });
        }
        
        const dataToUpdate: Partial<StudentData> = { ...values, photoUrl };

        try {
            await updateStudent(student.name, dataToUpdate);
            setStudentData(prev => ({ ...prev, ...dataToUpdate } as StudentData));
            setIsEditing(false);
            toast({ title: "Profile Updated", description: "Your information has been saved." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
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
                                <AvatarImage src={studentData?.photoUrl || `https://placehold.co/100x100.png?text=${student?.name?.[0]}`} alt="User profile" data-ai-hint="user avatar" />
                                <AvatarFallback>{student?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{studentData?.name}</h2>
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
                            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>{t('cancel')}</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('updateProfile')}
                            </Button>
                        </CardFooter>
                    )}
                </form>
            </Card>
        </div>
    );
}
