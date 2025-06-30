
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { getTestResultsForStudent, type TestResultData } from "@/lib/firebase";
import { Loader2, LineChart, BarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

type ChartData = {
  name: string;
  percentage: number;
};

export default function ProgressReportPage() {
  const { t } = useLanguage();
  const { student } = useAuth();
  const [testResults, setTestResults] = useState<TestResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (student?.name) {
      getTestResultsForStudent(student.name)
        .then((results) => {
          setTestResults(results);
          const dataForChart = results
            .map(r => ({
              name: r.testName,
              percentage: parseFloat(r.percentage.toFixed(2)),
            }))
            .reverse(); // Show oldest first in chart
          setChartData(dataForChart);
        })
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [student]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <LineChart className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-primary mt-2">Progress Report</h1>
        <p className="text-muted-foreground">Track your performance across all tests.</p>
      </div>

      {testResults.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Performance Chart</CardTitle>
              <CardDescription>Your percentage scores in recent tests.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ percentage: { label: "Score", color: "hsl(var(--primary))" } }} className="h-64 w-full">
                <ResponsiveContainer>
                  <RechartsBarChart data={chartData}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" height={60} interval={0} />
                    <YAxis dataKey="percentage" domain={[0, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="percentage" fill="var(--color-percentage)" radius={4} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Detailed Test History</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testResults.map(result => (
                            <TableRow key={result.id}>
                                <TableCell>{result.testName}</TableCell>
                                <TableCell>{result.score}/{result.totalQuestions}</TableCell>
                                <TableCell>{result.percentage.toFixed(1)}%</TableCell>
                                <TableCell>{format(result.submittedAt.toDate(), 'PPP')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

        </>
      ) : (
        <Card className="text-center p-10">
          <CardContent>
            <h2 className="text-xl font-semibold">No Test Data Found</h2>
            <p className="text-muted-foreground mt-2">
              You haven't completed any tests yet. Go to the AI Test section to start one!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
