export interface AnalyticsOverviewDTO {
  period: {
    start: string
    end: string
  }
  visitors: {
    total: number
    newVisitors: number
    returning: number
  }
  sessions: {
    total: number
    averageDuration: number
    averagePages: number
    bounceRate: number
  }
  conversions: {
    cadastroStarted: number
    cadastroCompleted: number
    conversionRate: number
  }
  topPages: {
    path: string
    views: number
    avgTimeOnPage: number
  }[]
}

export interface AnalyticsTrafficDTO {
  sources: {
    source: string
    visitors: number
    sessions: number
    conversionRate: number
  }[]
  campaigns: {
    campaign: string
    source: string
    medium: string
    visitors: number
    conversions: number
  }[]
  topReferrers: {
    referrer: string
    visitors: number
  }[]
}

export interface AnalyticsBehaviorDTO {
  topCTAs: {
    elementId: string
    label: string
    section: string
    clicks: number
  }[]
  scrollDepth: {
    '25': number
    '50': number
    '75': number
    '100': number
  }
  sectionVisibility: {
    section: string
    viewRate: number
  }[]
  flows: {
    exitPages: {
      path: string
      exits: number
      exitRate: number
    }[]
  }
}

export interface AnalyticsConversionsDTO {
  funnel: {
    totalVisitors: number
    viewedPricing: number
    startedCadastro: number
    completedStep0_empresa: number
    completedStep1_localizacao: number
    completedStep2_acesso: number
    completedStep3_tema: number
    completedStep4_plano: number
    completedCadastro: number
  }
  planDistribution: {
    planId: string
    planName: string
    count: number
    percentage: number
  }[]
  billingPreference: {
    monthly: number
    annual: number
    annualPercentage: number
  }
  averageTimeToConvert: {
    fromFirstVisitMs: number
    averageSessions: number
  }
}

export interface AnalyticsContextDTO {
  devices: {
    desktop: { visitors: number; percentage: number; conversionRate: number }
    mobile: { visitors: number; percentage: number; conversionRate: number }
    tablet: { visitors: number; percentage: number; conversionRate: number }
  }
  browsers: {
    browser: string
    visitors: number
    percentage: number
  }[]
  osList: {
    os: string
    visitors: number
    percentage: number
  }[]
  geo: {
    countries: { name: string; visitors: number; percentage: number }[]
    states: { name: string; visitors: number; percentage: number }[]
    cities: { name: string; visitors: number; percentage: number }[]
  }
  performance: {
    averages: {
      pageLoadTime: number
      fcp: number
      lcp: number
      fid: number
      cls: number
      ttfb: number
    }
    byDevice: {
      desktop: { pageLoadTime: number; lcp: number }
      mobile: { pageLoadTime: number; lcp: number }
    }
    percentiles: {
      p50: { lcp: number; fid: number; cls: number }
      p75: { lcp: number; fid: number; cls: number }
      p95: { lcp: number; fid: number; cls: number }
    }
  }
  errors: {
    total: number
    byType: { type: string; count: number }[]
    topErrors: {
      message: string
      count: number
      lastOccurrence: string
    }[]
  }
}

export interface AnalyticsRealtimeDTO {
  activeVisitors: number
  activePages: {
    path: string
    visitors: number
  }[]
  recentEvents: {
    type: string
    planName?: string
    elementLabel?: string
    section?: string
    occurredAt: string
  }[]
  last30Minutes: {
    visitors: number
    pageViews: number
    conversions: number
  }
}
