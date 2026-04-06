// ==========================================
// Notification Helper - Drive Cleaner
// ==========================================

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export async function notifyComplete(title: string, body: string): Promise<void> {
  let granted = await isPermissionGranted();
  if (!granted) {
    const perm = await requestPermission();
    granted = perm === "granted";
  }
  if (granted) {
    sendNotification({ title, body });
  }
}
