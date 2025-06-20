
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink } from 'lucide-react'; // MessageSquare can be replaced with Whatsapp icon if available
import Link from 'next/link';

// Placeholder WhatsApp Channel Link - Replace with your actual channel link
const WHATSAPP_CHANNEL_LINK = "https://whatsapp.com/channel/YOUR_CHANNEL_ID_HERE"; 
// Or use a click-to-chat link like: "https://wa.me/91YOURPHONENUMBER"

export default function WhatsAppChannelPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-xl mx-auto space-y-8 py-8">
      <Card className="shadow-xl border-primary/30">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            {/* Consider using a WhatsApp icon if you add one, for now MessageSquare or a generic chat icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.85L2 22l5.25-1.38c1.45.73 3.08 1.15 4.79 1.15h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zm0 18.06c-1.58 0-3.12-.42-4.44-1.15l-.32-.19-3.31.87.89-3.23-.21-.33c-.8-1.34-1.28-2.95-1.28-4.66 0-4.48 3.64-8.12 8.12-8.12 4.48 0 8.12 3.64 8.12 8.12s-3.64 8.12-8.12 8.12zm4.44-5.74c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06s-1.03-.38-1.96-1.21c-.73-.64-1.22-1.43-1.36-1.67-.14-.24-.02-.38.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.19-.48-.39-.41-.53-.42h-.48c-.15 0-.38.04-.58.24-.2.2-.76.74-.76 1.81s.78 2.1.89 2.24c.11.14 1.53 2.32 3.72 3.27.52.23.93.37 1.25.47.55.17 1.05.15 1.44.09.43-.06 1.43-.58 1.63-1.14.2-.56.2-.94.14-1.06s-.22-.18-.46-.3z"/>
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold font-headline text-primary">{t('joinWhatsAppChannelTitle')}</CardTitle>
          <CardDescription className="text-lg">{t('joinWhatsAppChannelDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <Button asChild className="w-full max-w-xs mx-auto h-12 text-lg bg-green-500 hover:bg-green-600 text-white">
            <Link href={WHATSAPP_CHANNEL_LINK} target="_blank" rel="noopener noreferrer">
              {t('openWhatsAppChannelButton')} <ExternalLink className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground px-4">
            {t('whatsAppChannelNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Add to translations:
// joinWhatsAppChannelTitle: "Join Our WhatsApp Channel" / "हमारे व्हाट्सएप चैनल से जुड़ें"
// joinWhatsAppChannelDesc: "Stay connected with us on WhatsApp for the latest updates, discussions, and direct support." / "नवीनतम अपडेट, चर्चाओं और सीधे समर्थन के लिए व्हाट्सएप पर हमसे जुड़े रहें।"
// openWhatsAppChannelButton: "Open WhatsApp Channel" / "व्हाट्सएप चैनल खोलें"
// whatsAppChannelNote: "This will open WhatsApp (app or web). Please ensure you have WhatsApp installed or are logged into WhatsApp Web." / "यह व्हाट्सएप (ऐप या वेब) खोलेगा। कृपया सुनिश्चित करें कि आपके पास व्हाट्सएप इंस्टॉल है या आप व्हाट्सएप वेब में लॉग इन हैं।"

// Update existing translations:
// navChat: "WhatsApp Channel" / "व्हाट्सएप चैनल"
// chatRoomDesc: "Connect with us on our WhatsApp Channel for updates and discussions." / "अपडेट और चर्चाओं के लिए हमारे व्हाट्सएप चैनल से जुड़ें।"
// (Removing old chat related keys if any are specific to the Firestore chat)
// displayNameLabel, displayNamePlaceholder, setDisplayNameButton, displayNameSetSuccess, displayNameCannotBeEmpty, messageCannotBeEmpty, setDisplayNamePrompt, anonymousUser, chattingAs, changeNameButton, sending, setDisplayNameFirst, chatStartConversation
// typeYourMessage, sendButton
