import React, { useState } from 'react';
import { AppLanguage, HitResult } from '../types';
import { I18N } from '../data/i18n';

interface HitsPanelProps {
  lang: AppLanguage;
  hits: HitResult[];
  latestHit: HitResult | null;
  onClearHits: () => void;
}

export const HitsPanel: React.FC<HitsPanelProps> = ({
  lang,
  hits,
  latestHit,
  onClearHits,
}) => {
  const t = I18N[lang];
  const [copiedBanner, setCopiedBanner] = useState(false);

  const handleCopyBanner = () => {
    if (!latestHit) return;
    const text = `Key: ${latestHit.keyNum} (${latestHit.keyHex}) | Sent: ${latestHit.sent} | Response: ${latestHit.response}`;
    navigator.clipboard.writeText(text);
    setCopiedBanner(true);
    setTimeout(() => setCopiedBanner(false), 1500);
  };

  const handleExportCsv = () => {
    if (hits.length === 0) return;
    const header = 'Time,KeyDec,KeyHex,SentTX,ResponseRX\n';
    const rows = hits
      .map(
        (h) =>
          `"${h.time}","${h.keyNum}","${h.keyHex}","${h.sent.replace(
            /"/g,
            '""'
          )}","${h.response.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serialforge_hits_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 font-mono flex flex-col flex-1 min-h-0">
      {/* ================= TOP HIT BANNER ================= */}
      {latestHit && (
        <div className="bg-[#022C22] border-2 border-[#10B981] rounded-md p-3 flex items-center justify-between shadow-lg shadow-emerald-950/50 animate-pulse">
          <div className="space-y-0.5">
            <div className="font-bold text-xs text-[#10B981]">
              {t.hitBannerTitle}
            </div>
            <div className="font-bold text-sm text-white">
              {lang === 'ru'
                ? `Ключ: ${latestHit.keyNum} (${latestHit.keyHex}) | Ответ: ${latestHit.response}`
                : lang === 'ua'
                ? `Ключ: ${latestHit.keyNum} (${latestHit.keyHex}) | Відповідь: ${latestHit.response}`
                : `Key: ${latestHit.keyNum} (${latestHit.keyHex}) | Response: ${latestHit.response}`}
            </div>
          </div>

          <button
            onClick={handleCopyBanner}
            className="bg-[#10B981] hover:bg-[#059669] text-[#080C14] font-bold px-3 py-1.5 rounded text-xs transition-colors shadow-sm"
          >
            {copiedBanner ? t.copiedBtn : t.copyBtn}
          </button>
        </div>
      )}

      {/* ================= CAPTURED HITS TABLE ================= */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-md p-3 flex flex-col flex-1 min-h-[150px]">
        {/* Table Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] text-[#10B981]">
              {t.hitsTableHeader}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#022C22] border border-[#059669] text-[9px] font-bold text-[#34D399]">
              {hits.length} {t.hitsCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hits.length > 0 && (
              <button
                onClick={onClearHits}
                className="px-2 py-0.5 bg-[#070B14] hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 border border-[#1E293B] rounded text-[10px] transition-colors"
              >
                {t.clearBtn}
              </button>
            )}

            <button
              onClick={handleExportCsv}
              disabled={hits.length === 0}
              className="px-2.5 py-1 bg-[#070B14] hover:bg-[#1E293B] text-[#38BDF8] border border-[#1E293B] rounded text-[10px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.exportCsvBtn}
            </button>
          </div>
        </div>

        {/* DataGrid View */}
        <div className="flex-1 bg-[#060A12] border border-[#1E293B] rounded overflow-auto">
          {hits.length === 0 ? (
            <div className="text-slate-600 text-xs py-8 text-center">
              {t.noHitsYet}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#0F172A] text-slate-400 border-b border-[#1E293B] text-[10px]">
                  <th className="p-2 w-20">{t.colTime}</th>
                  <th className="p-2 w-24">{t.colValue}</th>
                  <th className="p-2 w-24">{t.colKeyHex}</th>
                  <th className="p-2 w-48">{t.colSent}</th>
                  <th className="p-2">{t.colResponse}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {hits.map((hit, idx) => (
                  <tr
                    key={hit.id || idx}
                    className={
                      idx % 2 === 0
                        ? 'bg-[#0F172A]/50 hover:bg-[#111A2E]'
                        : 'bg-[#111A2E]/50 hover:bg-[#111A2E]'
                    }
                  >
                    <td className="p-2 text-slate-400">{hit.time}</td>
                    <td className="p-2 font-bold text-[#34D399]">{hit.keyNum}</td>
                    <td className="p-2 text-amber-400">{hit.keyHex}</td>
                    <td className="p-2 text-sky-300 truncate max-w-[150px]" title={hit.sent}>
                      {hit.sent}
                    </td>
                    <td className="p-2 text-emerald-300 font-bold break-all">
                      {hit.response}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
