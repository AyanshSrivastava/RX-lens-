import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DRUG_DATABASE } from '../data/drugDatabase.ts';
import { matchMedicineToDatabase } from '../utils/drugMatcher.ts';

export const DrugDatabaseView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [fuzzySandboxInput, setFuzzySandboxInput] = useState('Tab Amoxcilin 500mg');

  const categories = ['All', ...Array.from(new Set(DRUG_DATABASE.map((d) => d.category)))];

  const filteredDrugs = DRUG_DATABASE.filter((drug) => {
    const matchesCategory = selectedCategory === 'All' || drug.category === selectedCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const q = searchQuery.toLowerCase();
    return (
      matchesCategory &&
      (drug.genericName.toLowerCase().includes(q) ||
        drug.brandNames.some((b) => b.toLowerCase().includes(q)) ||
        drug.category.toLowerCase().includes(q) ||
        drug.plainPurpose.toLowerCase().includes(q))
    );
  });

  const liveMatch = matchMedicineToDatabase(fuzzySandboxInput);

  return (
    <div className="space-y-6">
      {/* Live Fuzzy OCR Matcher Sandbox */}
      <section className="bg-white border border-zinc-200/90 rounded-xl p-6 space-y-4">
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">
            <span>Public Drug Dataset & Fuzzy Verification Engine</span>
            <span aria-hidden="true"> · </span>
            <span className="font-mono tabular-nums">{DRUG_DATABASE.length} Reference Medications</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
            Drug Database & Interactive Fuzzy OCR Matcher
          </h1>
          <p className="text-sm text-zinc-600">
            Test how RxLens corrects noisy OCR spellings (such as <span className="font-mono">Amoxcilin</span>,{' '}
            <span className="font-mono">Metfromin</span>, <span className="font-mono">Dolo650</span>, or{' '}
            <span className="font-mono">Brufn</span>) using Levenshtein edit distance against generic and brand names.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-2">
          <div className="lg:col-span-5 space-y-2">
            <label
              htmlFor="fuzzy-sandbox-input"
              className="block text-xs font-semibold text-zinc-700"
            >
              Type Any Misspelled OCR Medicine Name:
            </label>
            <input
              id="fuzzy-sandbox-input"
              type="text"
              value={fuzzySandboxInput}
              onChange={(e) => setFuzzySandboxInput(e.target.value)}
              placeholder="e.g. Tab Paracetmol 650"
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#FAF8F5] border border-zinc-300 rounded-lg focus:outline-none focus:border-[#D96B27]"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Cap Amoxcilin 500', 'Tab Metfromin', 'Tab Brufn 400', 'Tab Pan40', 'Tab Cetzne 10mg'].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFuzzySandboxInput(preset)}
                    className="px-2.5 py-1 text-xs font-mono text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md cursor-pointer"
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-7 p-4 rounded-xl bg-[#FAF8F5] border border-zinc-200/90">
            {liveMatch.drug ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-zinc-600 tabular-nums">
                    Method: {liveMatch.matchMethod} · Confidence: {liveMatch.confidenceScore}%
                  </span>
                  {liveMatch.needsReview ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Flags Manual Review (&lt;82%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Auto-Verified (≥82%)
                    </span>
                  )}
                </div>
                <h2 className="font-display text-lg font-bold text-zinc-950">
                  Matched: {liveMatch.drug.genericName} ({liveMatch.drug.brandNames.join(', ')})
                </h2>
                <p className="text-xs text-zinc-700">{liveMatch.drug.plainPurpose}</p>
                <p className="text-[11px] font-mono text-zinc-500">{liveMatch.correctionNote}</p>
              </div>
            ) : (
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">No High-Confidence Match Found ({liveMatch.confidenceScore}%)</p>
                <p>{liveMatch.correctionNote}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reference Drug Dataset Table */}
      <section className="bg-white border border-zinc-200/90 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search drug database by generic name, brand name, or purpose"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search generic, brand (e.g. Dolo, Pan 40, Telma), or use..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#D96B27]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="category-select" className="text-xs font-medium text-zinc-600">
              Category:
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-semibold">
                <th className="py-3 pr-4">Generic Name</th>
                <th className="py-3 px-4">Common Brands</th>
                <th className="py-3 px-4">OCR Typos Handled</th>
                <th className="py-3 px-4">Plain-Language Purpose</th>
                <th className="py-3 pl-4 text-right">Standard Doses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredDrugs.map((drug) => (
                <tr key={drug.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-zinc-900 whitespace-nowrap">
                    {drug.genericName}
                    <span className="block text-[11px] font-normal text-zinc-500">
                      {drug.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-700">
                    {drug.brandNames.join(', ')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                    {drug.commonOcrMisspellings.slice(0, 3).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-zinc-700 max-w-sm">
                    {drug.plainPurpose}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono tabular-nums text-zinc-800 whitespace-nowrap">
                    {drug.standardDosages.join(' / ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
