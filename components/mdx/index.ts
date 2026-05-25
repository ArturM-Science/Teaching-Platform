import { Callout } from './Callout'
import { LearningObjectives } from './LearningObjectives'
import { LabBrief } from './LabBrief'
import { FailureMuseum } from './FailureMuseum'
import { Checkpoint } from './Checkpoint'
import { Quiz } from './Quiz'
import { Video } from './Video'
import { Rubric } from './Rubric'
import { proseComponents } from './prose'

export const mdxComponents = {
  ...proseComponents,
  Callout,
  LearningObjectives,
  LabBrief,
  FailureMuseum,
  Checkpoint,
  Quiz,
  Video,
  Rubric,
}
