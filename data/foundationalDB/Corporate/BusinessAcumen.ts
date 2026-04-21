import { FoundationalKnowledge } from '../../types';

export const BUSINESS_ACUMEN_KNOWLEDGE: FoundationalKnowledge = [
  // --- Project Management ---
  {
    "category": "ProjectManagement", "type": "Instruction", "topic": "Define_ProjectCharter", "importance": 1.0,
    "input_pattern": "DEFINE_PROJECT_CHARTER",
    "output_template": "A Project Charter is a formal document that authorizes a project's existence. It provides the project manager with the authority to apply organizational resources to project activities and includes key information like the business case, objectives, and key stakeholders."
  },
  {
    "category": "ProjectManagement", "type": "Instruction", "topic": "Define_WBS", "importance": 1.0,
    "input_pattern": "DEFINE_WBS",
    "output_template": "A Work Breakdown Structure, or WBS, is a hierarchical decomposition of the total scope of work to be carried out by a project team. It visually breaks down the project into smaller, more manageable components."
  },
  {
    "category": "ProjectManagement", "type": "Instruction", "topic": "Define_ScopeCreep", "importance": 1.0,
    "input_pattern": "DEFINE_SCOPE_CREEP",
    "output_template": "Scope creep refers to uncontrolled changes or continuous growth in a project's scope. This typically occurs when the scope of a project is not properly defined, documented, or controlled. It is a common reason for project failure."
  },
  {
    "category": "ProjectManagement", "type": "Instruction", "topic": "Define_CriticalPath", "importance": 1.0,
    "input_pattern": "DEFINE_CRITICAL_PATH",
    "output_template": "The Critical Path is the sequence of stages determining the minimum time needed for an operation, especially a project. It represents the longest path through the project, and any delay to a task on the critical path will delay the entire project."
  },
  {
    "category": "ProjectManagement", "type": "Instruction", "topic": "Define_Agile", "importance": 1.0,
    "input_pattern": "DEFINE_AGILE_METHODOLOGY",
    "output_template": "Agile is an iterative approach to project management and software development that helps teams deliver value to their customers faster. Instead of a single, large launch, an agile team delivers work in small, consumable increments, allowing for continuous feedback and improvement."
  },
  {
    "category": "ProjectManagement", "type": "Instruction", "topic": "Define_Scrum", "importance": 1.0,
    "input_pattern": "DEFINE_SCRUM_FRAMEWORK",
    "output_template": "Scrum is a framework within Agile that helps teams work together. It uses short work cycles called 'sprints', daily stand-up meetings, and defined roles like Scrum Master and Product Owner to manage and complete complex projects."
  },
  {
    "category": "ProjectManagement", "type": "Instruction", "topic": "Define_Kanban", "importance": 1.0,
    "input_pattern": "DEFINE_KANBAN_METHOD",
    "output_template": "Kanban is a visual method for managing workflow at the individual, team, and organizational levels. It uses a Kanban board to visualize work, limit work-in-progress (WIP), and maximize efficiency or flow."
  },

  // --- Marketing & SEO ---
  {
    "category": "Marketing", "type": "Instruction", "topic": "Define_SEO", "importance": 1.0,
    "input_pattern": "DEFINE_SEO",
    "output_template": "SEO, or Search Engine Optimization, is the practice of increasing the quantity and quality of traffic to your website through organic search engine results."
  },
  {
    "category": "Marketing", "type": "Instruction", "topic": "Define_SEM", "importance": 1.0,
    "input_pattern": "DEFINE_SEM",
    "output_template": "SEM, or Search Engine Marketing, is a digital marketing strategy used to increase the visibility of a website in search engine results pages. It includes both SEO and paid advertising, like pay-per-click (PPC)."
  },
  {
    "category": "Marketing", "type": "Instruction", "topic": "Define_PPC", "importance": 1.0,
    "input_pattern": "DEFINE_PPC",
    "output_template": "PPC, or Pay-Per-Click, is an internet advertising model used to drive traffic to websites, in which an advertiser pays a publisher when the ad is clicked."
  },
  {
    "category": "Marketing", "type": "Instruction", "topic": "Define_CTR", "importance": 1.0,
    "input_pattern": "DEFINE_CTR",
    "output_template": "CTR, or Click-Through Rate, is the ratio of users who click on a specific link to the number of total users who view a page, email, or advertisement. It is a common metric to measure the success of an online advertising campaign."
  },
  {
    "category": "Marketing", "type": "Instruction", "topic": "Define_ConversionRate", "importance": 1.0,
    "input_pattern": "DEFINE_CONVERSION_RATE",
    "output_template": "Conversion Rate is the percentage of users who take a desired action. The desired action can be anything from filling out a form to making a purchase. It's a key metric for measuring the effectiveness of a website or campaign."
  },
  {
    "category": "Marketing", "type": "Instruction", "topic": "Define_AB_Testing", "importance": 1.0,
    "input_pattern": "DEFINE_AB_TESTING",
    "output_template": "A/B testing, also known as split testing, is a method of comparing two versions of a webpage, email, or other marketing asset to determine which one performs better. Each version is shown to a different segment of users, and statistical analysis is used to determine which variation is more effective for a given goal."
  },
  {
    "category": "Marketing", "type": "Instruction", "topic": "Define_MarketingFunnel", "importance": 1.0,
    "input_pattern": "DEFINE_MARKETING_FUNNEL",
    "output_template": "A marketing funnel describes your customer's journey with you. From the initial stages when someone learns about your business (Top of Funnel), to the purchasing stage (Bottom of Funnel), funnels map out the path to conversion and beyond."
  },

  // --- Human Resources ---
  {
    "category": "HumanResources", "type": "Instruction", "topic": "Explain_Onboarding", "importance": 1.0,
    "input_pattern": "EXPLAIN_ONBOARDING",
    "output_template": "Onboarding is the process of integrating a new employee into an organization. It includes activities that allow the new hire to complete an initial new-hire orientation process, as well as learn about the organization and its structure, culture, vision, and values."
  },
  {
    "category": "HumanResources", "type": "Instruction", "topic": "Explain_360Feedback", "importance": 1.0,
    "input_pattern": "EXPLAIN_360_FEEDBACK",
    "output_template": "360-degree feedback is a performance appraisal process where employees receive confidential, anonymous feedback from the people who work around them. This typically includes the employee's manager, peers, and direct reports."
  },
  {
    "category": "HumanResources", "type": "Instruction", "topic": "Explain_EmployeeEngagement", "importance": 1.0,
    "input_pattern": "EXPLAIN_EMPLOYEE_ENGAGEMENT",
    "output_template": "Employee engagement is the extent to which employees feel passionate about their jobs, are committed to the organization, and put discretionary effort into their work. It's a key measure of an organization's health."
  },
  {
    "category": "HumanResources", "type": "Instruction", "topic": "Explain_OpenDoorPolicy", "importance": 1.0,
    "input_pattern": "EXPLAIN_OPEN_DOOR_POLICY",
    "output_template": "An open-door policy is a communication policy in which a manager, CEO, or supervisor leaves their office door 'open' in order to encourage openness and transparency with the employees of that company."
  },

  // --- Logistics & Supply Chain ---
  {
    "category": "Logistics", "type": "Instruction", "topic": "Define_SKU", "importance": 1.0,
    "input_pattern": "DEFINE_SKU",
    "output_template": "A SKU, or Stock Keeping Unit, is a unique code consisting of letters and numbers that identify characteristics of each product, such as manufacturer, brand, style, color, and size. It's used for inventory management."
  },
  {
    "category": "Logistics", "type": "Instruction", "topic": "Define_3PL", "importance": 1.0,
    "input_pattern": "DEFINE_3PL",
    "output_template": "3PL stands for Third-Party Logistics. It refers to outsourcing logistics processes, including inventory management, warehousing, and fulfillment, to an external company."
  },
  {
    "category": "Logistics", "type": "Instruction", "topic": "Define_LTL_FTL", "importance": 1.0,
    "input_pattern": "DEFINE_LTL_FTL",
    "output_template": "LTL (Less-Than-Truckload) and FTL (Full Truckload) are shipping modes. LTL combines shipments from multiple customers into one truck, making it cost-effective for smaller freight. FTL is when a shipment takes up an entire truck by itself, which is faster and more direct."
  },
  {
    "category": "Logistics", "type": "Instruction", "topic": "Define_BOL", "importance": 1.0,
    "input_pattern": "DEFINE_BOL",
    "output_template": "A Bill of Lading (BOL) is a required legal document issued by a carrier to a shipper. It details the type, quantity, and destination of the goods being carried and serves as a receipt and a contract of carriage."
  },
  {
    "category": "Logistics", "type": "Instruction", "topic": "Define_CrossDocking", "importance": 1.0,
    "input_pattern": "DEFINE_CROSS_DOCKING",
    "output_template": "Cross-docking is a logistics practice of unloading materials from an incoming truck or rail car and loading these materials directly into outbound trucks, trailers, or rail cars, with little or no storage in between."
  },

  // --- Finance ---
  {
    "category": "Finance", "type": "Instruction", "topic": "Define_EBITDA", "importance": 1.0,
    "input_pattern": "DEFINE_EBITDA",
    "output_template": "EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortization. It is a metric used to evaluate a company's operating performance without factoring in financing decisions, accounting decisions, or tax environments."
  },
  {
    "category": "Finance", "type": "Instruction", "topic": "Define_GrossMargin", "importance": 1.0,
    "input_pattern": "DEFINE_GROSS_MARGIN",
    "output_template": "Gross Margin is a profitability ratio calculated as (Revenue - Cost of Goods Sold) / Revenue. It represents the percentage of revenue that exceeds the cost of goods sold (COGS)."
  },
  {
    "category": "Finance", "type": "Instruction", "topic": "Define_YoY_Growth", "importance": 1.0,
    "input_pattern": "DEFINE_YOY_GROWTH",
    "output_template": "YoY, or Year-over-Year, growth is a key performance indicator that compares a metric for one period against the comparable period twelve months before. This is often used to account for seasonality."
  },
  {
    "category": "Finance", "type": "Instruction", "topic": "Define_DCF", "importance": 1.0,
    "input_pattern": "DEFINE_DCF",
    "output_template": "A Discounted Cash Flow (DCF) analysis is a valuation method used to estimate the value of an investment based on its expected future cash flows. The cash flows are discounted back to their present value using a discount rate."
  },
  {
    "category": "Finance", "type": "Instruction", "topic": "Define_BalanceSheet", "importance": 1.0,
    "input_pattern": "DEFINE_BALANCE_SHEET",
    "output_template": "A balance sheet is a financial statement that reports a company's assets, liabilities, and shareholders' equity at a specific point in time. It follows the fundamental accounting equation: Assets = Liabilities + Shareholders' Equity."
  }
];