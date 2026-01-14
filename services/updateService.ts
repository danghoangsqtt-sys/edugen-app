
import { AppUpdate } from "../types";

export const CURRENT_VERSION = "1.0.1";
// Thay thế URL này bằng URL raw của file package.json hoặc version.json trên GitHub của bạn
const UPDATE_URL = "https://raw.githubusercontent.com/username/repo/main/package.json"; 

export const checkAppUpdate = async (): Promise<AppUpdate> => {
  try {
    // Trong môi trường thực tế, bạn sẽ fetch từ GitHub. 
    // Ở đây tôi giả lập logic kiểm tra.
    const response = await fetch(UPDATE_URL).catch(() => null);
    
    if (!response || !response.ok) {
      // Nếu không kết nối được GitHub, coi như không có cập nhật để tránh làm phiền người dùng
      return { version: CURRENT_VERSION, changelog: [], downloadUrl: "", hasUpdate: false };
    }

    const remoteData = await response.json();
    const remoteVersion = remoteData.version;

    return {
      version: remoteVersion,
      changelog: remoteData.changelog || ["Cải thiện hiệu năng", "Sửa lỗi bảo mật"],
      downloadUrl: "https://github.com/username/repo/releases",
      hasUpdate: isNewerVersion(remoteVersion, CURRENT_VERSION)
    };
  } catch (error) {
    return { version: CURRENT_VERSION, changelog: [], downloadUrl: "", hasUpdate: false };
  }
};

const isNewerVersion = (remote: string, local: string): boolean => {
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (r[i] > l[i]) return true;
    if (r[i] < l[i]) return false;
  }
  return false;
};
