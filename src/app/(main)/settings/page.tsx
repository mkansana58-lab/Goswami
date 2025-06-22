
"use client";

import { useSettings } from '@/context/settings-context';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Glasses } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme, eyeComfort, toggleEyeComfort } = useSettings();
  const { t } = useLanguage();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('settings')}</CardTitle>
          <CardDescription>{t('settingsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-6 w-6 text-foreground" /> : <Sun className="h-6 w-6 text-foreground" />}
              <Label htmlFor="dark-mode-switch" className="text-lg font-medium text-foreground">
                {t('darkMode')}
              </Label>
            </div>
            <Switch
              id="dark-mode-switch"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
               <Glasses className="h-6 w-6 text-foreground" />
               <Label htmlFor="eye-comfort-switch" className="text-lg font-medium text-foreground">
                {t('eyeComfortMode')}
              </Label>
            </div>
            <Switch
              id="eye-comfort-switch"
              checked={eyeComfort}
              onCheckedChange={toggleEyeComfort}
              aria-label="Toggle eye comfort mode"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
