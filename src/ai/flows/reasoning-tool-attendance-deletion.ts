'use server';
/**
 * @fileOverview A reasoning tool to determine if an attendance record should be deleted.
 *
 * - reasoningToolForAttendanceRecordDeletion - A function that determines if a given attendance record should be deleted.
 * - ReasoningToolForAttendanceRecordDeletionInput - The input type for the reasoningToolForAttendanceRecordDeletion function.
 * - ReasoningToolForAttendanceRecordDeletionOutput - The return type for the reasoningToolForAttendanceRecordDeletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasoningToolForAttendanceRecordDeletionInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  courseId: z.string().describe('The ID of the course.'),
  date: z.string().describe('The date of the attendance record.'),
  reason: z.string().describe('The reason for the requested deletion.'),
  additionalContext: z.string().optional().describe('Any additional context or information relevant to the deletion request.'),
});
export type ReasoningToolForAttendanceRecordDeletionInput = z.infer<typeof ReasoningToolForAttendanceRecordDeletionInputSchema>;

const ReasoningToolForAttendanceRecordDeletionOutputSchema = z.object({
  shouldDelete: z.boolean().describe('A boolean indicating whether the attendance record should be deleted.'),
  reasoning: z.string().describe('The reasoning behind the decision to delete or not delete the record.'),
});
export type ReasoningToolForAttendanceRecordDeletionOutput = z.infer<typeof ReasoningToolForAttendanceRecordDeletionOutputSchema>;

export async function reasoningToolForAttendanceRecordDeletion(input: ReasoningToolForAttendanceRecordDeletionInput): Promise<ReasoningToolForAttendanceRecordDeletionOutput> {
  return reasoningToolForAttendanceRecordDeletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasoningToolForAttendanceRecordDeletionPrompt',
  input: {schema: ReasoningToolForAttendanceRecordDeletionInputSchema},
  output: {schema: ReasoningToolForAttendanceRecordDeletionOutputSchema},
  prompt: `You are an assistant helping administrators determine whether an attendance record should be deleted.

  Based on the information provided, determine whether the attendance record should be deleted.

  Student ID: {{{studentId}}}
  Course ID: {{{courseId}}}
  Date: {{{date}}}
  Reason for deletion: {{{reason}}}
  Additional context: {{{additionalContext}}}

  Provide a clear reasoning for your decision.
  Output a JSON object with 'shouldDelete' (boolean) and 'reasoning' (string) fields.
  `,
});

const reasoningToolForAttendanceRecordDeletionFlow = ai.defineFlow(
  {
    name: 'reasoningToolForAttendanceRecordDeletionFlow',
    inputSchema: ReasoningToolForAttendanceRecordDeletionInputSchema,
    outputSchema: ReasoningToolForAttendanceRecordDeletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
