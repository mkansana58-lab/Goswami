
"use client";

import { useLanguage } from '@/hooks/use-language';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Download, ListChecks, ArrowLeft } from 'lucide-react';

export interface SchoolChoiceData {
    applicationNo: string;
    candidateName: string;
    fatherName: string;
    gender: string;
    category: string;
    domicile: string;
}

interface Props {
  data: SchoolChoiceData;
  onBack: () => void;
}

const schoolList = [
    "Sainik School Jhunjhunu", "Sainik School Chittorgarh", "Sainik School Jhansi", "Sainik School Mainpuri",
    "Sainik School Rewari", "Sainik School Amethi", "Sainik School Kunjpura", "Sainik School Rewa",
    "Sainik School Ghorakhal", "Sainik School Sujanpur Tira", "Sainik School Kapurthala", "Sainik School Gopalganj",
    "Sainik School Nagrota", "Sainik School Ambikapur", "Sainik School Nalanda", "Sainik School Tilaiya",
    "Sainik School Chandrapur", "Sainik School Purulia", "Sainik School Sambalpur", "Sainik School Balachadi",
    "Sainik School Satara", "Sainik School Bhubaneswar", "Sainik School Bijapur", "Sainik School Korukonda",
    "Sainik School Goalpara", "Sainik School Kalikiri", "Sainik School Kodagu", "Sainik School Punglwa",
    "Sainik School East Siang", "Sainik School Imphal", "Sainik School Chhingchhip", "Sainik School Amaravathinagar",
    "Sainik School Kazhakootam", "Tagore Science Residential School", "Shri Hanwant Senior Secondary English Medium School",
    "Shri Bhawani Niketan Public School", "Good Day Defence School", "Bhartiya Public School", "Gokuldas Public School",
    "Saraswati Gramodaya Higher Secondary School", "Saraswati Vidhya Mandir Higher Secondary School", "Syna International School",
    "Samvid Gurukulam Girls Sainik School", "Shakuntlam International School", "Surya Sainik School", "Dayanand Public School",
    "Royal International Residential School", "Shri Baba Mastnath Residential Public School", "Smt Kesaridevi Lohiya Public School"
];

export function SchoolChoiceCertificate({ data, onBack }: Props) {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-8">
        <Button variant="outline" onClick={onBack} className="mb-4 no-print">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Form
        </Button>
       <div className="printable-area">
        <style jsx global>{`
            @media print {
            body * { visibility: hidden; }
            .printable-area, .printable-area * { visibility: visible; }
            .printable-area { position: absolute; left: 0; top: 0; width: 100%; margin:0; padding: 1rem; }
            .no-print { display: none; }
            }
        `}</style>
        <Card className="border-2 border-primary">
            <CardHeader className="text-center bg-muted/20 p-4">
            <div className="flex items-center justify-center gap-3 mb-2">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <div>
                <CardTitle className="text-lg font-bold text-primary">ALL INDIA SAINIK SCHOOLS ADMISSION COUNSELLING</CardTitle>
                <CardDescription className="text-sm font-semibold">PRIORITY LIST OF SCHOOL</CardDescription>
                </div>
            </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="border grid grid-cols-4">
                    <div className="p-2 border-b border-r font-semibold text-sm">Application No :</div>
                    <div className="p-2 border-b border-r text-sm">{data.applicationNo}</div>
                    <div className="p-2 border-b border-r font-semibold text-sm">Candidate Name :</div>
                    <div className="p-2 border-b text-sm">{data.candidateName}</div>
                    <div className="p-2 border-b border-r font-semibold text-sm">Father Name :</div>
                    <div className="p-2 border-b border-r text-sm">{data.fatherName}</div>
                    <div className="p-2 border-b border-r font-semibold text-sm">Category :</div>
                    <div className="p-2 border-b text-sm">{data.category}</div>
                    <div className="p-2 border-r font-semibold text-sm">Gender :</div>
                    <div className="p-2 border-r text-sm">{data.gender}</div>
                    <div className="p-2 border-r font-semibold text-sm">Domicile :</div>
                    <div className="p-2 text-sm">{data.domicile}</div>
                </div>

                <div className="mt-4 border-t border-b border-l border-r">
                    <div className="grid grid-cols-12 bg-muted/50 font-semibold border-b">
                        <div className="p-2 col-span-2 border-r text-sm">Priority</div>
                        <div className="p-2 col-span-10 text-sm">School Name</div>
                    </div>
                    <div>
                        {schoolList.slice(0, 49).map((school, index) => (
                             <div key={index} className="grid grid-cols-12 text-sm">
                                <div className={`p-2 col-span-2 border-r ${index < schoolList.length -1 ? 'border-b': ''}`}>{index + 1}</div>
                                <div className={`p-2 col-span-10 ${index < schoolList.length -1 ? 'border-b': ''}`}>{school}</div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="flex justify-between items-center mt-4 text-sm">
                    <p>Application No: {data.applicationNo}</p>
                    <p>Page 1</p>
                    <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                </div>

            </CardContent>
            <CardFooter className="justify-center p-4 no-print">
                <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" />Download</Button>
            </CardFooter>
        </Card>
       </div>
    </div>
  );
}
