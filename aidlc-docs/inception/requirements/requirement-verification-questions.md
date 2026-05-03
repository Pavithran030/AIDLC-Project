# Requirements Verification Questions

Please answer the following questions by filling in the letter choice after each `[Answer]:` tag.
If none of the provided options match your needs, choose the last option (Other/X) and describe your preference.

---

## Question 1
What is the target deployment environment for this application?

A) Local development only (Docker Compose, no cloud)
B) AWS (ECS, RDS, ElastiCache, etc.)
C) Any cloud-agnostic containerized deployment (Docker + Kubernetes)
D) Self-hosted VPS / bare metal
X) Other (please describe after [Answer]: tag below)

[Answer]: if possible i will deploy this is free hosting like vercel or firebase

---

## Question 2
What is the expected scale / number of concurrent users at launch?

A) Small team / personal use (1–20 concurrent users)
B) Small-to-medium team (20–100 concurrent users)
C) Medium scale (100–1,000 concurrent users)
D) Large scale (1,000+ concurrent users, requires horizontal scaling design)
X) Other (please describe after [Answer]: tag below)

[Answer]: small team

---

## Question 3
Should the application support multiple workspaces / organizations (multi-tenancy), or is it a single shared workspace?

A) Single shared workspace — all users share the same global space
B) Multi-tenant — each organization/team has isolated boards and users
C) Not decided yet — design for single workspace but keep multi-tenancy in mind
X) Other (please describe after [Answer]: tag below)

[Answer]: Single shared workspace

---

## Question 4
What is the desired card assignment model?

A) A card can be assigned to exactly one user
B) A card can be assigned to multiple users
C) Assignment is optional and cards can be unassigned
D) Both B and C (multiple optional assignees)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
Should users be able to add comments or attachments to cards?

A) Yes — both comments and file attachments
B) Yes — comments only (no file attachments)
C) No — cards have title, description, assignee, and deadline only
D) Comments only in v1, attachments in a future version
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6
What is the deadline alert threshold? (How far in advance should the system alert users about approaching deadlines?)

A) 24 hours before deadline
B) 48 hours before deadline
C) 72 hours (3 days) before deadline
D) Configurable per board by the board owner
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 7
Should board membership / access control be enforced? (i.e., only board members can view/edit a board)

A) Yes — boards are private; only invited members or users with the join code can access
B) Yes — boards are private with role-based access (owner, editor, viewer)
C) No — all authenticated users can see all boards (open workspace model)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8
Should the application support email notifications (e.g., deadline reminders, card assignments) in addition to real-time in-app alerts?

A) Yes — email notifications are required
B) No — real-time in-app WebSocket alerts only
C) Nice to have but not required for v1
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9
What is the preferred token storage strategy on the frontend?

A) localStorage (simple, but vulnerable to XSS)
B) httpOnly cookies (more secure, requires CORS/cookie configuration)
C) In-memory only (most secure, but lost on page refresh — requires refresh token flow)
X) Other (please describe after [Answer]: tag below)

[Answer]: i dont know about this.go with yoour choice

---

## Question 10
Should the application support card labels / tags and priority levels?

A) Yes — both labels/tags and priority levels (Low, Medium, High, Critical)
B) Yes — priority levels only
C) Yes — labels/tags only
D) No — keep cards simple (title, description, assignee, deadline)
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 11: Security Extension
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 12: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips
C) No — skip all PBT rules (suitable for simple CRUD applications or thin integration layers)
X) Other (please describe after [Answer]: tag below)

[Answer]: i dont know about this

---
