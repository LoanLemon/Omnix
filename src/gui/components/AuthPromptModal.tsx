import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Globe, ArrowRight, Check, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuthPromptModalProps {
  activeAuthRequest: { authId: string; webdomain: string; category: string } | null;
  respondToAuth: (authId: string, decision: "once" | "always" | "never" | "block_once") => void;
}

export function AuthPromptModal({ activeAuthRequest, respondToAuth }: AuthPromptModalProps) {
  if (!activeAuthRequest) return null;

  const { authId, webdomain, category } = activeAuthRequest;

  return (
    <Dialog open={true} onOpenChange={() => respondToAuth(authId, "block_once")}>
      <DialogContent className="max-w-md p-6 bg-[#0E0E0E] border border-orange-500/30 text-zinc-100 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.15)] animate-in fade-in zoom-in duration-200">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-500 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-mono font-bold uppercase tracking-tight text-white">
                Inbound Connection Prompt
              </DialogTitle>
              <DialogDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider mt-0.5">
                External Inference Request
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-6 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            An external domain is trying to communicate with your local Omnix AI instance to perform cognitive processing tasks.
          </p>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3 font-mono text-xs">
            {/* Domain */}
            <div className="flex items-center justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500 text-[10px] uppercase">Origin Host</span>
              <div className="flex items-center gap-1.5 text-orange-400 font-semibold select-all">
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                <span>{webdomain}</span>
              </div>
            </div>

            {/* Requested Operation */}
            <div className="flex items-center justify-between py-1 border-b border-zinc-900">
              <span className="text-zinc-500 text-[10px] uppercase">Service Type</span>
              <Badge variant="outline" className="text-[10px] border-orange-500/20 bg-orange-500/5 text-orange-400">
                {category.toUpperCase()} INFERENCE
              </Badge>
            </div>

            {/* Safety Indicator */}
            <div className="text-[10px] text-zinc-600 italic border-l-2 border-zinc-800 pl-3 py-1 font-serif leading-normal">
              Authorize connection only if you trust the referring webpage. Allow Always will persist this rule.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => respondToAuth(authId, "once")}
              className="border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all text-xs font-mono py-5"
            >
              <Check className="w-4 h-4 mr-1.5 text-zinc-500" />
              ALLOW ONCE
            </Button>
            <Button
              onClick={() => respondToAuth(authId, "always")}
              className="bg-orange-500 hover:bg-orange-600 text-black font-semibold transition-all text-xs font-mono py-5 border border-orange-400/20"
            >
              <Check className="w-4 h-4 mr-1.5" />
              ALLOW ALWAYS
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button
              variant="destructive"
              onClick={() => respondToAuth(authId, "block_once")}
              className="bg-red-950/20 hover:bg-red-900/30 border border-red-900/40 text-red-400 hover:text-red-300 transition-all text-xs font-mono py-5"
            >
              <Ban className="w-4 h-4 mr-1.5" />
              BLOCK ATTEMPT
            </Button>
            <Button
              variant="destructive"
              onClick={() => respondToAuth(authId, "never")}
              className="bg-red-950/40 hover:bg-red-900/55 border border-red-900/60 text-red-300 hover:text-red-200 transition-all text-xs font-mono py-5 font-bold"
            >
              <Ban className="w-4 h-4 mr-1.5" />
              BLOCK ALL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
