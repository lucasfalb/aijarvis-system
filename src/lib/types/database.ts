interface DatabaseRecord {
    id: string;
    created_at: string;
    updated_at: string;
  }
  
  export type ProjectStatus = 'active' | 'archived' | 'deleted';
  export type MonitorStatus = 'active' | 'inactive' | 'error';
  export type WebhookStatus = 'active' | 'inactive' | 'error';
  export type CommentStatus = 'pending' | 'approved' | 'rejected';
  export type ResponseStatus = 'pending' | 'approved' | 'rejected';
  export type ReviewStatus = 'approved' | 'rejected';
  
  export interface Project extends DatabaseRecord {
    name: string;
    description?: string | null; // ✅ Standardized
    status: ProjectStatus;
  }
  
  export interface Monitor extends DatabaseRecord {
    project_id: string;
    name: string;
    type: 'social' | 'web' | 'api';
    settings?: Record<string, any>;
    status: MonitorStatus;
  }
  
  export interface Webhook extends DatabaseRecord {
    monitor_id: string;
    url: string;
    headers?: Record<string, string>;
    events: Array<'comment' | 'response' | 'review'>;
    status: WebhookStatus;
  }
  
  export interface Comment extends DatabaseRecord {
    monitor_id: string;
    webhook_id: string;
    content: string;
    metadata?: Record<string, any>;
    status: CommentStatus;
    source?: string;
    author?: string;
  }
  
  export interface Response extends DatabaseRecord {
    comment_id: string;
    content: string;
    reviewed_by: string | null;
    status: ResponseStatus;
    metadata?: Record<string, any>;
    ai_generated: boolean;
  }
  
  export interface ResponseReview extends DatabaseRecord {
    response_id: string;
    reviewed_by: string;
    status: ReviewStatus;
    notes?: string;
    review_date: string;
  }
  
  export interface CommentTag extends DatabaseRecord {
    comment_id: string;
    tag: string;
    created_by?: string;
  }
  
  export interface Log extends DatabaseRecord {
    action: string;
    details: string;
    user_id: string;
    user?: {
      id: string;
      email: string;
    };
  }
  
  export interface UserProject extends DatabaseRecord {
    user_id: string;
    project_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    projects?: {
      id: string;
      name: string;
      description?: string | null; // ✅ Standardized
      created_at: string;
    };
  }
  
  export type ProjectActionResult = {
    success: boolean;
    project?: { id: string; name: string; description?: string | null }; // ✅ Standardized
    error?: string;
  };
  