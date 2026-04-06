// @AC AC-notify
import * as notifPlugin from "@tauri-apps/plugin-notification";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifyComplete } from "./notify";

describe("notifyComplete", () => {
  const mockIsPermissionGranted = vi.mocked(notifPlugin.isPermissionGranted);
  const mockRequestPermission = vi.mocked(notifPlugin.requestPermission);
  const mockSendNotification = vi.mocked(notifPlugin.sendNotification);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("許可済みの場合は sendNotification を呼び requestPermission を呼ばない", async () => {
    mockIsPermissionGranted.mockResolvedValue(true);

    await notifyComplete("完了", "スキャンが終わりました");

    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(mockSendNotification).toHaveBeenCalledWith({
      title: "完了",
      body: "スキャンが終わりました",
    });
  });

  it("未許可で granted の場合は requestPermission → sendNotification を呼ぶ", async () => {
    mockIsPermissionGranted.mockResolvedValue(false);
    mockRequestPermission.mockResolvedValue("granted");

    await notifyComplete("完了", "処理終了");

    expect(mockRequestPermission).toHaveBeenCalledOnce();
    expect(mockSendNotification).toHaveBeenCalledWith({
      title: "完了",
      body: "処理終了",
    });
  });

  it("未許可で denied の場合は sendNotification を呼ばない", async () => {
    mockIsPermissionGranted.mockResolvedValue(false);
    mockRequestPermission.mockResolvedValue("denied");

    await notifyComplete("完了", "処理終了");

    expect(mockSendNotification).not.toHaveBeenCalled();
  });
});
