export type UserRole = 'learner' | 'instructor'
export type ProgressStatus = 'not_started' | 'in_progress' | 'complete'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Course {
  id: string
  slug: string
  title: string
}

export interface Module {
  id: string
  course_id: string
  number: number
  slug: string
  title: string
}

export interface Progress {
  id: string
  user_id: string
  module_id: string
  status: ProgressStatus
  checkpoint_passed_at: string | null
  updated_at: string
}

export interface Workshop {
  id: string
  module_id: string
  title: string
  scheduled_at: string
  meeting_url: string
  replay_url: string | null
  instructor_id: string
}

export interface WorkshopRegistration {
  workshop_id: string
  user_id: string
  registered_at: string
}
