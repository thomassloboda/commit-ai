export interface FileDiff {
  filename: string
  content: string
}

export interface FileDiffProvider {
  getFileDiffs(): Promise<FileDiff[]>
}
