import React, { useState } from 'react';
import {
  Building,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  AlertCircle,
  ShieldCheck,
  Percent,
  Sliders
} from 'lucide-react';
import ExportButton from '../components/ExportButton';
import { apiClient } from '../api/client';
import { formatCurrency, formatNumber } from '../utils/formatters';

const PROPERTY_TYPES = [
  'Single Family',
  'Multi-Family',
  'Apartment/Condo',
  'Commercial',
  'Industrial',
  'Land'
];

const QUALITY_LEVELS = [
  { id: 'Builder Grade', desc: 'Standard basic materials, standard developer fixtures' },
  { id: 'Standard', desc: 'Standard residential code finishes, balanced durability' },
  { id: 'Premium', desc: 'Hardwood, stone countertops, architectural moldings' },
  { id: 'Luxury', desc: 'Custom architectural millwork, imported marble, high-end automation' }
];

const AVAILABLE_AMENITIES = [
  'Garage / Covered Parking',
  'Swimming Pool',
  'Solar Panels & Inverter',
  'Central HVAC Heat Pump',
  'Smart Home Automation',
  'Garden / Landscaped Yard',
  'EV Charging Station',
  'Balcony / Rooftop Terrace'
];

export default function PropertyValuation() {
  const [formData, setFormData] = useState({
    property_type: 'Single Family',
    location_city: 'Chicago',
    built_up_area_sqft: 2400,
    land_area_sqft: 4500,
    bedrooms: 3,
    bathrooms: 2.5,
    age_years: 6,
    construction_quality: 'Standard',
    amenities: ['Garage / Covered Parking', 'Central HVAC Heat Pump']
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.built_up_area_sqft <= 0) {
      setError('Please provide a valid built-up area greater than zero.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.estimateValuation(formData);
      if (res.success) {
        setResult(res.data);
      } else {
        throw new Error(res.error || 'Failed to calculate indicative valuation');
      }
    } catch (err) {
      setError(err.message || 'Error executing valuation algorithm');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Building className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Real Estate Property Valuation
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automated Indicative Valuation Model (AVM) with construction quality multipliers, age depreciation, and regional baselines.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <ExportButton data={result} filename="property_valuation_report" label="Export Valuation" />
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Adjust Inputs</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className={`space-y-5 ${result ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Classification
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Metropolitan Region
                </label>
                <input
                  type="text"
                  required
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  placeholder="e.g. Chicago, San Francisco, Denver, Austin"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Built-Up Living Area (Sq Ft)
                </label>
                <input
                  type="number"
                  min="100"
                  max="100000"
                  required
                  value={formData.built_up_area_sqft}
                  onChange={(e) => setFormData({ ...formData, built_up_area_sqft: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lot / Land Area (Sq Ft, Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.land_area_sqft || ''}
                  onChange={(e) => setFormData({ ...formData, land_area_sqft: Number(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={formData.age_years}
                  onChange={(e) => setFormData({ ...formData, age_years: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Quality Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Construction Quality & Specification Tier
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUALITY_LEVELS.map(q => (
                  <div
                    key={q.id}
                    onClick={() => setFormData({ ...formData, construction_quality: q.id })}
                    className={`cursor-pointer rounded-xl border p-2.5 transition-all text-xs ${
                      formData.construction_quality === q.id
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold">{q.id}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{q.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Features & Added Amenities
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {AVAILABLE_AMENITIES.map(amenity => {
                  const isChecked = formData.amenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs text-left transition-all ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Computing Indicative Benchmark Valuation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Calculate Indicative Valuation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        {result && (
          <div className="lg:col-span-7 space-y-5">
            {/* Main Valuation Highlight Card */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-xs space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Indicative Valuation Estimate
              </span>

              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                  {formatCurrency(result.estimated_value)}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  ({formatCurrency(result.price_per_sqft)} / sq ft)
                </span>
              </div>

              {/* Indicative Range */}
              <div className="rounded-xl border border-blue-100 bg-white p-3.5 shadow-xs">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Indicative Value Range (±7.5%):</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(result.value_range_min)} – {formatCurrency(result.value_range_max)}
                  </span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-blue-100 overflow-hidden">
                  <div className="absolute inset-y-0 left-[15%] right-[15%] bg-blue-600 rounded-full" />
                </div>
              </div>

              {result.ai_market_insight && (
                <div className="text-xs text-slate-600 bg-white/80 rounded-xl p-3 border border-slate-100">
                  <span className="font-bold text-slate-800">Market Insight: </span>
                  <span>{result.ai_market_insight}</span>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>Valuation Component Breakdown</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Base Replacement Structure:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(result.breakdown.base_structure_value)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Property Classification Factor:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(result.breakdown.location_adjustment)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Quality Specification Adjustment:</span>
                  <span className="font-semibold text-slate-900">+{formatCurrency(result.breakdown.quality_adjustment)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Age Depreciation Factor:</span>
                  <span className="font-semibold text-red-600">
                    {result.breakdown.depreciation_adjustment < 0 ? '-' : ''}
                    {formatCurrency(Math.abs(result.breakdown.depreciation_adjustment))}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Amenity Contributions:</span>
                  <span className="font-semibold text-emerald-600">+{formatCurrency(result.breakdown.amenities_value)}</span>
                </div>
              </div>
            </div>

            {/* Factors & Assumptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 mb-2">Key Value Drivers</h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.factors_influencing_value?.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 mb-2">Data Limitations</h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.data_limitations?.map((lim, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Appraisal Disclaimer */}
            <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Appraisal Notice:</p>
              <p>{result.disclaimer}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
