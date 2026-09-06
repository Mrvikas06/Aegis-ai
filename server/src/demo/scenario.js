/**
 * Aegis Scenario Library — 5 rich incident scenarios for demo + hackathon
 * Each has: participants, a detailed script, and Aegis AI interjections
 */

export const DEMO_PARTICIPANTS = [
  { id: "p1", name: "Meera",  role: "incident_commander" },
  { id: "p2", name: "Arjun",  role: "deputy_ic" },
  { id: "p3", name: "Priya",  role: "engineer" },
  { id: "p4", name: "Sam",    role: "engineer" },
  { id: "p5", name: "Divya",  role: "support" },
  { id: "p6", name: "Karan",  role: "business" },
];

// ── Scenario 1: Payment Gateway Outage (original, expanded) ─────────────────
export const SCENARIO_PAYMENT_GATEWAY = [
  { speakerId: "p1",     text: "Alright team, PagerDuty just fired a SEV-1. We have a full outage on the main Checkout Gateway. Meera is IC, Arjun you're deputy. Everyone else, please state your role." },
  { speakerId: "p3",     text: "Priya on platform infra. Looking at Datadog now — error rate hit 42% at exactly 14:02 UTC on the payment-gateway-api service." },
  { speakerId: "p5",     text: "Divya from Support. Customer tickets are flooding in. Users report checkout is completely broken, HTTP 503 everywhere. We've already had 340 tickets in the past 6 minutes." },
  { speakerId: "p4",     text: "Sam here. I think this might be related to the cart-service v2.14 deploy we pushed 55 minutes ago. Let me pull the deployment logs now." },
  { speakerId: "p2",     text: "Arjun checking databases. RDS primary looks healthy from my end — connections at 62, well below the 200 limit." },
  { speakerId: "p4",     text: "Wait — I'm looking at the connection pool specifically for the payment-processor microservice. It's at 100 out of 100 max connections. Everything is queued." },
  { speakerId: "p3",     text: "Confirmed. Postgres primary CPU just spiked to 99%. I'm seeing a massive query lock in pg_stat_activity — looks like long-running transactions are blocking everything." },
  { speakerId: "p6",     text: "Karan from business. We are losing approximately $40K per minute. The CEO is watching. I need an ETA on resolution in the next 5 minutes." },
  { speakerId: "p2",     text: "Wait Arjun here — are we certain the connection pool is the root cause? Priya saw CPU spike first. Could the CPU spike have caused the pool exhaustion, not the other way around?" },
  { speakerId: "p4",     text: "Good catch Arjun. I just found it. The v2.14 deploy introduced an N+1 query bug in the tax calculation service. Every cart with more than 3 items triggers 47 sequential DB queries instead of one join. That's both exhausting the pool AND spiking CPU." },
  { speakerId: "p1",     text: "Priya, Arjun — can we verify this hypothesis against the query logs before we act? I don't want to rollback on a guess." },
  { speakerId: "p3",     text: "Confirmed. I can see `SELECT tax FROM tax_table WHERE sku_id = $1` being called in a tight loop in the slow query log, correlated with the v2.14 deployment timestamp." },
  { speakerId: "p2",     text: "Root cause confirmed. Decision: we are rolling back v2.14 immediately to restore service. Simultaneously Priya will temporarily raise the connection pool limit to 200 as a mitigation." },
  { speakerId: "p1",     text: "Sam, please execute the rollback via Jenkins Pipeline checkout-service-rollback." },
  { speakerId: "p4",     text: "Rollback initiated... Jenkins is throwing a 500. Pipeline executor is down. Build #1847 failed at the docker pull stage." },
  { speakerId: "p5",     text: "Update: ticket volume is at 820 now. Users are asking for a status page update." },
  { speakerId: "p1",     text: "Aegis, draft a status page message: investigating checkout disruptions, estimated resolution in 15 minutes." },
  { speakerId: "p4",     text: "Trying CLI rollback — kubectl rollout undo deployment/checkout-service-v2. Executing now." },
  { speakerId: "p4",     text: "CLI rollback complete. Pods are spinning up. Traffic should drain in 60 to 90 seconds." },
  { speakerId: "p3",     text: "Postgres CPU dropping fast. Now at 38%. Connection pool freed — down to 34 active connections." },
  { speakerId: "p3",     text: "Payment gateway error rate recovering. 18%... 9%... 3%. We're back." },
  { speakerId: "p2",     text: "Kafka consumer lag is clearing on the cart-checkout topic. 200K events down to 45K and draining." },
  { speakerId: "p1",     text: "Excellent work team. We'll monitor for another 8 minutes. Karan, please update the business stakeholders. Aegis, log the resolution and prepare the postmortem summary." },
];

// ── Scenario 2: Auth Service Meltdown ───────────────────────────────────────
export const SCENARIO_AUTH_MELTDOWN = [
  { speakerId: "p1", text: "SEV-1 declared. Auth service is returning 401s for ALL users — nobody can log in to any product. This started 4 minutes ago. Time is critical." },
  { speakerId: "p3", text: "I'm seeing it in logs. The JWT validation service is crashing on startup. Error says: Cannot read property 'verify' of undefined. This looks like a bad import." },
  { speakerId: "p2", text: "Checking recent deploys. Auth-service v3.8.2 was deployed 7 minutes ago. That's almost certainly our culprit." },
  { speakerId: "p4", text: "Confirmed — v3.8.2 changed the JWT library import from `require('jsonwebtoken')` to ESM `import jwt from 'jsonwebtoken'`. The container is running Node 14 which doesn't support ESM natively." },
  { speakerId: "p5", text: "Support here. We have 12,000 users locked out. Our enterprise client Acme Corp is actively paging their account manager. This is critical." },
  { speakerId: "p2", text: "We have two options: one — rollback auth-service to v3.8.1 which takes 4 minutes. Two — hotfix the import syntax and redeploy, which takes 12 minutes. What's your call Meera?" },
  { speakerId: "p1", text: "Rollback. Every minute matters with auth down. Sam start the rollback now, Priya stand up a hotfix branch in parallel." },
  { speakerId: "p4", text: "Rollback to v3.8.1 initiated. Old pods spinning up." },
  { speakerId: "p3", text: "I see v3.8.1 pods passing health checks. JWT service is starting clean." },
  { speakerId: "p4", text: "Traffic switching to v3.8.1. Login success rate going from 0% to... 94%... 99%. We're back. Auth restored." },
  { speakerId: "p6", text: "Business team confirms enterprise clients are recovering. Acme Corp is logged back in. Please prepare a customer impact statement." },
  { speakerId: "p1", text: "Good. Root cause confirmed: ESM syntax deployed to Node 14 runtime. Action items: upgrade container runtime to Node 20 before next auth deploy, add runtime compatibility CI check. Aegis, please document everything." },
];

// ── Scenario 3: Database Failover Chaos ────────────────────────────────────
export const SCENARIO_DB_FAILOVER = [
  { speakerId: "p1", text: "We have a SEV-1. Our primary RDS PostgreSQL instance in us-east-1 went completely offline 8 minutes ago. Automated failover to the read replica should have happened — but our app is still returning 500s." },
  { speakerId: "p3", text: "I can confirm the failover happened. The read replica was promoted to primary at 09:14:33 UTC. But I'm seeing a problem — our app's DATABASE_URL env variable is hardcoded to the old primary endpoint." },
  { speakerId: "p2", text: "That's a known tech debt item we never fixed. The app doesn't use the cluster endpoint, it uses the instance endpoint directly. So failover is invisible to the application." },
  { speakerId: "p4", text: "I can push a config update to point all app instances at the new primary endpoint. But that requires a rolling restart of 240 application pods. Estimated time: 6 minutes." },
  { speakerId: "p5", text: "Support says API response times are 45 seconds for users who are getting through at all. Most are getting hard 503s. Orders are failing silently — this is revenue-impacting." },
  { speakerId: "p1", text: "Sam proceed with the config update and rolling restart. Priya please verify the new primary's replication lag before we put load on it." },
  { speakerId: "p3", text: "New primary replication lag is 0ms — it was fully caught up before the failover. Max connections available: 500. We're safe to route traffic." },
  { speakerId: "p4", text: "Config update deployed. Rolling restart at 60 pods... 120 pods... 180... all 240 pods restarted. New primary endpoint is live in config." },
  { speakerId: "p3", text: "Database connections healthy on new primary. Application is connecting successfully. Error rate dropping from 94% to 12% to 2%. Recovering." },
  { speakerId: "p2", text: "We also need to understand why the original primary went down. AWS Health Dashboard shows a hardware failure in the us-east-1b AZ at 09:14 UTC. Unplanned, not our code." },
  { speakerId: "p1", text: "Understood. Immediate postmortem action: migrate all database connections to use cluster endpoint. No exceptions. This should have been automatic. Aegis please create a Jira epic for the cluster endpoint migration." },
];

// ── Scenario 4: CDN & Frontend Catastrophe ─────────────────────────────────
export const SCENARIO_CDN_OUTAGE = [
  { speakerId: "p1", text: "SEV-2 escalating to SEV-1. Our entire frontend is returning a blank white page globally. The API is healthy — this is a CDN or static asset issue. Time of onset: 5 minutes ago." },
  { speakerId: "p3", text: "I see it. Our CloudFront distribution is serving 403 Forbidden for all static assets — the JavaScript bundles, CSS, images, everything." },
  { speakerId: "p4", text: "I pushed a frontend deploy 8 minutes ago. The CI pipeline ran successfully. But looking at the S3 bucket — the deploy script accidentally set all objects to private ACL instead of public-read." },
  { speakerId: "p2", text: "So the files are there, CloudFront can reach S3, but S3 is refusing to serve them because of the ACL change. Every user sees a blank page because the JS bundle is 403." },
  { speakerId: "p5", text: "Social media is on fire. Twitter users are posting screenshots of the blank page. We have press mentions forming. This is very visible externally." },
  { speakerId: "p1", text: "Two parallel tracks. Sam fix the S3 ACL immediately — make all objects in the deploy public-read. Priya check if we can serve the previous version from the backup CloudFront origin while Sam fixes it." },
  { speakerId: "p4", text: "Running: aws s3 cp s3://prod-frontend-bucket s3://prod-frontend-bucket --recursive --acl public-read --metadata-directive REPLACE. 847 objects... done. ACL fixed." },
  { speakerId: "p3", text: "CloudFront cache needs a purge now or users will keep getting cached 403s. Creating invalidation for /* path now." },
  { speakerId: "p4", text: "CloudFront invalidation complete. Testing from 3 global regions — all returning 200 now. Frontend is loading." },
  { speakerId: "p6", text: "Marketing team confirming the Twitter mentions are stopping. Users reporting the site is back. What happened — can I have a one-liner for the status page?" },
  { speakerId: "p1", text: "Status page update: a deployment misconfigured file permissions causing temporary frontend unavailability. Fully resolved. Root fix: add S3 ACL validation to CI pipeline. Aegis please document and create the Jira ticket." },
];

// ── Scenario 5: Kafka Consumer Lag Crisis ──────────────────────────────────
export const SCENARIO_KAFKA_CRISIS = [
  { speakerId: "p1", text: "We have a SEV-2 trending to SEV-1. Our order processing pipeline is falling behind. Kafka consumer lag on the orders topic is at 2.4 million messages and growing. Orders placed 40 minutes ago haven't been fulfilled." },
  { speakerId: "p3", text: "I can see the consumer group order-processor is processing at 800 messages per second but the producer is publishing at 3,200 messages per second. We're running at 25% throughput of what we need." },
  { speakerId: "p4", text: "The order-processor service has 8 replicas. Each replica is single-threaded for message processing. This was fine at our previous traffic levels but Black Friday traffic is 4x the normal." },
  { speakerId: "p2", text: "We can scale horizontally but the Kafka topic only has 8 partitions. We can't have more consumers than partitions, so we're already at max effective parallelism." },
  { speakerId: "p5", text: "Customer support is receiving escalations. Customers paid for orders but received no confirmation email and their order doesn't appear in the app. This feels like data loss to them." },
  { speakerId: "p4", text: "It's not data loss — orders are written to Postgres synchronously. The Kafka events are for downstream processing: email confirmation, inventory deduction, warehouse notification. Those are all delayed." },
  { speakerId: "p1", text: "Okay. Immediate options: one — add partitions to the topic and scale replicas. Two — optimize the consumer to be multi-threaded. Three — temporarily disable non-critical downstream consumers to prioritize email confirmations. What's feasible right now?" },
  { speakerId: "p2", text: "Adding partitions to an existing Kafka topic requires a rebalance — it's safe but takes 3 to 5 minutes and causes a brief consumer pause. We should also increase consumer threads from 1 to 8 per replica." },
  { speakerId: "p3", text: "I can deploy the multi-threaded consumer config in 4 minutes. That would give us 64 concurrent threads across 8 replicas. Theoretical throughput: 6,400 messages per second. More than enough." },
  { speakerId: "p1", text: "Do it. Priya deploy the multi-threaded config. Arjun expand the topic to 32 partitions and scale replicas to 32. Sam send a holding email to all affected customers explaining the delay." },
  { speakerId: "p3", text: "Multi-threaded consumer deployed. Consumer lag rate is reversing. We're now processing at 5,800 messages per second. Lag at 2.1M and dropping fast." },
  { speakerId: "p4", text: "Partition expansion complete. 32 consumers online, all assigned partitions. System at full throughput." },
  { speakerId: "p2", text: "At current drain rate, full backlog will be cleared in approximately 6 minutes. Email confirmations are going out to customers now." },
  { speakerId: "p1", text: "Excellent. Postmortem actions: capacity plan for Black Friday-level traffic, auto-scaling policy for Kafka consumers based on lag threshold, and partition count review for all critical topics. Aegis please compile the full incident report." },
];

// ── Legacy exports for existing routes ─────────────────────────────────────
export const DEMO_SCRIPT = SCENARIO_PAYMENT_GATEWAY;

export const JUDGES_PITCH_SCRIPT = [
  { speakerId: "p1", text: "Welcome! This is Aegis, your AI Incident Commander — powered by Agora Conversational AI." },
  { speakerId: "p3", text: "Aegis is listening to this voice room in real time. Every word is classified as a Fact, Hypothesis, Decision, or Action Item automatically." },
  { speakerId: "p4", text: "For example: the payment gateway error rate is currently 42% and climbing. Aegis just logged that as a confirmed Fact." },
  { speakerId: "p2", text: "If I say 'I think the database connection pool is exhausted' — that's a Hypothesis. Aegis flags it as unconfirmed until we verify it." },
  { speakerId: "p5", text: "Aegis also tracks who owns what. When Meera says 'Sam, please execute the rollback', Aegis creates an Action Item assigned to Sam." },
  { speakerId: "p6", text: "Conflicts are caught automatically too. If Arjun says the DB is healthy but Priya says CPU is at 99%, Aegis surfaces that contradiction immediately." },
  { speakerId: "p1", text: "You can talk to Aegis directly. Ask: what do we know so far? What is still unresolved? Who owns the rollback? Aegis answers in real time from the incident state." },
  { speakerId: "p3", text: "Critical actions — Jira tickets, PagerDuty escalations, Statuspage updates — are proposed by Aegis and require your explicit confirmation before executing." },
  { speakerId: "p2", text: "At the end, Aegis generates a complete incident postmortem: timeline, root cause, decisions made, risks still open, and all action items." },
  { speakerId: "p1", text: "Aegis: teams using AI incident coordination resolve SEV-1 outages up to 40% faster. Thank you for the demo!" },
];

// ── Scenario registry (for API selection) ──────────────────────────────────
export const SCENARIOS = {
  payment_gateway: { name: "Payment Gateway Outage",      script: SCENARIO_PAYMENT_GATEWAY },
  auth_meltdown:   { name: "Auth Service Meltdown",       script: SCENARIO_AUTH_MELTDOWN   },
  db_failover:     { name: "Database Failover Chaos",     script: SCENARIO_DB_FAILOVER     },
  cdn_outage:      { name: "CDN & Frontend Catastrophe",  script: SCENARIO_CDN_OUTAGE      },
  kafka_crisis:    { name: "Kafka Consumer Lag Crisis",   script: SCENARIO_KAFKA_CRISIS    },
};
