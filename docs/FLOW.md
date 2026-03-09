# Application Flow

## Launch

User opens the app.

System fetches:

* overdue manual tasks
* today's manual tasks
* generated fleet alerts

These are merged into the "My Day" list.

## Task Interaction

User taps a task.

Options:

* mark complete
* add note
* upload image
* upload document

## Completion

Manual task

tasks.completed = true

Fleet task

System updates the related fleet table.

Example:

Renew Truck License → update trucks table

The task disappears once the underlying data is updated.
