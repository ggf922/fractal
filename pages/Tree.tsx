import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Country } from '../types';
import { Search, ZoomIn, ZoomOut, User, Coins } from 'lucide-react';

const Tree: React.FC = () => {
  const { user, users } = useAuth();
  const { t } = useLanguage();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchTerm, setSearchTerm] = useState('');
  const [tooltip, setTooltip] = useState<{x: number, y: number, content: any} | null>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      setDimensions({
        width: wrapperRef.current.clientWidth,
        height: Math.max(600, wrapperRef.current.clientHeight),
      });
    }
    const handleResize = () => {
       if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: Math.max(600, wrapperRef.current.clientHeight),
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getFlagEmoji = (countryCode: Country) => {
    switch (countryCode) {
      case 'KR': return '🇰🇷';
      case 'US': return '🇺🇸';
      case 'CN': return '🇨🇳';
      case 'JP': return '🇯🇵';
      default: return '🇰🇷';
    }
  };

  useEffect(() => {
    if (!user || !svgRef.current || !users.length) return;

    // Build tree starting from current user (Root)
    const buildTree = (rootId: string): any => {
      const rootUser = users.find(u => u.id === rootId);
      if (!rootUser) return null;

      const children = users
        .filter(u => u.referrerId === rootId)
        .map(child => buildTree(child.id))
        .filter(child => child !== null);

      return {
        name: rootUser.username,
        realName: rootUser.name,
        phoneNumber: rootUser.phoneNumber,
        code: rootUser.referralCode,
        balance: rootUser.balance,
        country: rootUser.country,
        id: rootUser.id,
        children: children.length > 0 ? children : undefined
      };
    };

    const treeData = buildTree(user.id);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // If no tree data (shouldn't happen if logged in), show message
    if (!treeData) return;

    const margin = { top: 80, right: 90, bottom: 50, left: 90 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const root = d3.hierarchy(treeData);
    const treeMap = d3.tree().size([height, width]);
    
    // Check if single node to center it
    if (!root.children) {
       treeMap.size([height, width]); 
    }

    // @ts-ignore
    const nodes = treeMap(root);

    // Links
    g.selectAll(".link")
      .data(nodes.descendants().slice(1))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return "M" + d.x + "," + d.y
          + "C" + d.x + "," + (d.y + d.parent.y) / 2
          + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
          + " " + d.parent.x + "," + d.parent.y;
      })
      .style("fill", "none")
      .style("stroke", "#cbd5e1")
      .style("stroke-width", "2px");

    // Nodes
    const node = g.selectAll(".node")
      .data(nodes.descendants())
      .enter().append("g")
      .attr("class", (d: any) => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", (d: any) => "translate(" + d.x + "," + d.y + ")");

    // Node Circle
    const circle = node.append("circle")
      .attr("r", (d: any) => d.data.name === user.username ? 35 : 25) // Larger for self
      .style("fill", (d: any) => {
        if (d.data.name === user.username) return "#4f46e5"; // Indigo for self
        if (searchTerm && d.data.name.includes(searchTerm)) return "#f59e0b"; // Highlight search
        return "#ffffff";
      })
      .style("stroke", (d: any) => {
         if (d.data.name === user.username) return "#312e81";
         return "#cbd5e1";
      })
      .style("stroke-width", (d: any) => d.data.name === user.username ? "4px" : "3px")
      .style("filter", (d: any) => d.data.name === user.username ? "drop-shadow(0px 4px 6px rgba(79, 70, 229, 0.4))" : "none")
      .style("cursor", "pointer");

    // Interactivity
    circle.on("mouseover", (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition().duration(200)
          .attr("r", d.data.name === user.username ? 40 : 30);
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          content: {
            name: d.data.realName,
            phone: d.data.phoneNumber,
            username: d.data.name,
            balance: d.data.balance
          }
        });
      })
      .on("mousemove", (event: any) => {
        setTooltip(prev => prev ? ({...prev, x: event.clientX, y: event.clientY}) : null);
      })
      .on("mouseout", (event: any, d: any) => {
        d3.select(event.currentTarget)
          .transition().duration(200)
          .attr("r", d.data.name === user.username ? 35 : 25);
        setTooltip(null);
      });

    // Country Flag (Top)
    node.append("text")
      .attr("dy", (d: any) => d.data.name === user.username ? -50 : -42)
      .attr("x", 0)
      .style("text-anchor", "middle")
      .style("font-size", "18px")
      .text((d: any) => getFlagEmoji(d.data.country));

    // Username (Center)
    node.append("text")
      .attr("dy", (d: any) => d.data.name === user.username ? -30 : -25)
      .attr("x", 0)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", (d: any) => d.data.name === user.username ? "900" : "700")
      .style("fill", (d: any) => d.data.name === user.username ? "#1e1b4b" : "#1e293b")
      .style("text-shadow", "0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff")
      .text((d: any) => d.data.name === user.username ? "ME" : d.data.name);

    // Points Background Pill
    node.append("rect")
      .attr("x", -35)
      .attr("y", (d: any) => d.data.name === user.username ? 10 : 8)
      .attr("width", 70)
      .attr("height", 16)
      .attr("rx", 8)
      .attr("fill", "#ecfdf5") // light green
      .attr("stroke", "#10b981") // emerald
      .attr("stroke-width", 1);

    // Balance (Points) Text
    node.append("text")
      .attr("dy", (d: any) => d.data.name === user.username ? 22 : 20)
      .attr("x", 0)
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-family", "monospace")
      .style("font-weight", "bold")
      .style("fill", "#059669") // dark green
      .style("pointer-events", "none")
      .text((d: any) => `₩${d.data.balance.toLocaleString()}`);

  }, [user, users, dimensions, searchTerm]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
             <span className="bg-indigo-600 text-white p-1 rounded-lg">
               <User size={24} />
             </span>
             {t('treeTitle')}
           </h2>
           <p className="text-slate-500 mt-1">{t('treeDesc')}</p>
        </div>
        <div className="relative w-full md:w-80">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search size={18} className="text-slate-400" />
           </div>
           <input
             type="text"
             className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
             placeholder={t('searchPlaceholder')}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>
      
      <div 
        ref={wrapperRef} 
        className="flex-1 bg-slate-50 rounded-2xl shadow-inner border border-slate-200 overflow-hidden relative min-h-[600px]"
      >
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-200 text-xs text-slate-500 shadow-sm pointer-events-none">
           <div className="flex items-center space-x-2 mb-2">
             <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-indigo-800 shadow-sm"></div>
             <span className="font-bold text-indigo-900">{t('me')} (ROOT)</span>
           </div>
           <div className="flex items-center space-x-2 mb-2">
             <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-300"></div>
             <span className="font-medium">{t('partner')}</span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-12 h-4 rounded-full bg-emerald-50 border border-emerald-500 flex items-center justify-center text-[8px] text-emerald-700 font-bold">₩ POINT</div>
             <span className="font-medium">{t('balance')}</span>
           </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div 
            className="fixed z-[100] bg-slate-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="font-bold text-sm mb-1 text-yellow-400">{tooltip.content.username}</div>
            <div className="text-slate-300 flex flex-col gap-0.5">
               <div><span className="text-slate-400">{t('tooltipName')}:</span> {tooltip.content.name || '-'}</div>
               <div><span className="text-slate-400">{t('tooltipPhone')}:</span> {tooltip.content.phone}</div>
               <div className="pt-1 border-t border-slate-700 mt-1 flex items-center gap-1">
                 <Coins size={10} className="text-emerald-400" />
                 <span className="text-emerald-400 font-bold">₩{tooltip.content.balance.toLocaleString()}</span>
               </div>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-900 rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tree;