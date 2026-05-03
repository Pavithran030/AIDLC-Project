# Component Methods

## Backend Service Methods

### AuthService
```python
async def register_user(email: str, password: str, display_name: str) -> UserSchema
async def login_user(email: str, password: str) -> UserSchema  # sets httpOnly cookie
async def logout_user(response: Response) -> None
async def get_current_user(token: str) -> UserSchema  # FastAPI dependency
```

### BoardService
```python
async def create_board(name: str, owner_id: UUID) -> BoardSchema  # creates default columns
async def get_user_boards(user_id: UUID) -> list[BoardSchema]
async def get_board(board_id: UUID, user_id: UUID) -> BoardSchema  # enforces membership
async def join_board(join_code: str, user_id: UUID) -> BoardSchema
async def update_board(board_id: UUID, user_id: UUID, data: BoardUpdateSchema) -> BoardSchema
```

### ColumnService
```python
async def get_board_columns(board_id: UUID, user_id: UUID) -> list[ColumnSchema]
async def create_column(board_id: UUID, name: str, user_id: UUID) -> ColumnSchema
async def update_column(column_id: UUID, name: str, user_id: UUID) -> ColumnSchema
async def delete_column(column_id: UUID, user_id: UUID) -> None
```

### CardService
```python
async def get_column_cards(column_id: UUID, user_id: UUID) -> list[CardSchema]
async def create_card(column_id: UUID, data: CardCreateSchema, user_id: UUID) -> CardSchema
async def update_card(card_id: UUID, data: CardUpdateSchema, user_id: UUID) -> CardSchema
async def delete_card(card_id: UUID, user_id: UUID) -> None
async def move_card(card_id: UUID, target_column_id: UUID, new_position: int, user_id: UUID) -> CardSchema
```

### ActivityService
```python
async def log_activity(board_id: UUID, user_id: UUID, action_type: str, card_id: UUID | None, column_id: UUID | None, details: dict) -> ActivitySchema
async def get_board_activity(board_id: UUID, user_id: UUID, limit: int = 50) -> list[ActivitySchema]
```

### SchedulerService
```python
async def check_deadlines() -> None  # runs every 15 minutes
```

### EmailService
```python
async def send_assignment_email(to_email: str, card_title: str, board_name: str, assigner_name: str) -> None
async def send_deadline_reminder_email(to_email: str, card_title: str, board_name: str, deadline: datetime) -> None
```

---

## Frontend API Functions (Axios)

### auth.api.ts
```typescript
register(email: string, password: string, displayName: string): Promise<User>
login(email: string, password: string): Promise<User>
logout(): Promise<void>
getMe(): Promise<User>
```

### boards.api.ts
```typescript
getBoards(): Promise<Board[]>
createBoard(name: string): Promise<Board>
joinBoard(joinCode: string): Promise<Board>
getBoard(boardId: string): Promise<BoardDetail>
updateBoard(boardId: string, data: Partial<Board>): Promise<Board>
```

### columns.api.ts
```typescript
getBoardColumns(boardId: string): Promise<Column[]>
createColumn(boardId: string, name: string): Promise<Column>
updateColumn(columnId: string, name: string): Promise<Column>
deleteColumn(columnId: string): Promise<void>
```

### cards.api.ts
```typescript
createCard(columnId: string, data: CreateCardData): Promise<Card>
updateCard(cardId: string, data: UpdateCardData): Promise<Card>
deleteCard(cardId: string): Promise<void>
moveCard(cardId: string, targetColumnId: string, newPosition: number): Promise<Card>
```

### activity.api.ts
```typescript
getBoardActivity(boardId: string): Promise<ActivityEntry[]>
```
