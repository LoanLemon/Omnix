
import { ProcessMapData } from '../../types';

export const AUTO_LOAN_PROCESS_SVG_DATA: ProcessMapData = {
  queues: [
    { name: "Customer", id: "q1" },
    { name: "System", id: "q2" },
    { name: "Underwriting", id: "q3" },
  ],
  statuses: [
    { id: "s1", label: "User Applies for Loan Online", queue: "q1", type: "User" },
    { id: "s2", label: "Application Received", queue: "q2", type: "System" },
    { id: "s3", label: "Credit Score Pulled", queue: "q2", type: "System" },
    { id: "s4", label: "Assign to Underwriter", queue: "q3", type: "System" },
    { id: "s5", label: "Underwriter Reviews File", queue: "q3", type: "User" },
    { id: "s6", label: "Loan Approved", queue: "q2", type: "System" },
  ],
  progressions: [
    { from: "s1", to: "s2" },
    { from: "s2", to: "s3" },
    { from: "s3", to: "s4" },
    { from: "s4", to: "s5" },
    { from: "s5", to: "s6", label: "Decision" },
  ],
};