
import { AppUpdate } from "../types";

// Phiên bản hiện tại của mã nguồn đang chạy trên máy
export const CURRENT_VERSION = "1.0.1";

/**
 * URL trỏ đến file package.json trên GitHub của bạn.
 * Dùng raw.githubusercontent.com để lấy dữ liệu JSON trực tiếp.
 */
const UPDATE_URL = "https://raw.githubusercontent.com/danghoangsqtt-sys/edugen-app/main/package.json"; 

export const checkAppUpdate = async (): Promise<AppUpdate> => {
  try {
    // Thực hiện gọi API lấy file package.json từ GitHub
    const response = await fetch(UPDATE_URL, {
      cache: 'no-store' // Đảm bảo không lấy dữ liệu cũ từ cache trình duyệt
    });
    
    if (!response || !response.ok) {
      console.warn("Không thể kết nối đến máy chủ cập nhật GitHub.");
      return { version: CURRENT_VERSION, changelog: [], downloadUrl: "", hasUpdate: false };
    }

    const remoteData = await response.json();
    const remoteVersion = remoteData.version; // Ví dụ: "1.0.2"

    // URL trang download (thường là trang Releases)
    const downloadUrl = "https://github.com/danghoangsqtt-sys/edugen-app/releases";

    return {
      version: remoteVersion,
      // Lấy changelog từ file remote hoặc dùng mặc định
      changelog: remoteData.changelog || [
        "Sửa lỗi Content Security Policy (CSP)",
        "Sửa lỗi truy cập thuộc tính .text của Gemini AI",
        "Tối ưu hóa giao diện và cấu hình Electron"
      ],
      downloadUrl: downloadUrl,
      hasUpdate: isNewerVersion(remoteVersion, CURRENT_VERSION)
    };
  } catch (error) {
    console.error("Lỗi kiểm tra cập nhật:", error);
    return { version: CURRENT_VERSION, changelog: [], downloadUrl: "", hasUpdate: false };
  }
};

/**
 * So sánh 2 chuỗi version (Semantic Versioning)
 * Trả về true nếu remote > local
 */
const isNewerVersion = (remote: string, local: string): boolean => {
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  
  // So sánh từng bậc: Major.Minor.Patch
  for (let i = 0; i < 3; i++) {
    const rVal = r[i] || 0;
    const lVal = l[i] || 0;
    if (rVal > lVal) return true;
    if (rVal < lVal) return false;
  }
  return false;
};
