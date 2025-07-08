export type Agent = {
  agentId: string;
  name: string;
  description: string;
  systemPrompt: string;
  avatarUrl?: string;
  avatarFileKey?: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
  isPublic: boolean;
  tags?: string[];
  category: string;
  usageCount: number;
  files: Array<{
    _id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    attachmentUrl: string;
    fileKey: string;
  }>;
};
