import React, { useState } from 'react';
import { grandCarbonCatalogPages, CatalogPage } from '../data/catalogData';
import {
  FileText,
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  Award,
  Zap,
  CheckCircle2,
  PhoneCall,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { BotConfig } from '../types';

interface CatalogViewerProps {
  config: BotConfig;
  onSelectCategoryForChat?: (categoryTitle: string) => void;
}

export const CatalogViewer: React.FC<CatalogViewerProps> = ({ config, onSelectCategoryForChat }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [activeTabFilter, setActiveTabFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activePage = grandCarbonCatalogPages[currentPageIndex];

  const filteredPages = grandCarbonCatalogPages.filter((page) => {
    const matchesFilter = activeTabFilter === 'ALL' || page.category === activeTabFilter;
    const matchesSearch =
      searchQuery === '' ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.content.description && page.content.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const categories = ['ALL', 'Cover Page', 'Company Profile', 'Power Tools', 'Industrial', 'Automotive & Home', 'Graphite Engineering', 'Advantages', 'Contact'];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Official O.E.M Catalog
            </span>
            <span className="text-slate-400 text-xs">Since 1995 • Blackduck Brand</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
            Grand Carbon Manufacturing Co. — Official Product Catalog
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Browse our complete 8-page official product brochure including Power Tools Brushes, Heavy Industrial Carbon Solutions, Automotive Starter Motor Kits, and 1000+ Graphite Engineering Grades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={config.catalogPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Brochure</span>
          </a>
        </div>
      </div>

      {/* Page Navigation Grid & Category Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto text-xs py-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTabFilter(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                activeTabFilter === cat
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search grades, tools, motors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Catalog Book Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT Sidebar: Page Selector Thumbnails */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Brochure Pages ({grandCarbonCatalogPages.length})</span>
            <span className="text-amber-400 font-normal">Select page</span>
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredPages.map((page) => {
              const pageIdx = page.pageNumber - 1;
              const isSelected = currentPageIndex === pageIdx;

              return (
                <button
                  key={page.pageNumber}
                  onClick={() => setCurrentPageIndex(pageIdx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/80 ring-1 ring-amber-500/30 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800/90 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}
                    >
                      {page.pageNumber}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-200 truncate">{page.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{page.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-full text-amber-300 border border-slate-800 shrink-0">
                    {page.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT Display Stage: Active Catalog Page View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between min-h-[600px]">
          {/* Top Page Header Bar */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="font-bold text-amber-400 text-xs tracking-wider uppercase">
                  PAGE {activePage.pageNumber} OF {grandCarbonCatalogPages.length} — {activePage.category}
                </span>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded-lg text-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-400">
                  {currentPageIndex + 1}/{grandCarbonCatalogPages.length}
                </span>
                <button
                  disabled={currentPageIndex === grandCarbonCatalogPages.length - 1}
                  onClick={() => setCurrentPageIndex((prev) => Math.min(grandCarbonCatalogPages.length - 1, prev + 1))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 rounded-lg text-xs transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PAGE CONTENT RENDERING */}
            <div className="space-y-6">
              {/* Title & Subtitle */}
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase border-l-4 border-red-500 pl-3">
                  {activePage.title}
                </h2>
                {activePage.subtitle && (
                  <p className="text-amber-400 font-semibold text-sm mt-1 pl-3">
                    {activePage.subtitle}
                  </p>
                )}
              </div>

              {/* Description */}
              {activePage.content.description && (
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {activePage.content.description}
                </p>
              )}

              {/* Milestones if Page 2 */}
              {activePage.content.milestones && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activePage.content.milestones.map((m, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                      <span className="text-lg font-black text-amber-400 font-mono block">{m.year}</span>
                      <p className="text-xs text-slate-300 mt-1 leading-snug">{m.event}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Compatible With list */}
              {activePage.content.compatibleWith && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Compatible OEM Brands:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activePage.content.compatibleWith.map((brand) => (
                      <span
                        key={brand}
                        className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-semibold"
                      >
                        {brand}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullet Points */}
              {activePage.content.bulletPoints && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Key Features &amp; Specifications:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {activePage.content.bulletPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Applications */}
              {activePage.content.applications && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-cyan-300">Target Applications:</h4>
                  <div className="flex flex-wrap gap-2">
                    {activePage.content.applications.map((app) => (
                      <span key={app} className="bg-cyan-950 text-cyan-200 text-xs px-2.5 py-1 rounded-lg border border-cyan-800">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grades Table if Page 6 */}
              {activePage.content.gradesTable && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-amber-400 font-bold border-b border-slate-700">
                        <th className="p-3">Category</th>
                        <th className="p-3">Premium Grades Handled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                      {activePage.content.gradesTable.map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 font-bold font-sans text-amber-200">{g.category}</td>
                          <td className="p-3 text-emerald-300">{g.grades}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Contact Info Page 8 */}
              {activePage.content.contactInfo && (
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-slate-300">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Factory &amp; Head Office:</strong>
                          <span>{activePage.content.contactInfo.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <strong className="text-white block">Mobile:</strong>
                          <span>{activePage.content.contactInfo.mobiles.join(', ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <strong className="text-white block">Landline:</strong>
                          <span>{activePage.content.contactInfo.landline}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <strong className="text-white block">Email:</strong>
                          <span>{activePage.content.contactInfo.emails.join(' | ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <strong className="text-white block">Official Website:</strong>
                          <span>{activePage.content.contactInfo.websites.join(' | ')}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="bg-red-950 text-red-300 font-bold px-3 py-1 rounded-lg border border-red-800 text-xs inline-block">
                          Brand: BLACKDUCK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Footer Actions */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Grand Carbon Official Brochure • O.E.M Manufacturer
            </span>

            <a
              href={`https://wa.me/919580868774?text=${encodeURIComponent(`Hello Grand Carbon! I am viewing Page ${activePage.pageNumber} (${activePage.title}) of your official catalog and want to enquire.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors shadow"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Enquire About {activePage.title}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
