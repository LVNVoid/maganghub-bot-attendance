import { db } from "@/services/db";
import {
  CreateFeedbackInput,
  FeedbackCategory,
  FeedbackStatus,
  UpdateFeedbackStatusInput,
} from "@/schemas/feedback-schema";

export type { FeedbackCategory, FeedbackStatus };

export interface FeedbackItem {
  id: string;
  userId: string;
  category: FeedbackCategory;
  subject: string;
  message: string;
  status: FeedbackStatus;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string | null;
    email: string;
  };
}

export interface FeedbackStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export async function getUserFeedbacks(userId: string): Promise<FeedbackItem[]> {
  const feedbacks = await db.feedback.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return feedbacks as unknown as FeedbackItem[];
}

export async function getAllFeedbacks(filter?: {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
}): Promise<FeedbackItem[]> {
  const where: {
    status?: FeedbackStatus;
    category?: FeedbackCategory;
  } = {};

  if (filter?.status) {
    where.status = filter.status;
  }
  if (filter?.category) {
    where.category = filter.category;
  }

  const feedbacks = await db.feedback.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return feedbacks as unknown as FeedbackItem[];
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
  const [total, open, inProgress, resolved] = await Promise.all([
    db.feedback.count(),
    db.feedback.count({ where: { status: "OPEN" } }),
    db.feedback.count({ where: { status: "IN_PROGRESS" } }),
    db.feedback.count({ where: { status: "RESOLVED" } }),
  ]);

  return { total, open, inProgress, resolved };
}

export async function createFeedback(
  userId: string,
  data: CreateFeedbackInput
): Promise<FeedbackItem> {
  const created = await db.feedback.create({
    data: {
      userId,
      category: data.category,
      subject: data.subject,
      message: data.message,
      status: "OPEN",
    },
  });

  return created as unknown as FeedbackItem;
}

export async function updateFeedbackStatus(
  data: UpdateFeedbackStatusInput
): Promise<FeedbackItem> {
  const updated = await db.feedback.update({
    where: { id: data.id },
    data: {
      status: data.status,
      adminNote: data.adminNote !== undefined ? data.adminNote : undefined,
    },
  });

  return updated as unknown as FeedbackItem;
}
