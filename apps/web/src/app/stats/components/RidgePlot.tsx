'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { colors } from '../../../../../../brand/colors';

interface RidgePlotProps {
  data: any[];
  domain: [number, number];
  height: number;
  title?: string;
}

export const RidgePlot = ({ data, domain, height, title }: RidgePlotProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTeam, setHoveredTeam] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(800);

  // Monitor container width for responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Chart dimensions - responsive width
    const margin = { top: 20, right: 30, bottom: 60, left: 150 };
    const width = containerWidth - margin.left - margin.right;

    // Calculate height based on number of ridges to prevent bleeding
    const ridgeHeight = 25;
    const ridgeGap = 28;

    // For positional charts, use smaller dimensions and tighter spacing
    const isPositional =
      title?.includes('QB') ||
      title?.includes('RB') ||
      title?.includes('WR') ||
      title?.includes('TE') ||
      title?.includes('DEF');
    const adjustedRidgeGap = isPositional ? 24 : ridgeGap;

    // Calculate exact chart height needed
    const contentHeight = 45 + data.length * adjustedRidgeGap + 20; // start + ridges + bottom padding

    // Create scales
    const xScale = d3.scaleLinear().domain(domain).range([0, width]);

    // Create container group
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add X-axis at the bottom of content area
    const axisY = contentHeight;
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d.toString());

    g.append('g')
      .attr('transform', `translate(0, ${axisY})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Add axis label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', axisY + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(title || 'Weekly Scores');

    // Render ridges
    data.forEach((team, idx) => {
      // Adjust baseY to prevent bleeding below axis for positional charts
      const isPositional =
        title?.includes('QB') ||
        title?.includes('RB') ||
        title?.includes('WR') ||
        title?.includes('TE') ||
        title?.includes('DEF');
      const adjustedRidgeHeight = isPositional ? 20 : ridgeHeight;
      const adjustedRidgeGap = isPositional ? 24 : ridgeGap;

      const baseY = 45 + idx * adjustedRidgeGap;
      const pairs = team.densityPairs as [number, number][];

      if (!pairs?.length) return;

      // Create ridge path
      const points = pairs.map(([x, y]: [number, number]) => [
        xScale(x),
        baseY - (y / team.maxDensity) * adjustedRidgeHeight,
      ]);

      // Build path string
      let pathData = `M ${points[0][0]} ${baseY}`;
      pathData += ` L ${points[0][0]} ${points[0][1]}`;

      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i][0]} ${points[i][1]}`;
      }

      pathData += ` L ${points[points.length - 1][0]} ${baseY} Z`;

      // Add ridge path
      const ridgeGroup = g.append('g');

      ridgeGroup
        .append('path')
        .attr('d', pathData)
        .attr('fill', colors.core.regalGold)
        .attr('fill-opacity', 0.35)
        .attr('stroke', colors.core.regalGold)
        .attr('stroke-width', 1);

      // Add median line
      const medianX = xScale(team.median);
      ridgeGroup
        .append('line')
        .attr('x1', medianX)
        .attr('y1', baseY)
        .attr('x2', medianX)
        .attr('y2', baseY - adjustedRidgeHeight)
        .attr('stroke', colors.core.charcoalSteel)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 2');

      // Add team name
      g.append('text')
        .attr('x', -10)
        .attr('y', baseY - adjustedRidgeHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .style('fill', colors.core.regalGold)
        .text(team.teamName);

      // Add invisible hover area
      ridgeGroup
        .append('rect')
        .attr('x', xScale(team.min) - 5)
        .attr('y', baseY - adjustedRidgeHeight - 5)
        .attr('width', xScale(team.max) - xScale(team.min) + 10)
        .attr('height', adjustedRidgeHeight + 10)
        .attr('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', event => {
          setHoveredTeam(team);
          setMousePos({ x: event.pageX, y: event.pageY });
        })
        .on('mousemove', event => {
          setMousePos({ x: event.pageX, y: event.pageY });
        })
        .on('mouseleave', () => {
          setHoveredTeam(null);
        });
    });
  }, [data, domain, height, title, containerWidth]);

  // Calculate total SVG height based on content - more precise
  const isPositional =
    title?.includes('QB') ||
    title?.includes('RB') ||
    title?.includes('WR') ||
    title?.includes('TE') ||
    title?.includes('DEF');
  const gapSize = isPositional ? 24 : 28;

  // Precise height: margins + content + axis space
  const contentHeight = 45 + data.length * gapSize + 20; // ridge content
  const totalSvgHeight = 20 + contentHeight + 55; // top margin + content + axis space

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} width="100%" height={totalSvgHeight}></svg>

      {/* Custom Tooltip */}
      {hoveredTeam && (
        <div
          className="absolute pointer-events-none z-10 rounded-lg border bg-background p-3 shadow-lg"
          style={{
            left: mousePos.x + 10,
            top: mousePos.y - 10,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="mb-2">
            <div className="font-semibold text-sm">{hoveredTeam.teamName}</div>
            <div className="text-xs text-muted-foreground">{hoveredTeam.leagueName}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-semibold">Median Score</div>
              <div className="text-lg font-bold">{hoveredTeam.median.toFixed(1)}</div>
              <div className="text-xs text-gray-400">50th percentile</div>
            </div>
            <div>
              <div className="font-semibold">Score Range</div>
              <div className="text-sm">
                {hoveredTeam.min.toFixed(1)} - {hoveredTeam.max.toFixed(1)}
              </div>
              <div className="text-xs text-gray-400">Range: {hoveredTeam.range.toFixed(1)}</div>
            </div>
            <div>
              <div className="font-semibold">Games Played</div>
              <div className="text-lg font-bold">{hoveredTeam.gamesPlayed}</div>
            </div>
            <div>
              <div className="font-semibold">Consistency</div>
              <div className="text-sm">
                <span className="font-semibold">
                  {hoveredTeam.range < 20
                    ? '🎯 Narrow'
                    : hoveredTeam.range < 40
                      ? '📊 Medium'
                      : '🌊 Wide'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
