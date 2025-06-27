"use client";

import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/hooks/use-language";
import { Sun, Moon, Languages } from "lucide-react";
import type { Language } from "@/lib/translations";

export default function SettingsPage() {
  const { theme, setTheme } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('settings')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('themeSettings')}</CardTitle>
          <CardDescription>{t('themeSettingsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={theme}
            onValueChange={(value) => setTheme(value as 'light' | 'dark')}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6" />
                {t('lightTheme')}
              </Label>
            </div>
            <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6" />
                {t('darkTheme')}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('languageSettings')}</CardTitle>
          <CardDescription>{t('languageSettingsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={language}
            onValueChange={(value) => setLanguage(value as Language)}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="en" id="en" className="peer sr-only" />
              <Label
                htmlFor="en"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="mb-3 flex items-center gap-2">
                    <Languages className="h-6 w-6" />
                    <span className="font-bold text-2xl">A</span>
                </div>
                {t('english')}
              </Label>
            </div>
            <div>
              <RadioGroupItem value="hi" id="hi" className="peer sr-only" />
              <Label
                htmlFor="hi"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                 <div className="mb-3 flex items-center gap-2">
                    <Languages className="h-6 w-6" />
                    <span className="font-bold text-2xl font-headline">अ</span>
                </div>
                {t('hindi')}
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
