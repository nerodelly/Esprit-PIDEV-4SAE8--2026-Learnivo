# Learnivo Platform — Professor Demo Scenario

## Prerequisites (start these before the demo)
```bash
docker compose up -d
```
Wait ~60 seconds for all services to be healthy.

---

## 1. Architecture Overview (2 min)

Open a browser and show the running infrastructure:

| Service | URL | What to show |
|---|---|---|
| Eureka (Service Registry) | http://localhost:8761 | All 9 microservices registered as UP |
| API Gateway | http://localhost:8082 | Entry point for all requests |
| Frontend | http://localhost:4200 | The Angular application |
| RabbitMQ Management | http://localhost:15672 (guest/guest) | Message queues for claims notifications |

**Say:** "We have a microservices architecture with 9 Spring Boot services, 1 Node.js service rewritten to Spring Boot, all registered in Eureka and routed through a single API Gateway."

---

## 2. Frontend — Live Application (3 min)

Open **http://localhost:4200**

### Show the main features:
- **Courses page** → courses loaded from `course-service` via gateway
- **Competitions page** → loaded from `competition-service`
- **Clubs & Events** → loaded from `club-event-service`
- **Claims page** → submit a new claim:
  1. Fill in subject: `"My course video is not loading"`
  2. Fill in description: `"I have been trying to access module 3 for 2 days and the video keeps buffering"`
  3. Click Submit
  4. Show the success message and the claim appearing in the list with AI-assigned priority and category

**Say:** "The claims service uses AI analysis to automatically detect sentiment, predict category, assign priority, and generate a draft response for the support agent."

---

## 3. Claims Service — AI Features (3 min)

Open **http://localhost:4200/claims** (or the admin claims panel)

Show:
- A submitted claim with **AI Suggestion** visible (priority, sentiment, draft response)
- The **status workflow**: CREATED → IN_PROGRESS → RESOLVED → CLOSED
- Change a claim status from CREATED to IN_PROGRESS

Then open **RabbitMQ** at http://localhost:15672:
- Go to **Queues** tab
- Show `claims.notifications.agent` and `claims.notifications.user` queues
- **Say:** "When a claim is created, an event is published to RabbitMQ. The agent gets a real-time notification via Server-Sent Events, and when the status changes, the student is notified."

---

## 4. CI/CD Pipeline — Jenkins (4 min)

Open **http://localhost:8081** (admin / admin)

1. Click on **learnivo-pipeline**
2. Show the last successful build (#22) — click on it
3. Walk through the stages:
   - **Checkout** — pulls from GitHub `mouhamedwork` branch
   - **CI: claims & user** — runs dedicated CI sub-jobs
   - **Maven Build** — compiles user-service and claims-service
   - **Unit Tests** — 62 tests, 0 failures
   - **SonarQube Analysis** — code quality scan
   - **Build Docker Images** — builds 3 images, pushes to local registry
   - **Deploy to Kubernetes** — skipped (no cluster configured yet)

4. Click **Build Now** to trigger a live build
5. Watch the pipeline run in real time (Blue Ocean view if available)

**Say:** "Every push to the repository automatically triggers this pipeline via GitHub webhook. The pipeline builds, tests, analyzes code quality, and pushes Docker images to our local registry."

---

## 5. Code Quality — SonarQube (2 min)

Open **http://localhost:9000** (admin / learnivo123)

Click on **Projects** — show:
- **Learnivo - User Service** → bugs, vulnerabilities, code smells, coverage
- **Learnivo - Claims Service** → same metrics

**Say:** "SonarQube is integrated into the Jenkins pipeline. Every build triggers a static code analysis. We can see code quality metrics, security vulnerabilities, and technical debt."

---

## 6. Monitoring — Prometheus + Grafana (3 min)

### Prometheus Targets
Open **http://localhost:9091/targets**

Show:
- `user-service` → **UP** (green)
- `claims-service` → **UP** (green)
- `prometheus` → **UP** (green)

**Say:** "Prometheus scrapes metrics from our services every 15 seconds via the `/actuator/prometheus` endpoint."

### Grafana Dashboards
Open **http://localhost:3000** (admin / learnivo123)

Go to **Dashboards** → **JVM Micrometer**:
- Select `user-service` or `claims-service` from the instance dropdown
- Show:
  - **Heap Memory Used** — live JVM memory usage
  - **GC Pause Duration** — garbage collection activity
  - **HTTP Server Requests** — request rate and response times
  - **CPU Usage** — process CPU

**Say:** "Grafana visualizes the Prometheus metrics in real time. We can monitor JVM health, request throughput, and system resources for each microservice."

---

## 7. Local Docker Registry (1 min)

Open **http://localhost:5000/v2/_catalog**

Show the JSON response listing all built images:
```json
{"repositories":["claims-service","frontend","user-service"]}
```

**Say:** "Instead of pushing to Docker Hub or GitHub Container Registry, we use a local registry. The Jenkins pipeline builds and pushes images here, and docker-compose pulls from it for deployment."

---

## 8. GitHub — Source Control & Workflows (1 min)

Open **https://github.com/nerodelly/Esprit-PIDEV-4SAE8--2026-Learnivo/tree/mouhamedwork**

Show:
- `.github/workflows/` — GitHub Actions CI/CD workflows (backup pipeline)
- `Jenkinsfile` — the Jenkins pipeline definition
- `k8s/` — Kubernetes manifests ready for when the cluster is set up
- `monitoring/` — Prometheus and Grafana configuration

---

## Summary Table

| Component | Technology | Status | URL |
|---|---|---|---|
| Frontend | Angular 21 | ✅ Running | http://localhost:4200 |
| API Gateway | Spring Cloud Gateway | ✅ Running | http://localhost:8082 |
| Service Registry | Netflix Eureka | ✅ Running | http://localhost:8761 |
| Claims Service | Spring Boot 3 | ✅ Running | via gateway |
| User Service | Spring Boot 3 | ✅ Running | via gateway |
| Message Broker | RabbitMQ | ✅ Running | http://localhost:15672 |
| CI/CD | Jenkins | ✅ Running | http://localhost:8081 |
| Code Quality | SonarQube | ✅ Running | http://localhost:9000 |
| Metrics | Prometheus | ✅ Running | http://localhost:9091 |
| Dashboards | Grafana | ✅ Running | http://localhost:3000 |
| Image Registry | Docker Registry | ✅ Running | http://localhost:5000 |
| Kubernetes | kubeadm | ⏳ Pending cluster setup | — |

---

## Credentials Quick Reference

| Service | Username | Password |
|---|---|---|
| Jenkins | admin | admin |
| SonarQube | admin | learnivo123 |
| Grafana | admin | learnivo123 |
| RabbitMQ | guest | guest |
