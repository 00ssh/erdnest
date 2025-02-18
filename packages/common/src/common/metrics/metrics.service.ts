import { Injectable } from "@nestjs/common";
import { register, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { ElasticMetricType } from "./entities/elastic.metric.type";

@Injectable()
export class MetricsService {
  private static apiCpuTimeHistogram: Histogram<string>;
  private static apiCallsHistogram: Histogram<string>;
  private static pendingRequestsHistogram: Gauge<string>;
  private static externalCallsHistogram: Histogram<string>;
  private static elasticDurationHistogram: Histogram<string>;
  private static redisDurationHistogram: Histogram<string>;
  private static jobsHistogram: Histogram<string>;
  private static pendingApiHitGauge: Gauge<string>;
  private static cachedApiHitGauge: Gauge<string>;
  private static guestHitsGauge: Gauge<string>;
  private static guestNoCacheHitsGauge: Gauge<string>;
  private static guestHitQueriesGauge: Gauge<string>;
  private static isDefaultMetricsRegistered: boolean = false;


  constructor() {
    if (!MetricsService.apiCpuTimeHistogram) {
      MetricsService.apiCpuTimeHistogram = new Histogram({
        name: 'api_cpu_time',
        help: 'API CPU time',
        labelNames: ['endpoint'],
        buckets: [],
      });
    }

    if (!MetricsService.apiCallsHistogram) {
      MetricsService.apiCallsHistogram = new Histogram({
        name: 'api',
        help: 'API Calls',
        labelNames: ['endpoint', 'origin', 'code'],
        buckets: [],
      });
    }

    if (!MetricsService.pendingRequestsHistogram) {
      MetricsService.pendingRequestsHistogram = new Gauge({
        name: 'pending_requests',
        help: 'Pending requests',
        labelNames: ['endpoint'],
      });
    }

    if (!MetricsService.externalCallsHistogram) {
      MetricsService.externalCallsHistogram = new Histogram({
        name: 'external_apis',
        help: 'External Calls',
        labelNames: ['system'],
        buckets: [],
      });
    }

    if (!MetricsService.elasticDurationHistogram) {
      MetricsService.elasticDurationHistogram = new Histogram({
        name: 'elastic_duration',
        help: 'Elastic Duration',
        labelNames: ['type', 'index'],
        buckets: [],
      });
    }

    if (!MetricsService.redisDurationHistogram) {
      MetricsService.redisDurationHistogram = new Histogram({
        name: 'redis_duration',
        help: 'Redis Duration',
        labelNames: ['action'],
        buckets: [],
      });
    }

    if (!MetricsService.jobsHistogram) {
      MetricsService.jobsHistogram = new Histogram({
        name: 'jobs',
        help: 'Jobs',
        labelNames: ['job_identifier', 'result'],
        buckets: [],
      });
    }

    if (!MetricsService.pendingApiHitGauge) {
      MetricsService.pendingApiHitGauge = new Gauge({
        name: 'pending_api_hits',
        help: 'Number of hits for pending API calls',
        labelNames: ['endpoint'],
      });
    }

    if (!MetricsService.cachedApiHitGauge) {
      MetricsService.cachedApiHitGauge = new Gauge({
        name: 'cached_api_hits',
        help: 'Number of hits for cached API calls',
        labelNames: ['endpoint'],
      });
    }

    if (!MetricsService.guestNoCacheHitsGauge) {
      MetricsService.guestNoCacheHitsGauge = new Gauge({
        name: 'guest_no_cache_hits',
        help: 'Request no-cache hits for guest users',
        labelNames: [],
      });
    }

    if (!MetricsService.guestHitsGauge) {
      MetricsService.guestHitsGauge = new Gauge({
        name: 'guest_hits',
        help: 'Request hits for guest users',
        labelNames: [],
      });
    }

    if (!MetricsService.guestHitQueriesGauge) {
      MetricsService.guestHitQueriesGauge = new Gauge({
        name: 'guest_hit_queries',
        help: 'Distinct queries for guest hit caching',
        labelNames: [],
      });
    }

    if (!MetricsService.isDefaultMetricsRegistered) {
      MetricsService.isDefaultMetricsRegistered = true;
      collectDefaultMetrics();
    }
  }

  setApiCpuTime(endpoint: string, duration: number) {
    MetricsService.apiCpuTimeHistogram.labels(endpoint).observe(duration);
  }

  setApiCall(endpoint: string, origin: string, status: number, duration: number) {
    MetricsService.apiCallsHistogram.labels(endpoint, origin, status.toString()).observe(duration);
  }

  setPendingRequestsCount(count: number) {
    MetricsService.pendingRequestsHistogram.set(count);
  }

  setExternalCall(system: string, duration: number) {
    MetricsService.externalCallsHistogram.labels(system).observe(duration);
  }

  setElasticDuration(collection: string, type: ElasticMetricType, duration: number) {
    MetricsService.elasticDurationHistogram.labels(type, collection).observe(duration);
  }

  setRedisDuration(action: string, duration: number) {
    MetricsService.externalCallsHistogram.labels('redis').observe(duration);
    MetricsService.redisDurationHistogram.labels(action).observe(duration);
  }

  static setJobResult(job: string, result: 'success' | 'error', duration: number) {
    MetricsService.jobsHistogram.labels(job, result).observe(duration);
  }

  incrementPendingApiHit(endpoint: string) {
    MetricsService.pendingApiHitGauge.inc({ endpoint });
  }

  incrementCachedApiHit(endpoint: string) {
    MetricsService.cachedApiHitGauge.inc({ endpoint });
  }


  static incrementGuestHits() {
    MetricsService.guestHitsGauge.inc();
  }

  static incrementGuestNoCacheHits() {
    MetricsService.guestNoCacheHitsGauge.inc();
  }

  static setGuestHitQueries(count: number) {
    MetricsService.guestHitQueriesGauge.set(count);
  }

  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
