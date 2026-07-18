import type { ThemeConfig } from 'antd'

export const themeColors = {
  bgLayout: '#F5F6FA',
  border: '#E5E7EB',
  primary: '#5B6EF5',
  success: '#22C55E',
  text: '#1F2937',
  textSecondary: '#6B7280',
}

export const appTheme: ThemeConfig = {
  token: {
    borderRadius: 8,
    colorBgLayout: themeColors.bgLayout,
    colorBorder: themeColors.border,
    colorPrimary: themeColors.primary,
    colorSuccess: themeColors.success,
    colorText: themeColors.text,
    colorTextSecondary: themeColors.textSecondary,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
}
