"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveChoropleth } from "@nivo/geo";
import { alpha2ToAlpha3 } from "i18n-iso-countries";
import { Plus, Minus, RefreshCw } from "lucide-react";
import { useChartColors } from "/src/lib/chartTokens";
import type { CaseStudyRow } from "/src/lib/dashboardTypes";
import Heading from "/src/components/ui/Heading";
import EmptyChartState from "/src/components/admin/dashboard/EmptyChartState";

interface WorldFeatureCollection {
  features: object[];
}

const MIN_SCALE = 70;
const MAX_SCALE = 250;
const SCALE_STEP = 20;
const DEFAULT_SCALE = 110;

export interface CountriesMapProps {
  rows: CaseStudyRow[];
  onRefresh: () => void;
}

export default function CountriesMap({ rows, onRefresh }: CountriesMapProps) {
  const colors = useChartColors();
  const [scale, setScale] = useState(DEFAULT_SCALE);

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

  const maxValue = Math.max(1, ...countryData.map((c) => c.value));

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-md flex items-center justify-between">
        <Heading as="h3" className="text-on-surface">
          Countries Represented
        </Heading>
        <div className="flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container p-xs">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setScale((current) => Math.min(current + SCALE_STEP, MAX_SCALE))}
            className="rounded p-xs text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-primary active:scale-95"
          >
            <Plus size={20} />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setScale((current) => Math.max(current - SCALE_STEP, MIN_SCALE))}
            className="rounded p-xs text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-primary active:scale-95"
          >
            <Minus size={20} />
          </button>
          <button
            type="button"
            aria-label="Refresh map data"
            onClick={onRefresh}
            className="ml-xs rounded border-l border-outline-variant p-xs pl-sm text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-primary active:scale-95"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {worldLoading || !world ? (
        <div className="h-full min-h-[400px] w-full animate-pulse rounded-lg bg-surface-container" />
      ) : countryData.length === 0 ? (
        <EmptyChartState />
      ) : (
        <div className="h-[300px] w-full md:h-[400px]">
          <ResponsiveChoropleth
            features={world.features}
            data={countryData}
            domain={[0, maxValue]}
            unknownColor={colors.unknown}
            colors={colors.sequential}
            label="properties.name"
            projectionType="naturalEarth1"
            projectionScale={scale}
            projectionTranslation={[0.5, 0.55]}
            borderWidth={0.5}
            borderColor={colors.border}
            isInteractive
          />
        </div>
      )}
    </div>
  );
}
