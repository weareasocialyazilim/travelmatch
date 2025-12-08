import React, { useState, useEffect, useMemo } from 'react';
import { eventTracking } from '@/services/event-tracking';
import type { CohortDefinition, FunnelStep, ABTest } from '@/services/event-tracking';
import { logger } from '@/utils/logger';

/**
 * Custom Analytics Dashboard Components
 * 
 * Better than Mixpanel/Amplitude:
 * - Real-time updates
 * - Unlimited events
 * - Full customization
 * - ML-powered insights
 * - No usage limits
 */

// ============================================
// EVENT EXPLORER
// ============================================

interface EventExplorerProps {
  userId?: string;
  limit?: number;
}

export function EventExplorer({ userId, limit = 100 }: EventExplorerProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const data = await eventTracking.queryEvents({
        userId,
        limit,
      });
      setEvents(data);
      setLoading(false);
    };
    loadEvents();

    // Subscribe to real-time events
    const unsubscribe = eventTracking.subscribeToEvents(
      (event) => {
        setEvents(prev => [event, ...prev].slice(0, limit));
      },
      { userId }
    );

    return unsubscribe;
  }, [userId, limit]);

  if (loading) return <div>Loading events...</div>;

  return (
    <div className="event-explorer">
      <h2>📊 Event Stream ({events.length})</h2>

      <div className="event-list">
        {events.map((event) => (
          <div
            key={event.id}
            className="event-item"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="event-header">
              <span className="event-name">{event.event_name}</span>
              <time className="event-time">
                {new Date(event.timestamp).toLocaleString()}
              </time>
            </div>
            {event.user_id && (
              <div className="event-user">
                User: {event.user_id.substring(0, 8)}...
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            <button onClick={() => setSelectedEvent(null)}>×</button>
            <h3>{selectedEvent.event_name}</h3>
            <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// FUNNEL ANALYSIS
// ============================================

interface FunnelAnalysisProps {
  steps: FunnelStep[];
  name: string;
  startDate?: string;
  endDate?: string;
}

export function FunnelAnalysis({ steps, name, startDate, endDate }: FunnelAnalysisProps) {
  const [funnelData, setFunnelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeFunnel = async () => {
      setLoading(true);
      const data = await eventTracking.analyzeFunnel({
        steps,
        startDate,
        endDate,
      });
      setFunnelData(data);
      setLoading(false);
    };
    analyzeFunnel();
  }, [steps, startDate, endDate]);

  if (loading) return <div>Analyzing funnel...</div>;
  if (!funnelData) return null;

  return (
    <div className="funnel-analysis">
      <h2>🔄 {name}</h2>

      <div className="funnel-overview">
        <div className="metric">
          <div className="metric-label">Total Users</div>
          <div className="metric-value">{funnelData.totalUsers.toLocaleString()}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Overall Conversion</div>
          <div className="metric-value">
            {(funnelData.overallConversion * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="funnel-steps">
        {funnelData.steps.map((step: any, index: number) => {
          const width = (step.users / funnelData.totalUsers) * 100;
          
          return (
            <div key={index} className="funnel-step">
              <div className="step-header">
                <span className="step-number">{step.step}</span>
                <span className="step-name">{step.event}</span>
              </div>

              <div className="step-bar-container">
                <div
                  className="step-bar"
                  style={{ width: `${width}%` }}
                />
              </div>

              <div className="step-metrics">
                <div className="metric">
                  <span className="metric-label">Users</span>
                  <span className="metric-value">{step.users.toLocaleString()}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Conversion</span>
                  <span className="metric-value">
                    {(step.conversionRate * 100).toFixed(1)}%
                  </span>
                </div>
                {step.dropoffRate > 0 && (
                  <div className="metric metric--warning">
                    <span className="metric-label">Dropoff</span>
                    <span className="metric-value">
                      {(step.dropoffRate * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COHORT BUILDER
// ============================================

interface CohortBuilderProps {
  onCohortCreated?: (cohortId: string) => void;
}

export function CohortBuilder({ onCohortCreated }: CohortBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<CohortDefinition['conditions']>({
    events: [],
    traits: {},
  });
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const addEventCondition = () => {
    setConditions(prev => ({
      ...prev,
      events: [
        ...(prev.events || []),
        { event: '', count: { min: 1 } },
      ],
    }));
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await eventTracking.createCohort({
        name,
        description,
        conditions,
      });
      setResult(result);
      onCohortCreated?.(result.cohortId);
    } catch (error) {
      logger.error('Failed to create cohort:', error);
    }
    setCreating(false);
  };

  return (
    <div className="cohort-builder">
      <h2>👥 Create User Cohort</h2>

      <div className="form">
        <div className="form-group">
          <label>Cohort Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Power Users"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Users who created 5+ moments"
          />
        </div>

        <div className="form-group">
          <label>Event Conditions</label>
          {conditions.events?.map((eventCondition, index) => (
            <div key={index} className="condition-row">
              <input
                type="text"
                placeholder="Event name"
                value={eventCondition.event}
                onChange={(e) => {
                  const newConditions = [...(conditions.events || [])];
                  newConditions[index].event = e.target.value;
                  setConditions(prev => ({ ...prev, events: newConditions }));
                }}
              />
              <input
                type="number"
                placeholder="Min count"
                value={eventCondition.count?.min || 1}
                onChange={(e) => {
                  const newConditions = [...(conditions.events || [])];
                  newConditions[index].count = { min: parseInt(e.target.value) };
                  setConditions(prev => ({ ...prev, events: newConditions }));
                }}
              />
            </div>
          ))}
          <button onClick={addEventCondition} className="btn-secondary">
            + Add Event Condition
          </button>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating || !name}
          className="btn-primary"
        >
          {creating ? 'Creating...' : 'Create Cohort'}
        </button>

        {result && (
          <div className="result">
            ✅ Cohort created with {result.userCount} users
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// A/B TEST DASHBOARD
// ============================================

interface ABTestDashboardProps {
  testId: string;
}

export function ABTestDashboard({ testId }: ABTestDashboardProps) {
  const [results, setResults] = useState<ABTest['results']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      const data = await eventTracking.analyzeABTest(testId);
      setResults(data || []);
      setLoading(false);
    };
    loadResults();

    // Refresh every 30 seconds
    const interval = setInterval(loadResults, 30000);
    return () => clearInterval(interval);
  }, [testId]);

  if (loading) return <div>Loading test results...</div>;

  const winner = results.find(r => r.winner);

  return (
    <div className="ab-test-dashboard">
      <h2>🧪 A/B Test Results</h2>

      {winner && (
        <div className="winner-banner">
          🏆 Winner: {winner.variant} with {(winner.conversionRate * 100).toFixed(1)}% conversion
          ({(winner.confidence * 100).toFixed(0)}% confidence)
        </div>
      )}

      <div className="variants-grid">
        {results.map((result) => (
          <div
            key={result.variant}
            className={`variant-card ${result.winner ? 'variant-card--winner' : ''}`}
          >
            <div className="variant-header">
              <h3>{result.variant}</h3>
              {result.winner && <span className="winner-badge">Winner</span>}
            </div>

            <div className="variant-metrics">
              <div className="metric">
                <div className="metric-label">Users</div>
                <div className="metric-value">{result.users.toLocaleString()}</div>
              </div>

              <div className="metric">
                <div className="metric-label">Conversions</div>
                <div className="metric-value">{result.conversions.toLocaleString()}</div>
              </div>

              <div className="metric metric--primary">
                <div className="metric-label">Conversion Rate</div>
                <div className="metric-value">
                  {(result.conversionRate * 100).toFixed(2)}%
                </div>
              </div>

              <div className="metric">
                <div className="metric-label">Confidence</div>
                <div className="metric-value">
                  {(result.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="conversion-bar">
              <div
                className="conversion-fill"
                style={{ width: `${result.conversionRate * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EVENT TIMELINE
// ============================================

interface EventTimelineProps {
  eventName: string;
  startDate: string;
  endDate: string;
  interval?: 'hour' | 'day' | 'week';
}

export function EventTimeline({
  eventName,
  startDate,
  endDate,
  interval = 'day',
}: EventTimelineProps) {
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimeline = async () => {
      setLoading(true);
      const events = await eventTracking.queryEvents({
        events: [eventName],
        startDate,
        endDate,
      });

      // Group by interval
      const grouped = new Map<string, { count: number; users: Set<string> }>();
      
      events.forEach(event => {
        const date = new Date(event.timestamp);
        let key: string;
        
        if (interval === 'hour') {
          key = date.toISOString().substring(0, 13) + ':00';
        } else if (interval === 'week') {
          const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
          key = new Date(week * 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
        } else {
          key = date.toISOString().substring(0, 10);
        }

        if (!grouped.has(key)) {
          grouped.set(key, { count: 0, users: new Set() });
        }

        const entry = grouped.get(key)!;
        entry.count++;
        if (event.user_id) {
          entry.users.add(event.user_id);
        }
      });

      const data = Array.from(grouped.entries())
        .map(([date, stats]) => ({
          date,
          count: stats.count,
          uniqueUsers: stats.users.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setTimelineData(data);
      setLoading(false);
    };
    loadTimeline();
  }, [eventName, startDate, endDate, interval]);

  if (loading) return <div>Loading timeline...</div>;

  const maxCount = Math.max(...timelineData.map(d => d.count));

  return (
    <div className="event-timeline">
      <h2>📈 {eventName} Timeline</h2>

      <div className="timeline-chart">
        {timelineData.map((point) => {
          const height = (point.count / maxCount) * 100;
          
          return (
            <div key={point.date} className="timeline-bar">
              <div
                className="bar-fill"
                style={{ height: `${height}%` }}
                title={`${point.count} events, ${point.uniqueUsers} users`}
              />
              <div className="bar-label">{point.date.substring(5)}</div>
            </div>
          );
        })}
      </div>

      <div className="timeline-stats">
        <div className="stat">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">
            {timelineData.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Unique Users</div>
          <div className="stat-value">
            {new Set(timelineData.flatMap(d => d.uniqueUsers)).size.toLocaleString()}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg Events/Period</div>
          <div className="stat-value">
            {(timelineData.reduce((sum, d) => sum + d.count, 0) / timelineData.length).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ML INSIGHTS PANEL
// ============================================

interface MLInsightsPanelProps {
  events?: string[];
  startDate?: string;
  endDate?: string;
  focusArea?: 'engagement' | 'conversion' | 'retention' | 'monetization';
}

export function MLInsightsPanel({ events, startDate, endDate, focusArea }: MLInsightsPanelProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      const data = await eventTracking.generateInsights({
        events,
        startDate,
        endDate,
        focusArea,
      });
      setInsights(data);
      setLoading(false);
    };
    loadInsights();
  }, [events, startDate, endDate, focusArea]);

  if (loading) {
    return (
      <div className="ml-insights-loading">
        <div className="spinner" />
        <p>Claude is analyzing your data...</p>
      </div>
    );
  }

  const icons = {
    insight: '💡',
    warning: '⚠️',
    opportunity: '🎯',
  };

  return (
    <div className="ml-insights-panel">
      <h2>🤖 AI Insights (Claude Sonnet 4)</h2>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`insight-card insight-card--${insight.type}`}
          >
            <div className="insight-header">
              <span className="insight-icon">{icons[insight.type as keyof typeof icons]}</span>
              <span className={`insight-impact insight-impact--${insight.impact}`}>
                {insight.impact} impact
              </span>
            </div>

            <h3 className="insight-title">{insight.title}</h3>
            <p className="insight-description">{insight.description}</p>

            <div className="insight-confidence">
              Confidence: {(insight.confidence * 100).toFixed(0)}%
            </div>

            {insight.recommendations && insight.recommendations.length > 0 && (
              <div className="insight-recommendations">
                <strong>Recommendations:</strong>
                <ul>
                  {insight.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {insights.length === 0 && (
          <div className="insights-empty">
            No insights available. Generate more data to get AI-powered recommendations.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPREHENSIVE ANALYTICS DASHBOARD
// ============================================

export function AnalyticsDashboardComplete() {
  const [activeTab, setActiveTab] = useState<'events' | 'funnels' | 'cohorts' | 'tests' | 'insights'>('events');

  return (
    <div className="analytics-dashboard-complete">
      <header className="dashboard-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Custom analytics platform - Better than Mixpanel/Amplitude</p>
      </header>

      <nav className="dashboard-tabs">
        {(['events', 'funnels', 'cohorts', 'tests', 'insights'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'tab--active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="dashboard-content">
        {activeTab === 'events' && (
          <div>
            <EventExplorer limit={50} />
            <EventTimeline
              eventName="moment_created"
              startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}
              endDate={new Date().toISOString()}
            />
          </div>
        )}

        {activeTab === 'funnels' && (
          <FunnelAnalysis
            name="User Activation Funnel"
            steps={[
              { event: 'signup' },
              { event: 'profile_complete' },
              { event: 'moment_created' },
              { event: 'match_made' },
            ]}
          />
        )}

        {activeTab === 'cohorts' && <CohortBuilder />}

        {activeTab === 'tests' && (
          <div className="ab-tests-list">
            <h2>A/B Tests</h2>
            <p>Create and analyze A/B tests here</p>
          </div>
        )}

        {activeTab === 'insights' && (
          <MLInsightsPanel
            startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}
            endDate={new Date().toISOString()}
          />
        )}
      </div>
    </div>
  );
}
