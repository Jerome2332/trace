export interface Diagnosis {
  rootCause: string
  technicalDetail: string
  failedProgram?: string
  failedInstruction?: string
  affectedAccount?: string
  errorCode?: string
  suggestedFix: string
  codeSnippet?: string
  docsUrl?: string
  severity: 'error' | 'warning' | 'info'
  confidence: 'high' | 'medium' | 'low'
  generatedAt: string
}
