# WP-009: Task CRUD API Tests

> **Assigned to**: tester
> **Priority**: 4 (test after WP-003 is implemented)

---

## Description

Write integration tests for the task CRUD API endpoints including hierarchy enforcement, status cascade logic, and per-field error responses.

---

## Test Cases

### Create Task — POST /api/tasks

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Create task with title only | 201, status=TODO, creator_id from session |
| 2 | Create task with all fields | 201, all fields saved correctly |
| 3 | Create task without title | 400, `{ "errors": { "title": "..." } }` |
| 4 | Create task with whitespace-only title | 400, `{ "errors": { "title": "..." } }` |
| 5 | Create task with title > 255 chars | 400, `{ "errors": { "title": "..." } }` |
| 6 | Create task without authentication | 401, `{ "errors": { "auth": "..." } }` |
| 7 | Create subtask (valid parent_id) | 201, parent_id set |
| 8 | Create subtask of a subtask | 422, `{ "errors": { "parent_id": "..." } }` |
| 9 | Create task with non-existent parent_id | 404, `{ "errors": { "parent_id": "..." } }` |
| 10 | Create task with non-existent assignee_id | 404, `{ "errors": { "assignee_id": "..." } }` |
| 11 | Verify status cannot be set on creation | Status is always TODO regardless of input |
| 12 | Create task with past due_date | 201, accepted (past dates allowed) |
| 13 | Title is trimmed | Leading/trailing whitespace removed |

### List Tasks — GET /api/tasks

| # | Test case | Expected |
|---|-----------|----------|
| 1 | List all tasks (no filters) | 200, returns all tasks with subtask_count |
| 2 | Filter by status=TODO | Only TODO tasks returned |
| 3 | Filter by assignee_id | Only tasks assigned to that user |
| 4 | Filter by due=overdue | Tasks with due_date < today and status ≠ DONE |
| 5 | Filter by due=today | Tasks with due_date = today |
| 6 | Filter by due=this_week | Tasks with due_date within current week |
| 7 | Filter by due=none | Tasks with no due_date |
| 8 | Search by title substring | Case-insensitive ILIKE match |
| 9 | Combine status + assignee filters | AND logic, both filters apply |
| 10 | Filter parent_id=null | Only top-level tasks |
| 11 | List without authentication | 401 |
| 12 | Empty result | 200, empty array |
| 13 | Verify subtask_count is correct | Count matches actual subtask count |
| 14 | Verify assignee object is included | `{ id, name, email }` embedded |
| 15 | Verify ordering is created_at desc | Most recent first |

### Get Task — GET /api/tasks/:id

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Get existing task | 200, full task object |
| 2 | Get task with subtasks | 200, includes subtasks array with assignee |
| 3 | Get task without subtasks | 200, subtasks is empty array |
| 4 | Get subtask | 200, includes parent object `{ id, title }` |
| 5 | Get non-existent task | 404 |
| 6 | Get without authentication | 401 |
| 7 | Verify assignee and creator objects | Both included with id, name, email |

### Update Task — PATCH /api/tasks/:id

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Update title | 200, title changed, other fields unchanged |
| 2 | Update status TODO → IN_PROGRESS | 200, status changed |
| 3 | Update status IN_PROGRESS → TODO | 200, free backward transition |
| 4 | Update status DONE → IN_PROGRESS | 200, subtasks NOT affected (no reverse cascade) |
| 5 | Update status to DONE on parent with subtasks | 200, all subtasks also set to DONE |
| 6 | Update assignee_id | 200, assignee changed |
| 7 | Unassign (set assignee_id to null) | 200, assignee_id is null |
| 8 | Update due_date | 200, due_date changed |
| 9 | Change parent_id (move task to different parent) | 200, parent_id changed |
| 10 | Set parent_id on a task that has subtasks | 422, cannot make parent into subtask |
| 11 | Set parent_id to a subtask | 422, nesting depth violation |
| 12 | Set parent_id to self | 422, cannot be own parent |
| 13 | Update non-existent task | 404 |
| 14 | Update without authentication | 401 |
| 15 | Verify updated_at changes | updated_at is refreshed |
| 16 | Send empty body | 200, no fields changed |

### Delete Task — DELETE /api/tasks/:id

| # | Test case | Expected |
|---|-----------|----------|
| 1 | Delete task without subtasks | 200, task removed from DB |
| 2 | Delete parent task | 200, parent and all subtasks removed |
| 3 | Delete non-existent task | 404 |
| 4 | Delete without authentication | 401 |
| 5 | Delete subtask | 200, subtask removed, parent unaffected |

---

## Context

- Tests should run against a real PostgreSQL test database.
- Create test users before running task tests.
- Clean up test data between test runs.
- Use Vitest with Next.js test helpers.
- Verify per-field error format: `{ "errors": { "field": "message" } }`.

---

## Acceptance Criteria

- [ ] All create task test cases pass (including whitespace, trim, past dates)
- [ ] All list/filter task test cases pass (including subtask_count, assignee object)
- [ ] All get task test cases pass (including parent object for subtasks)
- [ ] All update task test cases pass (including free status transitions, cascade)
- [ ] All delete task test cases pass (including subtask-only delete)
- [ ] All error responses use per-field format
- [ ] No test data leaks between test runs
