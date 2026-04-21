
export const AUTO_LOAN_PROCESS_XML = `
<workflow id="auto-loan-process" name="Auto Loan Application Workflow">
  <description>Defines the steps and business logic for processing a new auto loan application.</description>
  <status id="s1" name="User Applies for Loan Online">
    <sla duration="10" unit="minutes" />
    <ui-view>OnlineApplicationForm</ui-view>
  </status>
  <status id="s2" name="Application Received">
    <trigger>OnFormSubmit</trigger>
    <api-call endpoint="/api/v1/applications" method="POST">recordApplication</api-call>
  </status>
  <status id="s3" name="Credit Score Pulled">
    <trigger>OnApplicationRecorded</trigger>
    <api-call endpoint="/api/v1/credit/pull" method="POST">pullCreditScore</api-call>
  </status>
  <status id="s4" name="Assign to Underwriter">
    <trigger>OnCreditScoreSuccess</trigger>
    <business-rule>assignToAvailableUnderwriter</business-rule>
  </status>
  <status id="s5" name="Underwriter Reviews File">
    <sla duration="2" unit="days" />
    <ui-view>UnderwritingDashboard</ui-view>
  </status>
  <status id="s6" name="Loan Approved">
    <trigger>OnUnderwriterDecision</trigger>
    <api-call endpoint="/api/v1/notifications/email" method="POST">notifyCustomerOfApproval</api-call>
    <event>triggerLoanDocumentationPackage</event>
  </status>
</workflow>
`;