```
Can you create a list of tasks to implement the technical requirements from @Documents/Requirements.md that and intermediate developer would be comfortable with? Put those tasks in a Tasks.md file.
```

```
Go ahead and complete the first task from @Task.md
```

```
Can you first create a .gitignore for the tech stacks being used and initialize a git repository in this directory? Also set the origin to - git@github.com:codebangkok/welltrack.git
```

```
Create an initial commit.
```

```
Can you please implement the next task - task 2 from @Tasks.md ? Also from now on can you create new branches and pull requests for each task?
```

```
Can you complete the rest of the 1.1 Project Initialization tasks? And then can you create unit and integration tests for the: code we've written so far? 
```

```
/init
```

```
## Git Workflow
When completing tasks from TASKS.md:
1. Create a new branch named `feature/<task-number>-<brief-description>` before starting work
2. Make atomic commits with conventional commit messages:
   - feat: for new features
   - fix: for bug fixes
   - docs: for documentation
   - test: for tests
   - refactor: for refactoring
3. After completing a task, create a pull request with:
   - A descriptive title matching the task
   - A summary of changes made
   - Any testing notes or considerations
4. Update the task checkbox in TASKS.md to mark it complete
```

```
Complete task 1.2 Database Schema from @Task.md
```

```
## Testing Requirements
Before marking any task as complete:
1. Write unit tests for new functionality
2. Run the full test suite with: `npm test`
3. If tests fail:
 - Analyze the failure output
 - Fix the code (no the tests, unless tests are incorrect)
 - Re-run tests until all pass
4. For API endpoints, include integration tests that verify:
 - Success responses with valid input
 - Authentication requirements
 - Edge cases
## Test Commands
- Backend tests: `cd backend && npm test`
- Frontend tests: `cd frontend && npm test`
- Run specific test file: `npm test -- path/to/test.ts`
- Run test matching pattern: `npm test -- --grep "pattern"`
```

```
implement the POST /api/auth/register endpoint from task 1.3 Make sure all test pass before making it complete. 
```

```
Can you completed task Phase 1 from @Tasks.md 
```