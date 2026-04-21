import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_18: IntentMap = new Map([
  // --- Project Management ---
  ['DEFINE_PROJECT_CHARTER', {
    keywords: { 'project': 2.5, 'charter': 4.0, 'define': 2.0 },
    booster_phrases: { 'what is a project charter': 5, 'define project charter': 5 }
  }],
  ['DEFINE_WBS', {
    keywords: { 'wbs': 5.0, 'work': 2.0, 'breakdown': 2.0, 'structure': 2.0 },
    booster_phrases: { 'what is a wbs': 5, 'define work breakdown structure': 5 }
  }],
  ['DEFINE_SCOPE_CREEP', {
    keywords: { 'scope': 3.0, 'creep': 4.0, 'define': 2.0 },
    booster_phrases: { 'what is scope creep': 5, 'define scope creep': 5 }
  }],
  ['DEFINE_CRITICAL_PATH', {
    keywords: { 'critical': 3.0, 'path': 4.0, 'method': 2.0 },
    booster_phrases: { 'what is the critical path': 5, 'define critical path': 5 }
  }],
  ['DEFINE_AGILE_METHODOLOGY', {
    keywords: { 'agile': 4.0, 'methodology': 3.0, 'project management': 2.0 },
    booster_phrases: { 'what is agile': 5, 'define agile methodology': 5 }
  }],
  ['DEFINE_SCRUM_FRAMEWORK', {
    keywords: { 'scrum': 4.0, 'framework': 3.0, 'agile': 2.0 },
    booster_phrases: { 'what is scrum': 5, 'define scrum framework': 5 }
  }],
  ['DEFINE_KANBAN_METHOD', {
    keywords: { 'kanban': 4.0, 'method': 3.0, 'board': 2.5 },
    booster_phrases: { 'what is kanban': 5, 'define kanban': 5 }
  }],

  // --- Marketing & SEO ---
  ['DEFINE_SEO', {
    keywords: { 'seo': 5.0, 'search': 2.0, 'engine': 2.0, 'optimization': 2.0 },
    booster_phrases: { 'what is seo': 5, 'define seo': 5 }
  }],
  ['DEFINE_SEM', {
    keywords: { 'sem': 5.0, 'search': 2.0, 'engine': 2.0, 'marketing': 2.0 },
    booster_phrases: { 'what is sem': 5, 'define sem': 5 }
  }],
  ['DEFINE_PPC', {
    keywords: { 'ppc': 5.0, 'pay': 2.0, 'per': 1.0, 'click': 2.0 },
    booster_phrases: { 'what is ppc': 5, 'define pay per click': 5 }
  }],
  ['DEFINE_CTR', {
    keywords: { 'ctr': 5.0, 'click': 2.0, 'through': 2.0, 'rate': 2.0 },
    booster_phrases: { 'what is ctr': 5, 'define click through rate': 5 }
  }],
  ['DEFINE_CONVERSION_RATE', {
    keywords: { 'conversion': 3.0, 'rate': 3.0, 'conversions': 3.0 },
    booster_phrases: { 'what is conversion rate': 5, 'define conversion rate': 5 }
  }],
  ['DEFINE_AB_TESTING', {
    keywords: { 'a/b': 4.0, 'testing': 3.0, 'split': 3.0, 'test': 2.5 },
    booster_phrases: { 'what is a/b testing': 5, 'define split testing': 5 }
  }],
  ['DEFINE_MARKETING_FUNNEL', {
    keywords: { 'marketing': 3.0, 'funnel': 4.0, 'customer': 2.0, 'journey': 2.5 },
    booster_phrases: { 'what is a marketing funnel': 5, 'define the marketing funnel': 5 }
  }],

  // --- Human Resources ---
  ['EXPLAIN_ONBOARDING', {
    keywords: { 'onboarding': 4.0, 'new': 2.0, 'hire': 2.0, 'employee': 2.0, 'process': 2.5 },
    booster_phrases: { 'what is onboarding': 5, 'explain the onboarding process': 5 }
  }],
  ['EXPLAIN_360_FEEDBACK', {
    keywords: { '360': 4.0, 'feedback': 3.5, 'degree': 2.0, 'performance': 2.5, 'review': 2.5 },
    booster_phrases: { 'what is 360 feedback': 5, 'explain 360 degree feedback': 5 }
  }],
  ['EXPLAIN_EMPLOYEE_ENGAGEMENT', {
    keywords: { 'employee': 3.0, 'engagement': 4.0, 'commitment': 2.5, 'passion': 2.5 },
    booster_phrases: { 'what is employee engagement': 5, 'define employee engagement': 5 }
  }],
  ['EXPLAIN_OPEN_DOOR_POLICY', {
    keywords: { 'open': 3.0, 'door': 3.0, 'policy': 3.5, 'communication': 2.5 },
    booster_phrases: { 'what is an open door policy': 5, 'explain open door policy': 5 }
  }],

  // --- Logistics ---
  ['DEFINE_SKU', {
    keywords: { 'sku': 5.0, 'stock': 2.0, 'keeping': 2.0, 'unit': 2.0 },
    booster_phrases: { 'what is a sku': 5, 'define sku': 5 }
  }],
  ['DEFINE_LTL_FTL', {
    keywords: { 'ltl': 4.0, 'ftl': 4.0, 'truckload': 3.0, 'shipping': 2.5 },
    booster_phrases: { 'what is ltl': 5, 'what is ftl': 5, 'difference between ltl and ftl': 5 }
  }],
  ['DEFINE_BOL', {
    keywords: { 'bol': 5.0, 'bill': 2.5, 'of': 1.0, 'lading': 2.5 },
    booster_phrases: { 'what is a bol': 5, 'define bill of lading': 5 }
  }],
  ['DEFINE_CROSS_DOCKING', {
    keywords: { 'cross-docking': 5.0, 'cross': 2.5, 'docking': 2.5, 'logistics': 2.0 },
    booster_phrases: { 'what is cross docking': 5, 'define cross-docking': 5 }
  }],

  // --- Finance ---
  ['DEFINE_GROSS_MARGIN', {
    keywords: { 'gross': 3.0, 'margin': 4.0, 'profitability': 2.5 },
    booster_phrases: { 'what is gross margin': 5, 'define gross margin': 5 }
  }],
  ['DEFINE_YOY_GROWTH', {
    keywords: { 'yoy': 5.0, 'year': 2.5, 'over': 1.0, 'growth': 2.5 },
    booster_phrases: { 'what is yoy growth': 5, 'define year over year': 5 }
  }],
  ['DEFINE_DCF', {
    keywords: { 'dcf': 5.0, 'discounted': 2.5, 'cash': 2.5, 'flow': 2.5, 'valuation': 2.0 },
    booster_phrases: { 'what is dcf': 5, 'define discounted cash flow': 5 }
  }],
  ['DEFINE_BALANCE_SHEET', {
    keywords: { 'balance': 3.0, 'sheet': 3.0, 'financial': 2.0, 'statement': 2.0, 'assets': 2.5, 'liabilities': 2.5 },
    booster_phrases: { 'what is a balance sheet': 5, 'define balance sheet': 5 }
  }]
]);