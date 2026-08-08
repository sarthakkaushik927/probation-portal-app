import { View, Dimensions, Text } from 'react-native';
import { LineChart, PieChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { useColorScheme } from 'nativewind';
import GlassCard from './GlassCard';

const screenWidth = Dimensions.get('window').width;

const getChartConfig = (isDark: boolean) => ({
  backgroundGradientFrom: isDark ? '#18181b' : '#ffffff',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: isDark ? '#18181b' : '#ffffff',
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
});

export function StatLineChart({ data, title }: { data: any, title?: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!data || !data.datasets || data.datasets.length === 0) return null;

  return (
    <GlassCard className="p-4 mb-6" intensity={isDark ? 30 : 60}>
      {title && <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-4">{title}</Text>}
      <LineChart
        data={data}
        width={screenWidth - 64}
        height={220}
        chartConfig={getChartConfig(isDark)}
        bezier
        style={{ marginVertical: 8, borderRadius: 16 }}
        withDots={true}
        withShadow={false}
      />
    </GlassCard>
  );
}

export function StatPieChart({ data, title }: { data: any[], title?: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!data || data.length === 0) return null;

  return (
    <GlassCard className="p-4 mb-6" intensity={isDark ? 30 : 60}>
      {title && <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</Text>}
      <PieChart
        data={data}
        width={screenWidth - 64}
        height={220}
        chartConfig={getChartConfig(isDark)}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        center={[10, 0]}
        absolute
      />
    </GlassCard>
  );
}

export function StatBarChart({ data, title }: { data: any, title?: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!data || !data.datasets || data.datasets.length === 0) return null;

  const barChartConfig = {
    backgroundGradientFrom: isDark ? '#18181b' : '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: isDark ? '#18181b' : '#ffffff',
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => isDark ? `rgba(99, 102, 241, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(161, 161, 170, ${opacity})` : `rgba(113, 113, 122, ${opacity})`,
    strokeWidth: 0,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    fillShadowGradientFrom: isDark ? '#818cf8' : '#6366f1',
    fillShadowGradientTo: isDark ? '#4f46e5' : '#4338ca',
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientToOpacity: 0.8,
    propsForBackgroundLines: {
      stroke: isDark ? '#27272a' : '#e4e4e7',
      strokeDasharray: '4 4',
      strokeWidth: 1,
    },
  };

  return (
    <GlassCard className="p-4 mb-6" intensity={isDark ? 30 : 60}>
      {title && <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-4">{title}</Text>}
      <BarChart
        data={data}
        width={screenWidth - 64}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={barChartConfig}
        style={{ marginVertical: 8, borderRadius: 16 }}
        showValuesOnTopOfBars
        fromZero
        withInnerLines={true}
      />
    </GlassCard>
  );
}
