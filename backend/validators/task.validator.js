import { z } from "zod";

export const createTaskSchema = z.object({
    body: z.object({
        title: z.string().trim().min(2).max(150),

        description: z.string().max(5000).optional(),

        projectId: z.string().regex(/^[0-9a-fA-F]{24}$/),

        assignedTo: z.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .nullable()
            .optional(),

        status: z.enum([
            "todo",
            "in-progress",
            "done"
        ]).optional(),

        priority: z.enum([
            "low",
            "medium",
            "high",
            "urgent"
        ]).optional(),

        dueDate: z.iso.datetime({ offset: true })
            .nullable()
            .optional(),

        estimatedHours: z.number()
            .min(0)
            .max(10000)
            .optional()
    }).strict(),

    params: z.object({}),
    query: z.object({})
});