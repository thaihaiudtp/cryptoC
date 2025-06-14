import { magic, googleOAuthConfig } from '../config/magicConfig';
import type { OAuthProvider } from '@magic-ext/oauth';

export class MagicService {
  static async loginWithGoogle() {
    try {
      // Cast provider thành OAuthProvider type
      const result = await magic.oauth.loginWithRedirect({
        ...googleOAuthConfig,
        provider: googleOAuthConfig.provider as OAuthProvider,
      });
      return result;
    } catch (error) {
      console.error('Magic Google login error:', error);
      throw error;
    }
  }

  static async getUserInfo() {
    try {
      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        // Sử dụng getInfo() thay vì getMetadata()
        return await magic.user.getInfo();
      }
      return null;
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      await magic.user.logout();
    } catch (error) {
      console.error('Magic logout error:', error);
      throw error;
    }
  }

  // Thêm method lấy wallet address
  static async getWalletAddress() {
    try {
      const userInfo = await this.getUserInfo();
      return userInfo?.publicAddress || null;
    } catch (error) {
      console.error('Get wallet address error:', error);
      throw error;
    }
  }

  // Thêm method kiểm tra login status
  static async isLoggedIn() {
    try {
      return await magic.user.isLoggedIn();
    } catch (error) {
      console.error('Check login status error:', error);
      return false;
    }
  }
}