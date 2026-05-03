# Unit of Work Story Map

## Unit 1: Backend — Feature Coverage

| Feature | Endpoints / Events |
|---|---|
| User Registration | POST /auth/register |
| User Login | POST /auth/login |
| User Logout | POST /auth/logout |
| Get Current User | GET /auth/me |
| Create Board | POST /boards |
| List User Boards | GET /boards |
| Get Board Detail | GET /boards/{id} |
| Join Board | POST /boards/join |
| Update Board Settings | PATCH /boards/{id} |
| Get Board Columns | GET /boards/{id}/columns |
| Create Column | POST /boards/{id}/columns |
| Update Column | PATCH /columns/{id} |
| Delete Column | DELETE /columns/{id} |
| Get Column Cards | GET /columns/{id}/cards |
| Create Card | POST /columns/{id}/cards |
| Update Card | PATCH /cards/{id} |
| Delete Card | DELETE /cards/{id} |
| Move Card | POST /cards/{id}/move |
| Get Board Activity | GET /boards/{id}/activity |
| Real-time: card_created | Socket.io emit |
| Real-time: card_updated | Socket.io emit |
| Real-time: card_moved | Socket.io emit |
| Real-time: card_deleted | Socket.io emit |
| Real-time: activity_created | Socket.io emit |
| Real-time: presence_updated | Socket.io emit |
| Real-time: deadline_alert | Socket.io emit (scheduler) |
| Email: card assigned | Background task |
| Email: deadline reminder | Scheduler job |

## Unit 2: Frontend — Feature Coverage

| Feature | Component / Page |
|---|---|
| Login UI | LoginPage |
| Register UI | RegisterPage |
| Board list + create + join | BoardListPage |
| Kanban board view | BoardPage + KanbanBoard |
| Column rendering | ColumnComponent |
| Card rendering + deadline glow | CardComponent |
| Card detail + edit + delete | CardDetailModal |
| Drag-and-drop cards | dnd-kit in KanbanBoard |
| Real-time card updates | SocketService → boardStore |
| Activity feed | ActivityFeedPanel |
| User presence | PresenceIndicator |
| Deadline alert toasts | DeadlineAlertToast |
| Cyberpunk theme | index.css + Tailwind config |
