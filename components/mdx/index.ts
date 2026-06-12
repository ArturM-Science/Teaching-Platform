import { Callout } from './Callout'
import { LearningObjectives } from './LearningObjectives'
import { LabBrief } from './LabBrief'
import { FailureMuseum } from './FailureMuseum'
import { Checkpoint } from './Checkpoint'
import { Quiz } from './Quiz'
import { Video } from './Video'
import { Rubric } from './Rubric'
import { Solution } from './Solution'
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
import { EvalChallengeViz } from './EvalChallengeViz'
import { EvalSetBuilder } from './EvalSetBuilder'
import { ScoringPlayground } from './ScoringPlayground'
import { JudgeBiasDemo } from './JudgeBiasDemo'
import { RegressionRunnerViz } from './RegressionRunnerViz'
import { WorkflowDiagram } from './WorkflowDiagram'
import { ClassifierRouter } from './ClassifierRouter'
import { RepairLoopSim } from './RepairLoopSim'
import { AgentVsWorkflow } from './AgentVsWorkflow'
import { AgentRoleExplorer } from './AgentRoleExplorer'
import { CommunicationPatternSim } from './CommunicationPatternSim'
import { FailureCascadeSim } from './FailureCascadeSim'
import { StatefulReplicaSim } from './StatefulReplicaSim'
import { RetryBackoffSim } from './RetryBackoffSim'
import { OWASPThreatMap } from './OWASPThreatMap'
import { PromptInjectionSim } from './PromptInjectionSim'
import { AgentPermissionAudit } from './AgentPermissionAudit'
import { proseComponents } from './prose'
import { AgentTraceViz } from './AgentTraceViz'
import { TokenCostCalculator } from './TokenCostCalculator'
import { FallbackChainSim } from './FallbackChainSim'
import { AgentStateTimeline } from './AgentStateTimeline'
import { TransparencyLevelSim } from './TransparencyLevelSim'
import { ApprovalGateSim } from './ApprovalGateSim'
import { FeedbackCorrectionSim } from './FeedbackCorrectionSim'
import { StreamingOutputSim } from './StreamingOutputSim'
import { FrontierReadinessScorecard } from './FrontierReadinessScorecard'
import { AutonomyRunSimulator } from './AutonomyRunSimulator'
import { CapstoneProjectScoper } from './CapstoneProjectScoper'
import { LaunchReadinessReview } from './LaunchReadinessReview'
import { AgentProtocolComparison } from './AgentProtocolComparison'
import { A2AProtocolMovie } from './A2AProtocolMovie'

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
  Solution,
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
  EvalChallengeViz,
  EvalSetBuilder,
  ScoringPlayground,
  JudgeBiasDemo,
  RegressionRunnerViz,
  WorkflowDiagram,
  ClassifierRouter,
  RepairLoopSim,
  AgentVsWorkflow,
  AgentRoleExplorer,
  CommunicationPatternSim,
  FailureCascadeSim,
  StatefulReplicaSim,
  RetryBackoffSim,
  OWASPThreatMap,
  PromptInjectionSim,
  AgentPermissionAudit,
  AgentTraceViz,
  TokenCostCalculator,
  FallbackChainSim,
  AgentStateTimeline,
  TransparencyLevelSim,
  ApprovalGateSim,
  FeedbackCorrectionSim,
  StreamingOutputSim,
  FrontierReadinessScorecard,
  AutonomyRunSimulator,
  CapstoneProjectScoper,
  LaunchReadinessReview,
  AgentProtocolComparison,
  A2AProtocolMovie,
}
