import React from 'react';
import Svg, { Defs, Pattern, Path, Rect, Circle, Line } from 'react-native-svg';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';

interface DomainSwatchProps {
  domain: string;
  size?: number;
  className?: string;
}

export default function DomainSwatch({ domain, size = 16, className = "" }: DomainSwatchProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const color = isDark ? '#d4d4d8' : '#3f3f46'; // zinc-300 dark / zinc-700 light (brighter for icon)

  const renderPattern = () => {
    switch (domain) {
      case 'FRONTEND': // diagonal hatch (45°)
        return (
          <Pattern id="frontend" width="8" height="8" patternUnits="userSpaceOnUse">
            <Path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke={color} strokeWidth="1.5" />
          </Pattern>
        );
      case 'BACKEND': // diagonal hatch (-45°)
        return (
          <Pattern id="backend" width="8" height="8" patternUnits="userSpaceOnUse">
            <Path d="M2,-2 l-4,4 M8,0 l-8,8 M10,6 l-4,4" stroke={color} strokeWidth="1.5" />
          </Pattern>
        );
      case 'UIUX': // dot grid
        return (
          <Pattern id="uiux" width="6" height="6" patternUnits="userSpaceOnUse">
            <Circle cx="3" cy="3" r="1.5" fill={color} />
          </Pattern>
        );
      case 'APP': // vertical lines
        return (
          <Pattern id="app" width="6" height="6" patternUnits="userSpaceOnUse">
            <Line x1="3" y1="0" x2="3" y2="6" stroke={color} strokeWidth="1.5" />
          </Pattern>
        );
      case 'CLOUD': // horizontal lines
        return (
          <Pattern id="cloud" width="6" height="6" patternUnits="userSpaceOnUse">
            <Line x1="0" y1="3" x2="6" y2="3" stroke={color} strokeWidth="1.5" />
          </Pattern>
        );
      case 'ML': // cross-hatch (both diagonals)
        return (
          <Pattern id="ml" width="8" height="8" patternUnits="userSpaceOnUse">
            <Path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke={color} strokeWidth="1" />
            <Path d="M2,-2 l-4,4 M8,0 l-8,8 M10,6 l-4,4" stroke={color} strokeWidth="1" />
          </Pattern>
        );
      default: // plain
        return null;
    }
  };

  const patternId = domain?.toLowerCase() || 'common';

  return (
    <View 
      style={{ width: size, height: size }} 
      className={`overflow-hidden rounded-sm border border-black dark:border-white bg-black ${className}`}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          {renderPattern()}
        </Defs>
        {domain !== 'COMMON' && domain !== 'UNASSIGNED' && (
          <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
        )}
      </Svg>
    </View>
  );
}
