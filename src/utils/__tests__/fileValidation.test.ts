import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_IMAGE_SIZE_BYTES,
  formatFileSize,
  pickValidImage,
  pickValidImages,
  validateFiles,
} from "../fileValidation";

/** 지정한 크기/타입을 갖는 가짜 File 생성 */
function makeFile(name: string, type: string, size: number): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("validateFiles", () => {
  it("허용 형식이고 용량 이내면 모두 통과한다", () => {
    const files = [
      makeFile("a.jpg", "image/jpeg", 1024),
      makeFile("b.png", "image/png", 2048),
    ];
    const result = validateFiles(files);

    expect(result.accepted).toHaveLength(2);
    expect(result.rejected).toHaveLength(0);
    expect(result.message).toBeNull();
  });

  it("허용하지 않는 형식은 걸러낸다", () => {
    const files = [
      makeFile("doc.pdf", "application/pdf", 1024),
      makeFile("ok.png", "image/png", 1024),
    ];
    const result = validateFiles(files);

    expect(result.accepted.map((file) => file.name)).toEqual(["ok.png"]);
    expect(result.rejected[0].reason).toBe("형식");
    expect(result.message).toContain("doc.pdf");
  });

  it("MIME 타입이 비어 있으면 확장자로 판정한다", () => {
    const result = validateFiles([
      makeFile("photo.HEIC", "", 1024),
      makeFile("archive.zip", "", 1024),
    ]);

    expect(result.accepted.map((file) => file.name)).toEqual(["photo.HEIC"]);
    expect(result.rejected.map((item) => item.file.name)).toEqual(["archive.zip"]);
  });

  it("최대 용량을 넘으면 걸러낸다", () => {
    const result = validateFiles([
      makeFile("big.jpg", "image/jpeg", MAX_IMAGE_SIZE_BYTES + 1),
      makeFile("edge.jpg", "image/jpeg", MAX_IMAGE_SIZE_BYTES),
    ]);

    expect(result.accepted.map((file) => file.name)).toEqual(["edge.jpg"]);
    expect(result.rejected[0].reason).toBe("용량");
    expect(result.message).toContain("10MB");
  });

  it("최대 개수를 넘으면 초과분을 걸러낸다", () => {
    const files = Array.from({ length: 4 }, (_, index) =>
      makeFile(`${index}.png`, "image/png", 1024),
    );
    const result = validateFiles(files, { maxCount: 2 });

    expect(result.accepted).toHaveLength(2);
    expect(result.message).toContain("최대 2개");
  });

  it("이미 첨부된 개수를 합산해 제한한다", () => {
    const files = [
      makeFile("a.png", "image/png", 1024),
      makeFile("b.png", "image/png", 1024),
    ];
    const result = validateFiles(files, { maxCount: 3, currentCount: 2 });

    expect(result.accepted.map((file) => file.name)).toEqual(["a.png"]);
    expect(result.message).toContain("최대 3개");
  });
});

describe("formatFileSize", () => {
  it("단위를 사람이 읽을 수 있게 변환한다", () => {
    expect(formatFileSize(512)).toBe("512B");
    expect(formatFileSize(2048)).toBe("2KB");
    expect(formatFileSize(10 * 1024 * 1024)).toBe("10MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5MB");
  });
});

describe("pickValidImages / pickValidImage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** 브라우저 전역 alert을 대체한다 (테스트 환경에는 window가 없다) */
  function stubAlert() {
    const alertSpy = vi.fn();
    vi.stubGlobal("alert", alertSpy);
    return alertSpy;
  }

  it("문제가 있으면 alert로 안내하고 통과한 파일만 반환한다", () => {
    const alertSpy = stubAlert();
    const accepted = pickValidImages([
      makeFile("ok.png", "image/png", 1024),
      makeFile("bad.txt", "text/plain", 1024),
    ]);

    expect(accepted.map((file) => file.name)).toEqual(["ok.png"]);
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  it("문제가 없으면 alert를 띄우지 않는다", () => {
    const alertSpy = stubAlert();
    pickValidImages([makeFile("ok.png", "image/png", 1024)]);

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("단일 파일 검증은 통과 시 파일, 실패 시 null을 반환한다", () => {
    stubAlert();

    expect(pickValidImage(makeFile("ok.png", "image/png", 1024))?.name).toBe("ok.png");
    expect(pickValidImage(makeFile("bad.txt", "text/plain", 1024))).toBeNull();
    expect(pickValidImage(undefined)).toBeNull();
  });
});
