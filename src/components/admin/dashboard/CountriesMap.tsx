"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveChoropleth } from "@nivo/geo";
import { alpha2ToAlpha3 } from "i18n-iso-countries";
import { useChartColors } from "/src/lib/chartTokens";
import type { CaseStudyRow } from "/src/lib/dashboardTypes";
import EmptyChartState from "/src/components/admin/dashboard/EmptyChartState";

interface WorldFeatureCollection {
  features: object[];
}

export interface CountriesMapProps {
  rows: CaseStudyRow[];
}

export default function CountriesMap({ rows }: CountriesMapProps) {
  const colors = useChartColors();

  const { data: world, isLoading: worldLoading } = useQuery({
    queryKey: ["world-countries-geojson"],
    queryFn: async (): Promise<WorldFeatureCollection> => {
      const res = await fetch("/world-countries.json");
      if (!res.ok) throw new Error("Failed to load world map data");
      return res.json();
    },
    staleTime: Infinity,
  });

  const countryData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const alpha2 = row.CountryValue?.toUpperCase();
      if (!alpha2) continue;
      const alpha3 = alpha2ToAlpha3(alpha2);
      if (!alpha3) continue;
      counts.set(alpha3, (counts.get(alpha3) ?? 0) + 1);
    }
    return Array.from(counts, ([id, value]) => ({ id, value }));
  }, [rows]);

  if (worldLoading || !world) {
    return <div className="h-full min-h-[400px] w-full animate-pulse rounded-lg bg-surface-container" />;
  }

  if (countryData.length === 0) {
    return <EmptyChartState />;
  }

  const maxValue = Math.max(1, ...countryData.map((c) => c.value));

  return (
    <div className="h-[400px] w-full">
      <ResponsiveChoropleth
        features={world.features}
        data={countryData}
        domain={[0, maxValue]}
        unknownColor={colors.unknown}
        colors={colors.sequential}
        label="properties.name"
        projectionType="naturalEarth1"
        projectionScale={110}
        projectionTranslation={[0.5, 0.55]}
        borderWidth={0.5}
        borderColor={colors.border}
        isInteractive
      />
    </div>
  );
}
