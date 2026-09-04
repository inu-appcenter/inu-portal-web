/**
 * 파일 업로드 클라이언트 사이드 검증.
 *
 * 서버에 올리기 전에 형식(MIME/확장자)과 용량, 개수를 미리 확인해
 * 불필요한 업로드와 실패를 줄인다.
 *
 * WebView(특히 안드로이드)에서는 `File.type`이 빈 문자열로 오는 경우가 있어
 * MIME 타입이 비어 있으면 확장자로 판정한다.
 */

/** 업로드를 허용하는 이미지 MIME 타입 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/** 업로드를 허용하는 이미지 확장자 (MIME 타입이 비어 있을 때 사용) */
export const ALLOWED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "heif",
] as const;

/** 이미지 한 장 최대 용량 (10MB) */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** 한 번에 첨부할 수 있는 기본 이미지 개수 */
export const DEFAULT_MAX_IMAGE_COUNT = 10;

export interface FileValidationOptions {
  /** 허용 MIME 타입 (기본: 이미지) */
  allowedMimeTypes?: readonly string[];
  /** 허용 확장자 (기본: 이미지) */
  allowedExtensions?: readonly string[];
  /** 파일 한 개 최대 용량(byte) (기본: 10MB) */
  maxSizeBytes?: number;
  /** 첨부 가능한 최대 개수 (기본: 10) */
  maxCount?: number;
  /** 이미 첨부되어 있는 개수 (개수 제한 계산에 합산) */
  currentCount?: number;
}

export interface FileValidationResult {
  /** 모든 검증을 통과한 파일 */
  accepted: File[];
  /** 걸러진 파일과 사유 */
  rejected: { file: File; reason: string }[];
  /** 사용자에게 보여줄 안내 문구 (문제가 없으면 null) */
  message: string | null;
}

/** byte를 사람이 읽기 쉬운 문자열로 변환 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10}MB`;
}

/** 파일명에서 소문자 확장자 추출 (없으면 빈 문자열) */
function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === fileName.length - 1) return "";
  return fileName.slice(dotIndex + 1).toLowerCase();
}

/** 형식(MIME 또는 확장자)이 허용 목록에 있는지 */
function hasAllowedType(
  file: File,
  allowedMimeTypes: readonly string[],
  allowedExtensions: readonly string[],
): boolean {
  const mimeType = file.type.toLowerCase();
  if (mimeType) {
    return allowedMimeTypes.some((allowed) => allowed.toLowerCase() === mimeType);
  }
  // WebView 등에서 MIME 타입이 비어 있는 경우 확장자로 판정
  return allowedExtensions.includes(getExtension(file.name));
}

/**
 * 파일 목록을 형식·용량·개수 기준으로 검증한다.
 * 통과한 파일만 `accepted`로 돌려주고, 거절된 파일은 사유와 함께 담는다.
 */
export function validateFiles(
  files: File[],
  options: FileValidationOptions = {},
): FileValidationResult {
  const {
    allowedMimeTypes = ALLOWED_IMAGE_MIME_TYPES,
    allowedExtensions = ALLOWED_IMAGE_EXTENSIONS,
    maxSizeBytes = MAX_IMAGE_SIZE_BYTES,
    maxCount = DEFAULT_MAX_IMAGE_COUNT,
    currentCount = 0,
  } = options;

  const accepted: File[] = [];
  const rejected: { file: File; reason: string }[] = [];
  const invalidTypeNames: string[] = [];
  const oversizeNames: string[] = [];
  let overflowCount = 0;

  for (const file of files) {
    if (!hasAllowedType(file, allowedMimeTypes, allowedExtensions)) {
      rejected.push({ file, reason: "형식" });
      invalidTypeNames.push(file.name);
      continue;
    }
    if (file.size > maxSizeBytes) {
      rejected.push({ file, reason: "용량" });
      oversizeNames.push(file.name);
      continue;
    }
    if (currentCount + accepted.length >= maxCount) {
      rejected.push({ file, reason: "개수" });
      overflowCount += 1;
      continue;
    }
    accepted.push(file);
  }

  const messages: string[] = [];
  if (invalidTypeNames.length > 0) {
    messages.push(
      `지원하지 않는 형식입니다: ${invalidTypeNames.join(", ")}\n(${allowedExtensions.join(", ")}만 첨부할 수 있어요.)`,
    );
  }
  if (oversizeNames.length > 0) {
    messages.push(
      `파일당 ${formatFileSize(maxSizeBytes)}까지 첨부할 수 있어요: ${oversizeNames.join(", ")}`,
    );
  }
  if (overflowCount > 0) {
    messages.push(`최대 ${maxCount}개까지 첨부할 수 있어요.`);
  }

  return {
    accepted,
    rejected,
    message: messages.length > 0 ? messages.join("\n\n") : null,
  };
}

/**
 * 이미지 첨부 공통 처리. 검증에 걸린 파일이 있으면 alert로 안내하고,
 * 통과한 파일만 돌려준다.
 */
export function pickValidImages(
  files: File[],
  options: FileValidationOptions = {},
): File[] {
  const { accepted, message } = validateFiles(files, options);
  if (message) alert(message);
  return accepted;
}

/**
 * 이미지 한 장 첨부용. 통과하면 파일, 걸리면 alert 후 null.
 */
export function pickValidImage(
  file: File | null | undefined,
  options: FileValidationOptions = {},
): File | null {
  if (!file) return null;
  return pickValidImages([file], { ...options, maxCount: 1, currentCount: 0 })[0] ?? null;
}
