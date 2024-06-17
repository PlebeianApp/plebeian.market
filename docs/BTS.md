#pm 
**Overview**
The task management system is designed to handle long-running processes, tasks, and jobs in a scalable and efficient manner. The system consists of a SQLite database, a Node.js application using SvelteKit, the Croner library for task scheduling, and a Background Task Service (BTS) for executing jobs.

**Components**

### SQLite Database

* The SQLite database stores task instances in the `tasks` table.
* Each task instance represents a long-running process, task, or job that needs to be executed.
* The `tasks` table has the following columns:
	+ `id` (primary key): unique identifier for each task instance.
	+ `type`: type of task (e.g., email, order processing, content summarization).
	+ `status`: current status of the task (e.g., pending, in_progress, completed, failed).
	+ `scheduled_at`: timestamp for when the task should be executed.
	+ `retry_count`: number of times the task has been retried.
	+ `max_retries`: maximum number of times the task can be retried.
	+ `created_at`: timestamp for when the task was created.
	+ `updated_at`: timestamp for when the task was last updated.

### Platform Application

* The Platform app is a Node.js application built using SvelteKit.
* The application is responsible for creating and scheduling tasks.
* The application places new tasks in the db with the status `pending`.

### Croner Library

* Croner is a JavaScript library for scheduling tasks using cron syntax. [Croner](https://croner.56k.guru/)
* Croner provides an in-memory task queue, which reduces the load on the database and improves overall system performance.
* Croner also provides built-in error handling and overrun protection.
* For example, a task can be scheduled to run every 5 minutes using the cron syntax `*/5 * * * *`.

### Background Task Service (BTS)

* The BTS is a separate Node.js app that executes jobs in the background, without affecting the performance of the platform.
* The BTS queries for job requests from the SQLite database and executes them.
* The BTS updates the task status in the SQLite database based on the execution result (e.g., completed, failed).
* The BTS uses a heartbeat mechanism that runs in a periodic interval of time, and ensures an efficient task execution, also it can handle some priority of tasks logic and control the amount of concurrent tasks.

**Architecture Diagram**
```
          +---------------+
          |  Platform App  |
          +---------------+
                  |
                  | (Create and schedule tasks)
                  v
          +---------------+
          |  Database     |
          |  (tasks table)|
          +---------------+
                  |
                  | (Store and retrieve task data)
                  v
          +---------------+
          |  BTS          |
          |(Job execution,|
          | heartbeat, and|
          | task updates) |
          +---------------+
```
**Task Flow**

1. **Task Creation**: A new task instance is created and inserted into the `tasks` table in the SQLite database.
2. **Heartbeat Mechanism**: A fixed Croner job runs at a fixed interval (e.g., every 1 minute). The heartbeat job queries the `tasks` table for tasks that are ready to be executed (e.g., tasks with a `pending` status and a `scheduled_at` time that is earlier than or equal to the current time) to schedule tasks. 
3. **Task Scheduling**: The task instance is added to Croner as a scheduled job, using the `Cron` function.
5. **Job Execution**: The BTS executes the jobs. If a task fails, it will be retried up to the maximum number of retries specified in the `max_retries` column.
6. **Task Update**: The BTS updates the task status in the SQLite database based on the execution result (e.g., completed, failed).

**Benefits**

* **Scalability**: The system can handle a large volume of tasks and jobs without affecting performance.
* **Efficiency**: The in-memory task queue and Croner's built-in error handling reduce the load on the database and improve overall system performance.
* **Flexibility**: The system can be easily extended to handle different types of tasks and jobs.
* **Non-Blocking**: The BTS executes jobs in the background, without blocking the main thread or affecting the performance of the platform.

**Best Practices**

* **Task Creation**: Tasks should be created with a unique `id` and a specific `type` to ensure proper execution and tracking.
* **Task Scheduling**: Tasks should be scheduled using Croner's cron syntax to ensure accurate execution timing.
* **Error Handling**: Tasks should be designed to handle errors and exceptions properly, using Croner's built-in error handling mechanisms.
* **BTS Configuration**: The BTS should be configured to handle a reasonable number of concurrent jobs, to prevent overload and ensure efficient execution.
* **Task Retries**: Tasks should be designed to handle retries properly, with a reasonable maximum number of retries to prevent infinite loops.
* **Task Prioritization**: Tasks should be prioritized based on their importance and urgency, to ensure that critical tasks are executed promptly.
