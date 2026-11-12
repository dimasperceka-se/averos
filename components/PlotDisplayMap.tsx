"use client";

import "ol/ol.css";
import { useEffect, useId, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorSource from "ol/source/Vector";
import VectorTileSource from "ol/source/VectorTile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import MVT from "ol/format/MVT";
import Feature, { type FeatureLike } from "ol/Feature";
import type ImageTile from "ol/ImageTile";
import type Tile from "ol/Tile";
import TileState from "ol/TileState";
import { Polygon } from "ol/geom";
import { Style, Stroke, Fill, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { ChevronDown, Layers, Maximize2, Minimize2, Minus, Plus, X } from "lucide-react";
import type { Plot } from "@/lib/geo";

type Basemap = "osm" | "sat";
type Overlays = { wdpa: boolean };
/** Matches the GFW / JRC / SBTN loss figures of the analysis. */
type LossLayer = "gfw" | "jrc" | "sbtn";
type AreaInfo = { name: string; designation: string; iucn: string };

const GOOGLE_SAT_URL = "https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
/** WDPA protected areas as vector tiles from Global Forest Watch (same dataset the analysis uses). */
const WDPA_URL = "https://tiles.globalforestwatch.org/wdpa_protected_areas/latest/default/{z}/{x}/{y}.pbf";
/**
 * The three datasets behind the GFW / JRC / SBTN loss figures, all from Global Forest Watch:
 * UMD tree cover loss (canopy ≥30% in 2000), the JRC global forest cover map for 2020 and the
 * SBTN natural forests map.
 */
const GFW_LOSS_URL = "https://tiles.globalforestwatch.org/umd_tree_cover_loss/latest/dynamic/{z}/{x}/{y}.png?tree_cover_density_threshold=30";
const JRC_FOREST_URL = "https://tiles.globalforestwatch.org/jrc_global_forest_cover/v2020.3/default/{z}/{x}/{y}.png";
const SBTN_FOREST_URL = "https://tiles.globalforestwatch.org/sbtn_natural_forests_map/v202504/natural_forest/{z}/{x}/{y}.png";
/** Loss tiles carry the loss year in the blue channel (year − 2000); 21 = 2021, after the EUDR cut-off. */
const LOSS_FIRST_YEAR = 21;
const LOSS_COLORS: Record<LossLayer, readonly [number, number, number]> = {
  gfw: [228, 26, 28], // red
  jrc: [245, 130, 13], // orange
  sbtn: [142, 36, 170], // purple
};
const LOSS_SWATCH: Record<LossLayer, string> = { gfw: "bg-[#E41A1C]", jrc: "bg-[#F5820D]", sbtn: "bg-[#8E24AA]" };
const LOSS_LEGEND: Record<LossLayer, string> = {
  gfw: "Tree cover loss since 2021 (canopy ≥30%)",
  jrc: "That loss inside JRC forest cover 2020",
  sbtn: "That loss inside SBTN natural forest",
};

const bitmapOf = (url: string) =>
  fetch(url)
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((blob) => createImageBitmap(blob));

/**
 * Tree cover loss from 2021 on, in one colour (GFW tiles hold every year since 2001). With a
 * mask, only loss where that forest map has forest is kept: the JRC and SBTN loss layers.
 */
function lossTiles(color: readonly [number, number, number], maskUrl?: string) {
  return (tile: Tile, src: string) => {
    const image = (tile as ImageTile).getImage() as HTMLImageElement;
    const zxy = src.match(/\/(\d+)\/(\d+)\/(\d+)\.png/);
    const maskSrc = maskUrl && zxy ? maskUrl.replace("{z}", zxy[1]).replace("{x}", zxy[2]).replace("{y}", zxy[3]) : null;
    Promise.all([bitmapOf(src), maskSrc ? bitmapOf(maskSrc).catch(() => null) : Promise.resolve(null)])
      .then(([loss, mask]) => {
        const canvas = document.createElement("canvas");
        canvas.width = loss.width;
        canvas.height = loss.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("No canvas");
        let maskData: Uint8ClampedArray | null = null;
        if (maskUrl) {
          // No forest tile here means no loss inside that forest either.
          if (mask) {
            ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
            maskData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          } else maskData = new Uint8ClampedArray(canvas.width * canvas.height * 4);
        }
        ctx.drawImage(loss, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = pixels.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 0 && d[i + 2] >= LOSS_FIRST_YEAR && (!maskData || maskData[i + 3] > 0)) {
            d[i] = color[0];
            d[i + 1] = color[1];
            d[i + 2] = color[2];
            d[i + 3] = 255;
          } else d[i + 3] = 0;
        }
        ctx.putImageData(pixels, 0, 0);
        canvas.toBlob((out) => {
          if (!out) return tile.setState(TileState.ERROR);
          const url = URL.createObjectURL(out);
          image.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
          image.src = url;
        });
      })
      .catch(() => tile.setState(TileState.ERROR));
  };
}

function lossSource(color: readonly [number, number, number], maskUrl?: string, attribution = "Tree cover loss: Hansen/UMD/Google/USGS/NASA via Global Forest Watch") {
  return new XYZ({
    url: GFW_LOSS_URL,
    maxZoom: 12,
    tilePixelRatio: 2, // 512 px tiles
    interpolate: false,
    tileLoadFunction: lossTiles(color, maskUrl),
    attributions: attribution,
  });
}

/** IUCN categories the analysis treats as strict (overlap = non-compliant). */
const STRICT_IUCN = new Set(["Ia", "Ib", "II", "III", "IV"]);
/** Zoom 11 and closer: label protected areas. */
const LABEL_RESOLUTION = 80;

const plotStyle = new Style({
  stroke: new Stroke({ color: "#1B3A6B", width: 2 }),
  fill: new Fill({ color: "rgba(27, 58, 107, 0.22)" }),
});

const strictStyle = new Style({
  stroke: new Stroke({ color: "#1F9D5C", width: 1.8 }),
  fill: new Fill({ color: "rgba(61, 220, 132, 0.2)" }),
});
const otherStyle = new Style({
  stroke: new Stroke({ color: "#5FAF85", width: 1.4, lineDash: [6, 4] }),
  fill: new Fill({ color: "rgba(61, 220, 132, 0.08)" }),
});

function areaInfo(f: FeatureLike): AreaInfo {
  return {
    name: String(f.get("name_eng") || f.get("name") || "Protected area"),
    designation: String(f.get("desig_eng") || f.get("desig") || ""),
    iucn: String(f.get("iucn_cat") || "Not reported"),
  };
}

function wdpaStyle(f: FeatureLike, resolution: number): Style[] {
  const base = STRICT_IUCN.has(String(f.get("iucn_cat"))) ? strictStyle : otherStyle;
  if (resolution > LABEL_RESOLUTION) return [base];
  const { name, iucn } = areaInfo(f);
  return [
    base,
    new Style({
      text: new Text({
        text: `${name}\nIUCN ${iucn}`,
        font: "600 11px Inter, ui-sans-serif, system-ui, sans-serif",
        fill: new Fill({ color: "#0E3B26" }),
        stroke: new Stroke({ color: "rgba(255,255,255,0.9)", width: 3 }),
        overflow: false,
      }),
    }),
  ];
}

export default function PlotDisplayMap({ plots }: { plots: Plot[] }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const sourceRef = useRef<VectorSource | null>(null);
  const osmRef = useRef<TileLayer<OSM> | null>(null);
  const satRef = useRef<TileLayer<XYZ> | null>(null);
  const wdpaRef = useRef<VectorTileLayer | null>(null);
  const lossRefs = useRef<Record<LossLayer, TileLayer<XYZ>> | null>(null);
  const forestRefs = useRef<{ jrc: TileLayer<XYZ>; sbtn: TileLayer<XYZ> } | null>(null);
  const [basemap, setBasemap] = useState<Basemap>("osm");
  const [overlays, setOverlays] = useState<Overlays>({ wdpa: true });
  // One loss layer at a time, like the result cards; the forest map behind JRC/SBTN on request.
  const [loss, setLoss] = useState<LossLayer>("gfw");
  const [showForest, setShowForest] = useState(false);
  const radioName = useId();
  const [info, setInfo] = useState<AreaInfo | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Init map once.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const source = new VectorSource();
    sourceRef.current = source;
    const osm = new TileLayer({ source: new OSM(), visible: true });
    const sat = new TileLayer({
      source: new XYZ({
        url: GOOGLE_SAT_URL,
        maxZoom: 20,
        crossOrigin: "anonymous",
        attributions: "Imagery © Google",
      }),
      visible: false,
    });
    const lossLayers = {
      gfw: new TileLayer({ source: lossSource(LOSS_COLORS.gfw) }),
      jrc: new TileLayer({ visible: false, source: lossSource(LOSS_COLORS.jrc, JRC_FOREST_URL, "Tree cover loss (Hansen/UMD) inside JRC forest cover 2020, via Global Forest Watch") }),
      sbtn: new TileLayer({ visible: false, source: lossSource(LOSS_COLORS.sbtn, SBTN_FOREST_URL, "Tree cover loss (Hansen/UMD) inside SBTN natural forests, via Global Forest Watch") }),
    };
    const forest = (url: string, maxZoom: number, attributions: string) =>
      new TileLayer({ opacity: 0.45, visible: false, source: new XYZ({ url, maxZoom, crossOrigin: "anonymous", interpolate: false, attributions }) });
    const forestLayers = {
      // z12, the same tiles the JRC loss layer is masked with.
      jrc: forest(JRC_FOREST_URL, 12, "Forest cover 2020: JRC, European Commission, via Global Forest Watch"),
      sbtn: forest(SBTN_FOREST_URL, 12, "Natural forests: SBTN Natural Lands via Global Forest Watch"),
    };
    const wdpa = new VectorTileLayer({
      declutter: true,
      style: wdpaStyle,
      source: new VectorTileSource({
        format: new MVT(),
        url: WDPA_URL,
        maxZoom: 10, // the dataset stops at z10; closer zooms reuse those tiles
        attributions: "Protected areas: WDPA (UNEP-WCMC & IUCN) via Global Forest Watch",
      }),
    });
    osmRef.current = osm;
    satRef.current = sat;
    wdpaRef.current = wdpa;
    lossRefs.current = lossLayers;
    forestRefs.current = forestLayers;
    const map = new Map({
      target: elRef.current,
      layers: [osm, sat, forestLayers.jrc, forestLayers.sbtn, lossLayers.gfw, lossLayers.jrc, lossLayers.sbtn, wdpa, new VectorLayer({ source, style: plotStyle })],
      // Credits are rendered below as a small line that follows the visible layers.
      controls: [],
      view: new View({ center: fromLonLat([101.45, 0.51]), zoom: 5 }),
    });
    // Click a protected area to see what it is.
    map.on("singleclick", (e) => {
      const hit = map.getFeaturesAtPixel(e.pixel, { layerFilter: (l) => l === wdpa && l.getVisible(), hitTolerance: 2 })[0];
      setInfo(hit ? areaInfo(hit) : null);
    });
    map.on("pointermove", (e) => {
      if (e.dragging) return;
      const over = wdpa.getVisible() && map.hasFeatureAtPixel(e.pixel, { layerFilter: (l) => l === wdpa });
      map.getTargetElement().style.cursor = over ? "pointer" : "";
    });
    mapRef.current = map;
    return () => {
      mapRef.current?.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Render plot polygons and fit the view whenever plots change.
  useEffect(() => {
    const source = sourceRef.current;
    const map = mapRef.current;
    if (!source || !map) return;
    source.clear();
    for (const plot of plots) {
      const ring = plot.ring.map((c) => fromLonLat(c));
      if (ring.length >= 3) {
        source.addFeature(new Feature(new Polygon([[...ring, ring[0]]])));
      }
    }
    const extent = source.getExtent();
    if (extent && Number.isFinite(extent[0]) && extent[0] !== Infinity) {
      map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 16, duration: 400 });
    }
  }, [plots]);

  useEffect(() => {
    osmRef.current?.setVisible(basemap === "osm");
    satRef.current?.setVisible(basemap === "sat");
  }, [basemap]);

  useEffect(() => {
    wdpaRef.current?.setVisible(overlays.wdpa);
    if (!overlays.wdpa) setInfo(null);
  }, [overlays]);

  useEffect(() => {
    const l = lossRefs.current;
    const f = forestRefs.current;
    if (!l || !f) return;
    l.gfw.setVisible(loss === "gfw");
    l.jrc.setVisible(loss === "jrc");
    l.sbtn.setVisible(loss === "sbtn");
    f.jrc.setVisible(loss === "jrc" && showForest);
    f.sbtn.setVisible(loss === "sbtn" && showForest);
  }, [loss, showForest]);

  useEffect(() => {
    const id = window.setTimeout(() => mapRef.current?.updateSize(), 60);
    return () => window.clearTimeout(id);
  }, [isFullscreen]);

  // Esc exits fullscreen.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const zoomBy = (d: number) => {
    const view = mapRef.current?.getView();
    if (!view) return;
    view.animate({ zoom: (view.getZoom() ?? 12) + d, duration: 200 });
  };

  const toggle = (key: keyof Overlays, label: string, swatch: string) => (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-navy select-none">
      <input
        type="checkbox"
        checked={overlays[key]}
        onChange={(e) => setOverlays((o) => ({ ...o, [key]: e.target.checked }))}
        className="h-4 w-4 cursor-pointer accent-[#1b3a6b]"
      />
      <span className={`h-3 w-3 flex-none rounded-[3px] ${swatch}`} />
      {label}
    </label>
  );

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[120] bg-white"
          : "relative h-full min-h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200"
      }
    >
      <div ref={elRef} className="absolute inset-0 h-full w-full" />

      {/* Overlay layers */}
      <fieldset className="absolute top-4 left-4 z-10 m-0 flex max-w-[calc(100%-5rem)] flex-col gap-2 rounded-[10px] border border-slate-200 bg-white/95 px-3.5 py-2.5 leading-[normal] shadow-sm">
        <legend className="sr-only">Map layers</legend>
        <button
          type="button"
          aria-expanded={panelOpen}
          onClick={() => setPanelOpen((v) => !v)}
          className="flex cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-0 font-mono text-[11px] tracking-[0.06em] text-slate-500 uppercase"
        >
          Layers
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${panelOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        {panelOpen && toggle("wdpa", "Protected areas (WDPA)", "border-2 border-[#1F9D5C] bg-emerald-50")}
        {panelOpen && overlays.wdpa && (
          <span className="flex flex-col gap-1 pl-6 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px] border-[1.5px] border-[#1F9D5C] bg-[#3DDC84]/30" />
              Strict, IUCN Ia–IV
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px] border-[1.5px] border-dashed border-[#5FAF85]" />
              Other categories
            </span>
          </span>
        )}
        {panelOpen && (
          <div role="radiogroup" aria-label="Deforestation loss" className="mt-0.5 flex flex-col gap-1.5 border-t border-slate-100 pt-2">
            <span className="font-mono text-[10px] tracking-[0.06em] text-slate-400 uppercase">Deforestation loss</span>
            {(["gfw", "jrc", "sbtn"] as const).map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-[13px] text-navy select-none">
                <input
                  type="radio"
                  name={radioName}
                  checked={loss === key}
                  onChange={() => setLoss(key)}
                  className="h-4 w-4 cursor-pointer accent-[#1b3a6b]"
                />
                <span className={`h-3 w-3 flex-none rounded-[3px] ${LOSS_SWATCH[key]}`} />
                {key.toUpperCase()} loss
              </label>
            ))}
            <span className="max-w-[240px] pl-6 text-[11px] leading-snug text-slate-500">{LOSS_LEGEND[loss]}</span>
            {(loss === "jrc" || loss === "sbtn") && (
              <label className="flex cursor-pointer items-center gap-2 pl-6 text-[12px] text-slate-600 select-none">
                <input type="checkbox" checked={showForest} onChange={(e) => setShowForest(e.target.checked)} className="h-3.5 w-3.5 cursor-pointer accent-[#1b3a6b]" />
                Show the {loss === "jrc" ? "JRC forest 2020" : "SBTN natural forest"} map
              </label>
            )}
          </div>
        )}
      </fieldset>

      {/* Clicked protected area */}
      {info && (
        <div
          role="status"
          className="absolute top-4 left-1/2 z-10 flex max-w-[min(360px,calc(100%-8rem))] -translate-x-1/2 items-start gap-3 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2.5 leading-[normal] shadow-sm"
        >
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[13px] font-semibold text-navy">{info.name}</span>
            <span className="text-[12px] text-slate-500">
              {[info.designation, `IUCN ${info.iucn}`].filter(Boolean).join(" · ")}
              {STRICT_IUCN.has(info.iucn) ? " · strict" : ""}
            </span>
          </span>
          <button type="button" aria-label="Close" onClick={() => setInfo(null)} className="rounded p-0.5 text-slate-500 hover:text-navy">
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsFullscreen((v) => !v)}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-navy shadow-sm hover:bg-slate-50"
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Basemap toggle */}
      <div className="absolute bottom-4 left-4 z-10 flex overflow-hidden rounded-lg border border-slate-200 bg-white text-xs font-semibold shadow-sm">
        <button
          type="button"
          onClick={() => setBasemap("osm")}
          aria-pressed={basemap === "osm"}
          className={`flex items-center gap-1 px-2.5 py-1.5 ${
            basemap === "osm" ? "bg-navy text-white" : "text-navy"
          }`}
        >
          <Layers className="h-3 w-3" aria-hidden="true" />
          Street
        </button>
        <button
          type="button"
          onClick={() => setBasemap("sat")}
          aria-pressed={basemap === "sat"}
          className={`px-2.5 py-1.5 ${
            basemap === "sat" ? "bg-navy text-white" : "text-navy"
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Credits */}
      <p className="absolute right-0 bottom-0 z-10 m-0 max-w-[60%] rounded-tl-md bg-white/75 px-1.5 py-0.5 text-right text-[9.5px] leading-[1.35] text-[#3A403C]">
        {[
          basemap === "osm" ? "© OpenStreetMap contributors" : "Imagery © Google",
          overlays.wdpa && "Protected areas: WDPA (UNEP-WCMC & IUCN) via GFW",
          "Tree cover loss: Hansen/UMD via GFW",
          loss === "jrc" && "Forest 2020: JRC via GFW",
          loss === "sbtn" && "Natural forests: SBTN via GFW",
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {/* Zoom */}
      <div className="absolute right-4 bottom-8 z-10 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => zoomBy(1)}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center text-navy hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="h-px w-full bg-slate-200" />
        <button
          type="button"
          onClick={() => zoomBy(-1)}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center text-navy hover:bg-slate-100"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
