
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  background: '#F5F5F5',      // light gray
  text: '#212121',            // dark gray
  textSecondary: '#757575',   // medium gray
  primary: '#4CAF50',         // green - for positive reinforcement
  secondary: '#FFC107',       // amber - for highlights
  accent: '#03A9F4',          // light blue - for interactive elements
  card: '#FFFFFF',            // white
  highlight: '#BBDEFB',       // very light blue
  error: '#F44336',           // red for reset/delete actions
  success: '#4CAF50',         // green for success states
  warning: '#FF9800',         // orange for warnings
};

export const darkColors = {
  background: '#121212',      // dark background
  text: '#FFFFFF',            // white text
  textSecondary: '#B0B0B0',   // light gray
  primary: '#4CAF50',         // green - for positive reinforcement
  secondary: '#FFC107',       // amber - for highlights
  accent: '#03A9F4',          // light blue - for interactive elements
  card: '#1E1E1E',            // dark card
  highlight: '#2196F3',       // blue highlight
  error: '#F44336',           // red for reset/delete actions
  success: '#4CAF50',         // green for success states
  warning: '#FF9800',         // orange for warnings
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(76, 175, 80, 0.3)',
    elevation: 3,
    minHeight: 48,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(255, 193, 7, 0.3)',
    elevation: 3,
    minHeight: 48,
  },
  buttonDanger: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(244, 67, 54, 0.3)',
    elevation: 3,
    minHeight: 48,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    minHeight: 48,
  },
  buttonOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSmall: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 6px rgba(76, 175, 80, 0.25)',
    elevation: 2,
    minHeight: 40,
  },
  buttonSmallText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shadow: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
});
