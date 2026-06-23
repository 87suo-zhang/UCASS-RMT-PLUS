/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface ForumPost {
  id: string;
  title: string;
  category: '摄像' | '字幕' | '导播' | '综合讨论';
  author: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  comments: Comment[];
  isPinned?: boolean;
}

export interface EquipmentParameter {
  name: string;
  value: string;
  description: string;
  tip: string;
}

export interface EmergencyCase {
  id: string;
  trigger: string;
  sign: string;
  action: string[];
  prevent: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
