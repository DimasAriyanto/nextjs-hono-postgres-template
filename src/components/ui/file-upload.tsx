'use client';

import * as React from 'react';
import { UploadCloud, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/libs/utils';
import { Button } from './button';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

async function compressImage(
  file: File,
  quality: number,
  maxDimension: number,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height / width) * maxDimension);
          width = maxDimension;
        } else {
          width = Math.round((width / height) * maxDimension);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

      // Prefer JPEG for photos; fallback to original type for PNG/webp/etc.
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Kompresi gagal')); return; }
          // Keep original name but update extension if type changed
          const ext = outputType === 'image/jpeg' ? '.jpg' : '.png';
          const baseName = file.name.replace(/\.[^.]+$/, '');
          resolve(new File([blob], `${baseName}${ext}`, { type: outputType, lastModified: Date.now() }));
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal memuat gambar')); };
    img.src = url;
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FileUploadProps {
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Accepted MIME types, comma-separated. E.g. "image/*" or "image/jpeg,image/png" */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files when multiple=true (default 10) */
  maxFiles?: number;
  /** Controlled value — pass [] to reset the component */
  value?: File[];
  /** Fires with the updated file list on every add/remove */
  onChange?: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  /** External validation error message */
  error?: string;
  className?: string;
  /** Compress images client-side before adding to the list (default false) */
  compress?: boolean;
  /** JPEG/PNG quality 0–1 (default 0.8). Only used when compress=true */
  compressQuality?: number;
  /** Max width/height in px before resizing (default 1920). Only used when compress=true */
  compressMaxDimension?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FileUpload({
  multiple = false,
  accept,
  maxSize,
  maxFiles = 10,
  value,
  onChange,
  disabled = false,
  label,
  description,
  error,
  className,
  compress = false,
  compressQuality = 0.8,
  compressMaxDimension = 1920,
}: FileUploadProps) {
  const isControlled = value !== undefined;
  const [internalFiles, setInternalFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Stable map: File → objectURL (created once per File instance)
  const previewsRef = React.useRef<Map<File, string>>(new Map());

  React.useEffect(() => {
    const map = previewsRef.current;
    return () => {
      map.forEach((url) => URL.revokeObjectURL(url));
      map.clear();
    };
  }, []);

  // When controlled value resets to [] — clear previews
  const prevLengthRef = React.useRef(0);
  React.useEffect(() => {
    const len = isControlled ? value.length : internalFiles.length;
    if (isControlled && value.length === 0 && prevLengthRef.current > 0) {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewsRef.current.clear();
    }
    prevLengthRef.current = len;
  }, [isControlled, value, internalFiles.length]);

  const files = isControlled ? value : internalFiles;

  function getPreview(file: File): string | undefined {
    if (!file.type.startsWith('image/')) return undefined;
    if (!previewsRef.current.has(file)) {
      previewsRef.current.set(file, URL.createObjectURL(file));
    }
    return previewsRef.current.get(file);
  }

  function validateFile(file: File): string | null {
    if (maxSize && file.size > maxSize) {
      return `${file.name}: terlalu besar (maks ${formatBytes(maxSize)})`;
    }
    if (accept) {
      const types = accept.split(',').map((t) => t.trim());
      const accepted = types.some((t) => {
        if (t.endsWith('/*')) return file.type.startsWith(t.slice(0, -1));
        return file.type === t;
      });
      if (!accepted) return `${file.name}: tipe file tidak didukung`;
    }
    return null;
  }

  async function processFiles(incoming: File[]) {
    setFieldError(null);
    const errors: string[] = [];
    const valid = incoming.filter((f) => {
      const err = validateFile(f);
      if (err) { errors.push(err); return false; }
      return true;
    });
    if (errors.length > 0) { setFieldError(errors[0]); return; }
    if (valid.length === 0) return;

    let processed = valid;

    if (compress) {
      setIsCompressing(true);
      try {
        processed = await Promise.all(
          valid.map((f) =>
            f.type.startsWith('image/')
              ? compressImage(f, compressQuality, compressMaxDimension)
              : Promise.resolve(f),
          ),
        );
      } catch {
        setFieldError('Gagal mengompresi gambar, coba lagi.');
        setIsCompressing(false);
        return;
      }
      setIsCompressing(false);
    }

    const next = multiple
      ? [...files, ...processed].slice(0, maxFiles)
      : [processed[0]];

    if (!isControlled) setInternalFiles(next);
    onChange?.(next);
  }

  function removeFile(target: File) {
    const preview = previewsRef.current.get(target);
    if (preview) { URL.revokeObjectURL(preview); previewsRef.current.delete(target); }
    const next = files.filter((f) => f !== target);
    if (!isControlled) setInternalFiles(next);
    onChange?.(next);
  }

  const displayError = error || fieldError;
  // Show drop zone if: no files yet, OR multiple mode
  const showDropZone = files.length === 0 || multiple;
  const canAddMore = multiple ? files.length < maxFiles : files.length === 0;
  const isDisabled = disabled || isCompressing;

  return (
    <div className={cn('space-y-2', className)}>
      {/* ── Drop zone — only shown when more files can be added ── */}
      {showDropZone && canAddMore && (
        <div
          role="button"
          tabIndex={isDisabled ? -1 : 0}
          aria-label={label ?? 'Upload file'}
          onClick={() => !isDisabled && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !isDisabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!isDisabled) setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (!isDisabled) processFiles(Array.from(e.dataTransfer.files));
          }}
          className={cn(
            'flex items-center justify-center gap-2.5 rounded-lg border-2 border-dashed px-4 py-3.5 text-sm cursor-pointer transition-colors select-none',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/40',
            isDisabled && 'pointer-events-none opacity-50',
            displayError && 'border-destructive'
          )}
        >
          {isCompressing ? (
            <>
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Mengompresi...</span>
            </>
          ) : (
            <>
              <UploadCloud className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                {description ?? (
                  <>
                    Drag &amp; drop atau{' '}
                    <span className="font-medium text-primary">Browse</span>
                    {maxSize ? ` · maks ${formatBytes(maxSize)}` : ''}
                    {multiple && maxFiles && files.length > 0
                      ? ` · ${maxFiles - files.length} file lagi`
                      : ''}
                  </>
                )}
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={accept}
            multiple={multiple}
            disabled={isDisabled}
            onChange={(e) => {
              if (e.target.files) processFiles(Array.from(e.target.files));
              e.target.value = '';
            }}
          />
        </div>
      )}

      {/* ── Validation error ── */}
      {displayError && (
        <p className="text-xs text-destructive">{displayError}</p>
      )}

      {/* ── File list rows ── */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, i) => {
            const preview = getPreview(file);
            return (
              <div
                key={`${file.name}-${file.size}-${i}`}
                className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2"
              >
                {/* Thumbnail / icon */}
                <div className="size-9 shrink-0 overflow-hidden rounded">
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Name + size */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>

                {/* Remove */}
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(file)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
