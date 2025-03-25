"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export function FileUpload({ 
  onFilesChange, 
  maxSize = 10485760,
  accept = {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  }
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    const newFiles = [...files, ...acceptedFiles]
    setFiles(newFiles)
    onFilesChange(newFiles)
  }, [files, onFilesChange])

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
  })

  return (
    <div className="w-full space-y-4">
      <div {...getRootProps()} className={`
        border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
        transition-colors min-h-[100px] flex items-center justify-center
        ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"}
        ${error ? "border-destructive/50 bg-destructive/10" : ""}
      `}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-1">
          <Upload className="h-6 w-6 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm">Drop the files here...</p>
          ) : (
            <>
              <p className="text-sm">Drag & drop files here, or click to select</p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, TXT, DOCX (Max: 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[232px] overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="group relative flex items-center bg-muted/50 p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="bg-primary/10 p-2 rounded">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                      removeFile(index)
                    }}
                    disabled={false}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  )
}