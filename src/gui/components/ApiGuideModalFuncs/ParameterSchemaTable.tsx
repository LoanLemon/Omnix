import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { ParamInfo } from "./types";

interface ParameterSchemaTableProps {
  parameters: ParamInfo[];
  borderType?: "normal" | "accent";
}

export function ParameterSchemaTable({ parameters, borderType = "normal" }: ParameterSchemaTableProps) {
  const [showOptional, setShowOptional] = useState(false);

  const requiredParams = parameters.filter((p) => p.presence === "Required" || p.presence === "Implicit");
  const optionalParams = parameters.filter((p) => p.presence === "Optional");

  const borderClass = borderType === "accent" ? "border-zinc-900 bg-zinc-950/70" : "border-zinc-800 bg-zinc-950";

  return (
    <div className="space-y-3">
      <div className={`border rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45 ${borderClass}`}>
        <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
          <div className="col-span-3">Field</div>
          <div className="col-span-3">Type / Presence</div>
          <div className="col-span-6">Description</div>
        </div>

        {/* Required/Implicit parameters */}
        {requiredParams.map((param, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
            <div className="col-span-3 text-orange-500">{param.field}</div>
            <div className="col-span-3 text-zinc-400">
              {param.type} • <span className="text-emerald-500 font-semibold">{param.presence}</span>
            </div>
            <div className="col-span-6 text-zinc-500">{param.description}</div>
          </div>
        ))}

        {requiredParams.length === 0 && (
          <div className="grid grid-cols-12 gap-4 py-3 text-zinc-500 italic text-center">
            <div className="col-span-12">No required parameters.</div>
          </div>
        )}

        {/* Optional parameters (Collapsible) */}
        {showOptional &&
          optionalParams.map((param, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="col-span-3 text-orange-500">{param.field}</div>
              <div className="col-span-3 text-zinc-400">
                {param.type} • <span className="text-zinc-500">{param.presence}</span>
              </div>
              <div className="col-span-6 text-zinc-500">{param.description}</div>
            </div>
          ))}
      </div>

      {optionalParams.length > 0 && (
        <div className="flex justify-start">
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-950/20 hover:bg-zinc-900 border border-zinc-800 rounded transition-all cursor-pointer group"
          >
            {showOptional ? (
              <>
                <span>Hide Optional Parameters</span>
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              </>
            ) : (
              <>
                <span>Show Optional Parameters</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              </>
            )}
            <span className="text-[9px] text-zinc-500">({optionalParams.length})</span>
          </button>
        </div>
      )}
    </div>
  );
}
