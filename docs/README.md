# Fleet Daily Planner

Fleet Daily Planner is a reactive task management system designed for fleet operations.

The application automatically generates daily tasks based on fleet compliance data and combines them with manually created tasks to produce a "My Day" dashboard.

The goal is to reduce operational risk by ensuring that expiring licenses, driver documents, and maintenance tasks are surfaced automatically.

## Key Features

* Reactive task generation from fleet data
* Manual task creation
* Daily dashboard ("My Day")
* Priority alerts for expiring documents
* Fleet compliance monitoring
* Image and document attachments
* Real-time updates using Convex

## Task Sources

Tasks come from two sources:

1. Manual Tasks
   Tasks created by the user and stored in the database.

2. Fleet Tasks
   Tasks generated dynamically from fleet data such as trucks, trailers, and drivers.

Fleet tasks are not permanently stored and disappear automatically when the underlying issue is resolved.

## Example Workflow

1. App opens to the **My Day** screen
2. Fleet alerts are generated automatically
3. User completes tasks
4. If the task relates to fleet compliance, the backend updates the relevant fleet record

## Intended Use

This system is designed for logistics coordinators managing trucks, trailers, and drivers.
