# Task System

The task system combines manual tasks with automatically generated fleet alerts.

Manual tasks are created by the user.

Fleet tasks are generated dynamically by checking fleet records.

Example fleet checks:

Driver PrDP expiry
Truck license expiry
Trailer license expiry
Missing documents

Fleet tasks contain a reference to the affected record.

Example

referenceType: truck
referenceId: V117

When the task is completed, the corresponding fleet record is updated.
