# Component Dependencies

## Backend Dependency Graph

```
FastAPI App
  |
  +-- AuthRouter --> AuthService --> UserModel (DB)
  |
  +-- BoardRouter --> BoardService --> BoardModel, BoardMemberModel, ColumnModel (DB)
  |                                --> EmailService (on board join)
  |
  +-- ColumnRouter --> ColumnService --> ColumnModel (DB)
  |
  +-- CardRouter --> CardService --> CardModel (DB)
  |                              --> ActivityService (log action)
  |                              --> RealtimeComponent (broadcast event)
  |                              --> EmailService (on assignment)
  |
  +-- ActivityRouter --> ActivityService --> ActivityLogModel (DB)
  |
  +-- Socket.io Server --> PresenceComponent (in-memory dict)
  |                     --> RealtimeComponent (room management)
  |
  +-- APScheduler --> SchedulerService --> CardModel (DB query)
                                       --> RealtimeComponent (emit deadline_alert)
                                       --> EmailService (send reminder)
```

## Frontend Dependency Graph

```
App
  |
  +-- Router
       |
       +-- AuthPages --> authStore --> auth.api
       |
       +-- BoardListPage --> boardStore --> boards.api
       |
       +-- BoardPage
            |
            +-- SocketService --> boardStore, activityStore, presenceStore
            |
            +-- DndContext
            |    +-- ColumnComponent
            |         +-- CardComponent --> CardDetailModal --> cards.api
            |
            +-- ActivityFeedPanel --> activityStore
            |
            +-- PresenceIndicator --> presenceStore
            |
            +-- DeadlineAlertToast --> uiStore
```

## Key Integration Points

| Integration | Description |
|---|---|
| CardService → RealtimeComponent | After every card mutation, broadcast event to board room |
| CardService → ActivityService | After every card mutation, log activity entry |
| ActivityService → RealtimeComponent | After logging, broadcast activity_created event |
| SchedulerService → RealtimeComponent | Broadcast deadline_alert events |
| SchedulerService → EmailService | Send deadline reminder emails |
| CardService → EmailService | Send assignment emails when card.assigned_user_id changes |
| Frontend SocketService → Zustand Stores | All WebSocket events update stores directly |
