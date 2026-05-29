import { Callout } from './Callout'
import { LearningObjectives } from './LearningObjectives'
import { LabBrief } from './LabBrief'
import { FailureMuseum } from './FailureMuseum'
import { Checkpoint } from './Checkpoint'
import { Quiz } from './Quiz'
import { Video } from './Video'
import { Rubric } from './Rubric'
import { SlideViewer } from './SlideViewer'
import { TemperatureExplorer } from './TemperatureExplorer'
import { AttentionVisualizer } from './AttentionVisualizer'
import { LLMPipelineViz } from './LLMPipelineViz'
import { FunctionCallFlow } from './FunctionCallFlow'
import { ReActTrace } from './ReActTrace'
import { CoTScratchpad } from './CoTScratchpad'
import { SelfCorrectionLoop } from './SelfCorrectionLoop'
import { ContextWindowSim } from './ContextWindowSim'
import { RAGPipelineViz } from './RAGPipelineViz'
import { AgenticRAGLoop } from './AgenticRAGLoop'
import { MemoryConsolidationViz } from './MemoryConsolidationViz'
import { EmbeddingExplorer } from './EmbeddingExplorer'
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
  SlideViewer,
  TemperatureExplorer,
  AttentionVisualizer,
  LLMPipelineViz,
  FunctionCallFlow,
  ReActTrace,
  CoTScratchpad,
  SelfCorrectionLoop,
  ContextWindowSim,
  RAGPipelineViz,
  AgenticRAGLoop,
  MemoryConsolidationViz,
  EmbeddingExplorer,
}
