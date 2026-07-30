"use client";

import { AnalysisResult } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import RiskGauge from "@/components/ui/RiskGauge";
import FraudIndicatorCard from "@/components/ui/FraudIndicatorCard";
import VerificationChecklist from "@/components/ui/VerificationChecklist";
import XRayTextView from "@/components/views/XRayTextView";
import ComplaintDraftCard from "@/components/ui/ComplaintDraftCard";
import PlacementCellBar from "@/components/ui/PlacementCellBar";
import DomainCheckCard from "@/components/ui/DomainCheckCard";

interface ResultsDashboardProps {
  result: AnalysisResult;
  originalText: string;
}

export default function ResultsDashboard({ result, originalText }: ResultsDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Bar */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Analysis Result</h2>
          <p className="text-sm text-muted">{result.summary}</p>
        </div>
        <Badge level={result.riskLevel} />
      </div>

      {/* Gauge + X-Ray View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex justify-center">
          <div className="rounded-xl border border-border bg-card p-6 w-full flex items-center justify-center">
            <RiskGauge score={result.riskScore} level={result.riskLevel} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <XRayTextView originalText={originalText} highlights={result.highlights || []} />
        </div>
      </div>

      {/* Fraud Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">🚩 Fraud Indicators</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(result.indicators || []).map((indicator, index) => (
            <FraudIndicatorCard key={index} indicator={indicator} />
          ))}
        </div>
      </div>

      {/* Domain Legitimacy Check */}
      <DomainCheckCard originalText={originalText} />

      {/* Verification Steps */}
      <VerificationChecklist steps={result.verificationSteps || []} />

      {/* Cybercrime Complaint Draft — only for high-risk */}
      {result.riskLevel === "high-risk" && result.complaintDraft && result.extractedEntities && (
        <ComplaintDraftCard
          companyName={result.extractedEntities.companyName}
          contactEmail={result.extractedEntities.contactEmail}
          contactPhone={result.extractedEntities.contactPhone}
          amountRequested={result.extractedEntities.amountRequested}
          complaintDraft={result.complaintDraft}
        />
      )}

      {/* Placement Cell Contact — always shown regardless of risk level */}
      <PlacementCellBar />
    </div>
  );
}
