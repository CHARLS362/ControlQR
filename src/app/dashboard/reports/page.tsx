'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, MoreHorizontal } from 'lucide-react';
import { attendance, courses } from '@/lib/data';
import type { Attendance } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reasoningToolForAttendanceRecordDeletion } from '@/ai/flows/reasoning-tool-attendance-deletion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

function DeleteAttendanceDialog({ record }: { record: Attendance }) {
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [aiResponse, setAiResponse] = React.useState<{
    shouldDelete: boolean;
    reasoning: string;
  } | null>(null);
  const [isThinking, setIsThinking] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsThinking(true);
    setAiResponse(null);
    try {
      const response = await reasoningToolForAttendanceRecordDeletion({
        studentId: record.studentId,
        courseId: record.courseId,
        date: record.date,
        reason: reason,
      });
      setAiResponse(response);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to get reasoning from AI.',
        variant: 'destructive',
      });
    } finally {
      setIsThinking(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      setReason('');
      setAiResponse(null);
      setIsThinking(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
          Delete Record
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Delete Attendance Record?</DialogTitle>
            <DialogDescription>
              Provide a reason for deleting this record. An AI assistant will
              evaluate if deletion is justified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Deletion</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Student was marked present by mistake."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
          {aiResponse && (
            <Alert variant={aiResponse.shouldDelete ? 'default' : 'destructive'}>
              <AlertTitle>
                {aiResponse.shouldDelete ? 'Recommendation: Delete' : 'Recommendation: Do Not Delete'}
              </AlertTitle>
              <AlertDescription>{aiResponse.reasoning}</AlertDescription>
            </Alert>
          )}
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              disabled={isThinking || !reason}
              variant="destructive"
            >
              {isThinking ? 'Thinking...' : 'Get Recommendation'}
            </Button>
            {aiResponse?.shouldDelete && (
                <Button onClick={() => {
                     toast({ title: 'Success', description: 'Record deleted.'});
                     setOpen(false)
                }}>Confirm Deletion</Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function ReportsPage() {
  const [date, setDate] = React.useState<Date>();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Attendance Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and export attendance records.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Filter Records</CardTitle>
          <CardDescription>
            Select filters to narrow down attendance records.
          </CardDescription>
          <div className="flex items-center gap-4 pt-4">
            <Select>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[280px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record: Attendance) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.studentName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.courseName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === 'Present' ? 'default' : 'destructive'
                      }
                      className={
                        record.status === 'Present' ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white' : ''
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DeleteAttendanceDialog record={record} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
