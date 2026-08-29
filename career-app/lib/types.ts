export type Role = "student" | "admin";
export type Track = "career" | "skill";
export type WeekTrack = "common" | "career" | "skill";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  track: Track | null;
  cohort: string | null;
  created_at: string;
}

export interface Week {
  id: string;
  week_no: number;
  title: string;
  goal: string | null;
  publish_at: string;
  track: WeekTrack;
}

export type MaterialKind = "video" | "slide" | "template";

export interface Material {
  id: string;
  week_id: string;
  kind: MaterialKind;
  title: string;
  external_url: string | null;
  storage_path: string | null;
  note: string | null;
  sort_order: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  week_id: string;
  title: string;
  description: string;
  due_at: string;
  track: WeekTrack;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  body: string | null;
  storage_path: string | null;
  submitted_at: string;
  admin_comment: string | null;
}

export type SlotKind = "meeting" | "lecture";

export interface LessonSlot {
  id: string;
  starts_at: string;
  ends_at: string;
  kind: SlotKind;
  capacity: number;
  track: Track | null;
  cohort: string | null;
  note: string | null;
  created_at: string;
}

export type BookingStatus = "booked" | "cancelled";

export interface Booking {
  id: string;
  slot_id: string;
  student_id: string;
  status: BookingStatus;
  created_at: string;
}

export interface AiChatThread {
  id: string;
  student_id: string;
  title: string;
  created_at: string;
  last_message_at: string;
}

export interface AiChatMessage {
  id: string;
  thread_id: string;
  student_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export type JobApplicationStatus =
  | "applied"
  | "doc_passed"
  | "interview_scheduling"
  | "interviewed"
  | "offer"
  | "rejected";

export interface JobApplication {
  id: string;
  student_id: string;
  company: string;
  applied_on: string;
  channel: string | null;
  status: JobApplicationStatus;
  memo: string | null;
  updated_at: string;
}

export type AnnouncementTarget = "all" | "track" | "cohort";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  target: AnnouncementTarget;
  target_track: Track | null;
  target_cohort: string | null;
  published_at: string;
}

export type AttendanceStatus = "present" | "recorded" | "absent";

export interface Attendance {
  week_id: string;
  student_id: string;
  status: AttendanceStatus;
  noted_at: string;
}
