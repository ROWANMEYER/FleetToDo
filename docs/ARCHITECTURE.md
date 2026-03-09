# System Architecture

The Daily Planner operates as a frontend application connected to the FleetCore backend.

FleetCore remains the single source of truth for all operational data.

## Architecture Layers

Frontend

* React / Expo interface
* Displays tasks
* Handles task interactions

Backend

* Convex database
* Task queries and mutations
* Fleet data storage

Data Sources

* drivers
* trucks
* trailers
* manual tasks

## Task Model

Two task types exist:

Manual Tasks
Stored in the database.

Fleet Tasks
Generated dynamically from fleet data.

Fleet tasks are never permanently stored.

## Data Flow

FleetCore Tables → Task Generator → My Day Query → UI Display

When a fleet task is completed, the corresponding fleet record is updated.

Example:

Complete "Renew Truck License"

Update:
truck.licenseExpiryDate
