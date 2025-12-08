# Supabase Multi-Region Replica Test Senaryosu

## Objective
Test Supabase multi-region deployment with read replicas for:
- Reduced latency for global users
- High availability and disaster recovery
- Scalability for read-heavy workloads

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Global Load Balancer                        │
│                    (CloudFlare / AWS Route53)                    │
└─────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  US East     │  │  EU West     │  │  AP Southeast│
│  (Primary)   │  │  (Replica)   │  │  (Replica)   │
│              │  │              │  │              │
│ PostgreSQL   │──│ PostgreSQL   │──│ PostgreSQL   │
│ Read/Write   │  │ Read-only    │  │ Read-only    │
│              │  │              │  │              │
│ Redis        │──│ Redis        │──│ Redis        │
│ Primary      │  │ Replica      │  │ Replica      │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Configuration

### Primary Region (US East)
- **Database**: Read/Write (All operations)
- **Replication**: Logical replication to replicas
- **Failover**: Automatic promotion of replica to primary
- **Backup**: Continuous backup + Point-in-time recovery

### Replica Regions (EU West, AP Southeast)
- **Database**: Read-only (SELECT queries only)
- **Replication Lag**: Target < 100ms
- **Failback**: Automatic sync when primary recovers

## Routing Strategy

### Geographic Routing
```typescript
function selectRegion(userLocation: { lat: number; lng: number }) {
  const distances = {
    'us-east': calculateDistance(userLocation, US_EAST_COORDS),
    'eu-west': calculateDistance(userLocation, EU_WEST_COORDS),
    'ap-southeast': calculateDistance(userLocation, AP_SOUTHEAST_COORDS),
  };
  
  return Object.keys(distances).reduce((a, b) => 
    distances[a] < distances[b] ? a : b
  );
}
```

### Query Type Routing
```typescript
function getSupabaseClient(operationType: 'read' | 'write') {
  if (operationType === 'write') {
    return primaryClient; // Always write to primary
  }
  
  // Read from nearest replica
  const region = selectRegion(userLocation);
  return replicaClients[region];
}
```

## Test Scenarios

### 1. Replication Lag Test
**Goal**: Measure replication lag between primary and replicas

```typescript
async function testReplicationLag() {
  // Write to primary
  const startTime = Date.now();
  const { data } = await primaryClient
    .from('test_replication')
    .insert({ data: 'test', timestamp: startTime })
    .select()
    .single();
  
  // Read from replica until data appears
  let lagMs = 0;
  while (true) {
    const { data: replicaData } = await replicaClient
      .from('test_replication')
      .select()
      .eq('id', data.id)
      .single();
    
    if (replicaData) {
      lagMs = Date.now() - startTime;
      break;
    }
    
    await sleep(10);
  }
  
  console.log(`Replication lag: ${lagMs}ms`);
  return lagMs;
}
```

**Expected**: < 100ms lag

### 2. Failover Test
**Goal**: Test automatic failover when primary goes down

```bash
# Simulate primary failure
docker stop travelmatch-postgres-primary

# Monitor: replica should promote to primary
# Expected: < 30 seconds failover time
```

### 3. Read Scalability Test
**Goal**: Measure read throughput with replicas

```typescript
async function testReadScalability() {
  const operations = 1000;
  const concurrent = 50;
  
  // Without replicas (all reads to primary)
  const singleRegionTime = await benchmarkReads(primaryClient, operations, concurrent);
  
  // With replicas (distributed reads)
  const multiRegionTime = await benchmarkReads(
    [primaryClient, euReplicaClient, apReplicaClient],
    operations,
    concurrent
  );
  
  console.log(`Single region: ${singleRegionTime}ms`);
  console.log(`Multi region: ${multiRegionTime}ms`);
  console.log(`Improvement: ${((singleRegionTime - multiRegionTime) / singleRegionTime * 100).toFixed(2)}%`);
}
```

**Expected**: 2-3x improvement with replicas

### 4. Geographic Latency Test
**Goal**: Measure latency reduction for global users

```typescript
async function testGeographicLatency() {
  const testLocations = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  ];
  
  for (const location of testLocations) {
    // Test with primary only
    const primaryLatency = await measureLatency(location, primaryClient);
    
    // Test with nearest replica
    const region = selectRegion(location);
    const replicaLatency = await measureLatency(location, replicaClients[region]);
    
    console.log(`${location.name}:`);
    console.log(`  Primary: ${primaryLatency}ms`);
    console.log(`  Replica (${region}): ${replicaLatency}ms`);
    console.log(`  Improvement: ${((primaryLatency - replicaLatency) / primaryLatency * 100).toFixed(2)}%`);
  }
}
```

**Expected**: 40-60% latency reduction for distant regions

### 5. Write Performance Test
**Goal**: Ensure writes don't degrade with replicas

```typescript
async function testWritePerformance() {
  const operations = 1000;
  
  // Test write throughput
  const startTime = Date.now();
  
  await Promise.all(
    Array.from({ length: operations }, (_, i) => 
      primaryClient
        .from('test_writes')
        .insert({ data: `test-${i}` })
    )
  );
  
  const duration = Date.now() - startTime;
  const throughput = operations / (duration / 1000);
  
  console.log(`Write operations: ${operations}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`Throughput: ${throughput.toFixed(2)} ops/sec`);
}
```

**Expected**: > 500 ops/sec

### 6. Conflict Resolution Test
**Goal**: Test handling of write conflicts during failover

```typescript
async function testConflictResolution() {
  // Simulate split-brain scenario
  // Write to primary
  await primaryClient
    .from('test_conflicts')
    .update({ value: 'primary' })
    .eq('id', 'test-1');
  
  // Simulate network partition
  // Write to replica (promoted to primary)
  await replicaClient
    .from('test_conflicts')
    .update({ value: 'replica' })
    .eq('id', 'test-1');
  
  // Network heals - check conflict resolution
  const { data } = await primaryClient
    .from('test_conflicts')
    .select()
    .eq('id', 'test-1')
    .single();
  
  console.log(`Conflict resolved to: ${data.value}`);
  // Should use last-write-wins or custom resolution logic
}
```

## Docker Compose Configuration

### Primary + Replicas
```yaml
# docker-compose.multi-region.yml
version: '3.8'

services:
  # Primary Database (US East)
  postgres-primary:
    image: supabase/postgres:15.1.0.147
    environment:
      POSTGRES_HOST: postgres-primary
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-primary-data:/var/lib/postgresql/data
    command: |
      postgres
      -c wal_level=logical
      -c max_wal_senders=10
      -c max_replication_slots=10

  # EU West Replica
  postgres-eu-west:
    image: supabase/postgres:15.1.0.147
    environment:
      POSTGRES_HOST: postgres-eu-west
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_PRIMARY_HOST: postgres-primary
      POSTGRES_PRIMARY_PORT: 5432
    ports:
      - "5433:5432"
    volumes:
      - postgres-eu-west-data:/var/lib/postgresql/data
    depends_on:
      - postgres-primary
    command: |
      postgres
      -c hot_standby=on
      -c wal_level=replica

  # AP Southeast Replica
  postgres-ap-southeast:
    image: supabase/postgres:15.1.0.147
    environment:
      POSTGRES_HOST: postgres-ap-southeast
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_PRIMARY_HOST: postgres-primary
      POSTGRES_PRIMARY_PORT: 5432
    ports:
      - "5434:5432"
    volumes:
      - postgres-ap-southeast-data:/var/lib/postgresql/data
    depends_on:
      - postgres-primary
    command: |
      postgres
      -c hot_standby=on
      -c wal_level=replica

  # Redis Primary (US East)
  redis-primary:
    image: redis/redis-stack:7.2.0-v6
    ports:
      - "6379:6379"
    volumes:
      - redis-primary-data:/data

  # Redis EU West Replica
  redis-eu-west:
    image: redis/redis-stack:7.2.0-v6
    ports:
      - "6380:6379"
    volumes:
      - redis-eu-west-data:/data
    command: redis-server --replicaof redis-primary 6379

  # Redis AP Southeast Replica
  redis-ap-southeast:
    image: redis/redis-stack:7.2.0-v6
    ports:
      - "6381:6379"
    volumes:
      - redis-ap-southeast-data:/data
    command: redis-server --replicaof redis-primary 6379

volumes:
  postgres-primary-data:
  postgres-eu-west-data:
  postgres-ap-southeast-data:
  redis-primary-data:
  redis-eu-west-data:
  redis-ap-southeast-data:
```

## Running Tests

### Setup
```bash
# Start multi-region stack
docker-compose -f docker-compose.multi-region.yml up -d

# Wait for replication to be ready
sleep 30

# Configure replication
./scripts/setup-replication.sh
```

### Run Test Suite
```bash
cd poc/multi-region
pnpm install
pnpm test
```

### Individual Tests
```bash
# Replication lag
pnpm test:lag

# Failover
pnpm test:failover

# Read scalability
pnpm test:read-scale

# Geographic latency
pnpm test:geo-latency

# Write performance
pnpm test:write-perf

# Conflict resolution
pnpm test:conflicts
```

## Metrics to Track

### Performance
- Replication lag (target: < 100ms)
- Read throughput (target: 3x improvement)
- Write throughput (target: no degradation)
- Latency p50, p95, p99

### Reliability
- Failover time (target: < 30s)
- Data loss during failover (target: 0)
- Uptime (target: 99.99%)

### Cost
- Infrastructure cost per region
- Data transfer costs
- Cost per query

## Results (Expected)

| Metric | Single Region | Multi-Region | Improvement |
|--------|---------------|--------------|-------------|
| Global p95 Latency | 800ms | 250ms | 68% ↓ |
| Read Throughput | 5K req/s | 15K req/s | 200% ↑ |
| Replication Lag | N/A | 80ms | - |
| Failover Time | N/A | 25s | - |
| Monthly Cost | $500 | $1200 | 140% ↑ |

## Next Steps

1. **Production Setup**
   - Deploy to real Supabase regions
   - Configure CloudFlare for geo-routing
   - Set up monitoring (Datadog, Grafana)

2. **Optimization**
   - Tune replication settings
   - Implement caching strategy
   - Optimize query routing

3. **Monitoring**
   - Real-time lag monitoring
   - Failover alerting
   - Performance dashboards

4. **Documentation**
   - Runbook for operations
   - Disaster recovery procedures
   - Cost optimization guide

## Resources

- [Supabase Replication Docs](https://supabase.com/docs/guides/platform/replication)
- [PostgreSQL Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)
- [Redis Replication](https://redis.io/topics/replication)
