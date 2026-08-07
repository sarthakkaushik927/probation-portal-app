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

  return (
    <GlassCard className="p-4 mb-6" intensity={isDark ? 30 : 60}>
      {title && <Text className="text-lg font-bold text-zinc-900 dark:text-white mb-4">{title}</Text>}
      <BarChart
        data={data}
        width={screenWidth - 64}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={getChartConfig(isDark)}
        style={{ marginVertical: 8, borderRadius: 16 }}
        showValuesOnTopOfBars
      />
    </GlassCard>
  );
}
