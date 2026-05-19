
# Health Connect
### Enterprise-Grade Secure Microservices Architecture, DevSecOps Pipeline & GitOps Continuous Delivery Platform

[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.28%2B-blue?logo=kubernetes&logoColor=white&color=326CE5)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker&logoColor=white&color=2496ED)](https://www.docker.com/)
[![GitLab CI](https://img.shields.io/badge/GitLab_CI-Self--Hosted_Runner-orange?logo=gitlab&logoColor=white&color=FCA121)](https://about.gitlab.com/)
[![ArgoCD](https://img.shields.io/badge/GitOps-ArgoCD-orange?logo=argo&logoColor=white&color=F3F4F6)](https://argoproj.github.io/cd/)
[![Trivy](https://img.shields.io/badge/Security-Trivy_Hardened-blueviolet?logo=aquasecurity&logoColor=white&color=00B4D8)](https://trivy.dev/)
[![SonarQube](https://img.shields.io/badge/Quality-SonarQube_Scanner-blue?logo=sonarqube&logoColor=white&color=4E9BCD)](https://www.sonarqube.org/)
---

## Executive Summary

**Health Connect** is a production-grade, highly secure, 8-service healthcare platform designed using a modern microservices architecture and deployed on an enterprise Kubernetes cluster. 

The project demonstrates the end-to-end implementation of a mature **DevSecOps** and **GitOps** lifecycle, featuring fully-automated pipelines with robust security scanning (Trivy, Gitleaks, SonarQube), strict container hardening matching the highest Kubernetes security standards, and declarative GitOps-driven deployment using ArgoCD.

---

## Platform Architecture & DevSecOps Flow

<img width="817" height="767" alt="Screenshot_11" src="https://github.com/user-attachments/assets/9e62352b-ccf0-4f9a-81c4-678bdce21db1" />



---

## Microservices & Databases Inventory

The platform is partitioned into highly specialized domain services and third-party databases, coordinated over a virtualized Kubernetes network.

| Component / Service | Language / Tech Stack | Exposed Port | Purpose & Integration |
| :--- | :--- | :--- | :--- |
| **patient-ui** | React / Nginx (Unprivileged) | `8080` (Internal) | Frontend User Portal serving patient actions and portal dashboard. |
| **api-gateway** | Node.js / Express | `8080` (Internal) | Serves as the single entry point, routing requests to appropriate backend services. |
| **auth-service** | Python 3.10 / FastAPI | `8001` (Internal) | Identity Provider handling user authentication, OAuth2, and JWT generation. |
| **records-service** | Go (Golang) | `8002` (Internal) | Core API handling encrypted patient health records and histories. |
| **appointment-service** | Go (Golang) | `8003` (Internal) | Handles scheduling, doctors lists, appointments bookings, and calendars. |
| **audit-service** | Python 3.10 / FastAPI | `8004` (Internal) | Audits all sensitive transactions and patient access records for HIPAA compliance. |
| **billing-service** | Node.js | `8005` (Internal) | Handles checkout, bills processing, and invoice generation. |
| **analytics-service** | Python 3.10 | Worker (No Port) | Background queue processor handling patient dashboard metrics and aggregation. |
| **postgres** | PostgreSQL 15 (Alpine) | `5432` | Relational database persistent store for auth, billing, and transactional data. |
| **redis** | Redis (Alpine) | `6379` | High-performance in-memory cache and session store. |
| **rabbitmq** | RabbitMQ 3 (Management) | `5672` / `15672` | Message broker driving asynchronous communication between billing and analytics. |

---

## Security Hardening & DevSecOps Gates

This project enforces the **Zero-Trust Security Model** across all deployment stages.

### 1. Static Security & Quality Gates
*   **Secret Leak Prevention (Gitleaks):** Automatically scans repository history for accidentally committed credentials, private keys, or API tokens.
*   **Static Application Security Testing (SonarQube):** Evaluates code coverage, checks for SQL Injection vulnerabilities, XSS threats, and enforces clean-code rules.
*   **Vulnerability Scanning (Trivy):** Performed at two levels:
    - **Repository FS Scan:** Scans the codebase, Kubernetes manifests, and configurations for misconfigurations.
    - **Image Vulnerability Scan:** Scans built container images against CVE databases before pushing to ECR.

### 2. Container Hardening (Kubernetes Security Contexts)
Every single service and database deployed to the cluster complies with **CIS Benchmarks** and strict **Kubernetes Security Policies**:
*   **Non-Root Execution (`runAsNonRoot: true`):** No processes are allowed to run as root.
*   **Strict Numeric UIDs:** To bypass Kubelet verification limitations, all images utilize strictly defined numeric user IDs:
    - Application Services: Node (`1000`), Python (`10001`), Nginx (`101`).
    - Database Services: Postgres (`70`), Redis & RabbitMQ (`999`) applied at both **Pod** and **Container** levels.
*   **Immutable File Systems (`readOnlyRootFilesystem: true`):** Container root filesystems are completely locked down. Write access is restricted to highly scoped virtual volumes (`emptyDir` mounts mapped to `/tmp`, `/var/run`, etc.) to prevent malicious modification.
*   **Privilege Restriction (`allowPrivilegeEscalation: false`):** Prevents child processes from gaining more privileges than their parent.
*   **Dropped Linux Capabilities (`capabilities.drop: ["ALL"]`):** Strips all kernel-level system permissions from the container execution context.

---

## Deployment & Continuous Delivery (GitOps)

Continuous Deployment is decoupled from the build pipeline using the **GitOps Declarative Pattern**:
1.  GitLab CI builds and pushes the hardened images to **AWS ECR**.
2.  **ArgoCD** continuously monitors the `k8s/` directory in our Git repository.
3.  Any commit updating the Kubernetes manifests triggers a declarative **automatic reconciliation loop**, where ArgoCD synchronizes the state of the cluster to match the repository.

### Ingress & Ingress Controller Configuration
The cluster uses an **Nginx Ingress Controller** to manage external access:
*   Incoming requests at `/` are routed to `patient-ui:8080`.
*   Incoming API calls at `/api` are routed to the central `api-gateway:8080`.

---

## Platform Visualization & Screenshots

Below are the running screenshots demonstrating the successfully deployed and monitored system:

### 1. Hardened Kubernetes Pods Status

<img width="1362" height="678" alt="Screenshot_8" src="https://github.com/user-attachments/assets/e045840b-5a57-46b8-8052-f175486c05b2" />

### 2. ArgoCD Active Synchronization

<img width="1364" height="683" alt="Screenshot_3" src="https://github.com/user-attachments/assets/cdcfab01-23b7-47d3-829d-439077ce3b4d" />


### 3. Grafana Observability Dashboard

<img width="1365" height="689" alt="Screenshot_7" src="https://github.com/user-attachments/assets/fc0e40aa-3d04-4caa-98cc-8e261b5b95f9" />


### 4. Secure Health Connect Portal UI

<img width="1361" height="686" alt="Screenshot_1" src="https://github.com/user-attachments/assets/aa779a89-d3d5-415e-8ee8-35308fd9e722" />


<img width="1360" height="688" alt="Screenshot_9" src="https://github.com/user-attachments/assets/146ede2c-4731-42b2-88c3-7e5f1981b16c" />


### 5. Gitlab Pipeline

<img width="1363" height="678" alt="Screenshot_5" src="https://github.com/user-attachments/assets/977c9af2-b654-4d32-b5cd-e81a721bcf29" />


### 6. SonarQube Quality Analysis

<img width="1365" height="767" alt="Screenshot_4" src="https://github.com/user-attachments/assets/4185c1a8-60d7-40fe-8fb3-41266a8aafd5" />

---

## Step-by-Step Installation & Verification

### Prerequisites
*   A running Kubernetes cluster (v1.28+)
*   AWS CLI and ECR permissions configured
*   Docker installed on the developer workstation

### 1. Apply Kubernetes Configs
Clone the repository and apply the declarative manifests:
```bash
# 1. Apply secure credentials and configurations
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# 2. Deploy hardened databases
kubectl apply -f k8s/databases.yaml

# 3. Deploy application microservices
kubectl apply -f k8s/patient-ui.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/records-service.yaml
kubectl apply -f k8s/appointment-service.yaml
kubectl apply -f k8s/audit-service.yaml
kubectl apply -f k8s/billing-service.yaml
kubectl apply -f k8s/analytics-service.yaml

# 4. Expose the platform via Ingress
kubectl apply -f k8s/ingress.yaml
```

### 2. Verify Deployment Status
Verify that all deployments and statefulsets are completely reconciled:
```bash
kubectl get pods -w
```
All pods must display `1/1 Running` and `0` restarts!

---

## 👤 Author & Portfolio
*   **Name:** Akas Ahirwar
*   **LinkedIn:** https://www.linkedin.com/in/akash-ahirwar02/
