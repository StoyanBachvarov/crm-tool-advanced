import { useWindowDimensions, type ViewStyle } from 'react-native';

export function useResponsiveLayout(maxWidth = 1040) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const containerStyle: ViewStyle = {
    alignSelf: 'center',
    width: '100%',
    maxWidth,
  };

  return { containerStyle, isWide, width };
}
