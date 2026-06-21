const FILE_TYPES = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "avif"],
  video: ["mp4", "webm", "mov", "avi", "mkv", "wmv", "flv"],
  audio: ["mp3", "wav", "ogg", "aac", "flac", "wma", "m4a"],
  pdf: ["pdf"],
  document: ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "rtf", "odt", "ods", "odp"],
  archive: ["zip", "rar", "7z", "tar", "gz", "bz2"],
  code: ["js", "ts", "py", "java", "cpp", "c", "h", "html", "css", "json", "xml", "yaml", "yml", "md", "sql", "sh", "bat", "go", "rs", "rb", "php"],
};

export function detectFileType(filename: string, mimeType?: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (mimeType?.startsWith("image/") || FILE_TYPES.image.includes(ext)) return "Image";
  if (mimeType?.startsWith("video/") || FILE_TYPES.video.includes(ext)) return "Video";
  if (mimeType?.startsWith("audio/") || FILE_TYPES.audio.includes(ext)) return "Audio";
  if (ext === "pdf") return "PDF";
  if (FILE_TYPES.document.includes(ext)) return "Document";
  if (FILE_TYPES.archive.includes(ext)) return "Archive";
  if (FILE_TYPES.code.includes(ext)) return "Code";
  return "File";
}

export function canPreview(filename: string, mimeType?: string): boolean {
  const type = detectFileType(filename, mimeType);
  return ["Image", "Video", "Audio", "PDF"].includes(type);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

export function formatFileType(type: string, ext?: string): string {
  const map: Record<string, string> = {
    Image: "Image",
    Video: "Video",
    Audio: "Audio",
    PDF: "PDF",
    Document: "Document",
    Archive: "Archive",
    Code: "Code",
    File: "File",
  };
  return map[type] || (ext ? ext.toUpperCase() : "File");
}
