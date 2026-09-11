import React, { useState, useMemo } from 'react';
import { BusinessInsightItem, UserRole } from '../../types';
import { INITIAL_BUSINESS_INSIGHTS } from '../../data/gstAndReportsData';

interface BusinessInsightsViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
}

export const BusinessInsightsView: React.FC<BusinessInsightsViewProps> = ({
  userRole,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Sales', 'Inventory', 'Receivables', 'Pricing', 'Tax'];

  const filteredInsights = useMemo(() => {
    if (selectedCategory === 'ALL') return INITIAL_BUSINESS_INSIGHTS;
    return INITIAL_BUSINESS_INSIGHTS.filter(i => i.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">insights</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Business Intelligence &amp; Operational Insights
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Automated Telemetry
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Operational recommendations, dead-stock warnings, overdue credit holds, and wholesale price hike alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('sales-reports')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>Sales Register</span>
          </button>
          <button
            onClick={() => onNavigate('profitability-dashboard')}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Margins Audit</span>
          </button>
        </div>
      </div>

      {/* Top Executive Health Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm text-xs">
        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Revenue Momentum</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">trending_up</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-on-surface">+14.8% Growth</div>
            <span className="text-[10px] text-outline">Pre-Diwali bike servicing surge</span>
          </div>
          <div className="text-[10px] text-tertiary font-semibold">Exceeding Monthly Targets</div>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Inventory Turnover</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">speed</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-on-surface">18.4 Days</div>
            <span className="text-[10px] text-outline">Average spare part replenishment cycle</span>
          </div>
          <div className="text-[10px] text-secondary font-semibold">Healthy Liquidity</div>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Credit Risk Index</span>
            <span className="material-symbols-outlined text-[18px] text-warning">warning</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-warning">1 Hold Active</div>
            <span className="text-[10px] text-outline">₹38.5k overdue by &gt; 25 days</span>
          </div>
          <div className="text-[10px] text-outline">Royal Riders Garage blocked</div>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Dead Stock Ratio</span>
            <span className="material-symbols-outlined text-[18px] text-outline">hourglass_empty</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-on-surface">1.8% of Total Stock</div>
            <span className="text-[10px] text-outline">₹7,400 in idle fairings</span>
          </div>
          <div className="text-[10px] text-tertiary font-semibold">Well below 5% benchmark</div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="text-outline font-bold uppercase text-[11px]">Filter by Domain:</span>
          <div className="flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {cat === 'ALL' ? 'All Domains' : cat}
              </button>
            ))}
          </div>
        </div>
        <span className="text-outline text-xs">
          Showing <strong className="text-on-surface">{filteredInsights.length}</strong> prioritized intelligence flags
        </span>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
        {filteredInsights.map(item => {
          const isPositive = item.type === 'positive';
          const isAlert = item.type === 'alert';
          const isWarning = item.type === 'warning';

          return (
            <div
              key={item.id}
              className={`p-4 rounded shadow-xs border flex flex-col justify-between transition-all hover:border-secondary/50 ${
                isAlert
                  ? 'bg-surface-container-lowest border-error/40'
                  : isWarning
                  ? 'bg-surface-container-lowest border-warning/40'
                  : isPositive
                  ? 'bg-surface-container-lowest border-tertiary/40'
                  : 'bg-surface-container-lowest border-surface-container-high'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isAlert
                          ? 'text-error'
                          : isWarning
                          ? 'text-warning'
                          : isPositive
                          ? 'text-tertiary'
                          : 'text-secondary'
                      }`}
                    >
                      {isAlert ? 'error' : isWarning ? 'warning' : isPositive ? 'check_circle' : 'info'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {item.category}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-outline">{item.change}</span>
                </div>

                <h3 className="font-headline-sm text-sm font-bold text-on-surface">{item.title}</h3>
                <div className="font-mono text-base font-bold my-1.5 text-on-surface">{item.metric}</div>
                <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high flex items-center justify-between">
                <span className="text-[10px] text-outline">Actionable Recommendation</span>
                {item.actionScreen && (
                  <button
                    onClick={() => onNavigate(item.actionScreen)}
                    className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors ${
                      isAlert
                        ? 'bg-error-container text-on-error-container hover:opacity-80'
                        : isWarning
                        ? 'bg-warning-container text-on-warning-container hover:opacity-80'
                        : 'bg-secondary text-on-secondary hover:bg-secondary-container shadow-xs'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
