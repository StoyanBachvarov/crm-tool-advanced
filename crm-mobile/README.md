# CRM Tool: Building a Full-Stack App – Workshop

## Project Assignment

# Using AI-assisted development implement and deploy a fully functional multi-platform full-stack software system:
-- Back-end: TypeScript + Next.js + Drizzle ORM + PostgreSQL
-- Front-end: TypeScript + Next.js + React + Tailwind
Mobile app: React Native + Expo
-- Project Description: CRM Tool
-- Build a CRM Tool app: a software product for sales teams to plan, organize, execute, and track their daily work with customers.
-- The CRM tool manages customers, customer contacts, sales activities, visits, phone calls, projects / opportunities, offers / quotes, sales records, and sales team responsibilities.
-- Customers are assigned to sales representatives. Sales representatives report to sales managers. Sales managers can supervise the customer portfolio, activities, opportunities, offers, and sales records of the sales representatives assigned to them.
Sales representatives visit customers and, after each activity, can write the activity outcome, create a project / opportunity, create an offer, register a sales record, schedule a follow-up activity, or create a new customer.
The system should support both a full-featured Web app and a scope-limited mobile app for field sales usage.


## Roles in the App

# Visitor
-- A visitor is an anonymous actor who visits the CRM Web site.
-- Visitors can:
-- View the public home page
-- Register in the app using email + password
-- Visitors cannot access CRM data until they have a registered user account and an assigned sales role.

# Sales Rep / User
-- A sales rep is a registered user who works directly with customers.
-- Sales reps can:
-- Login and logout
-- View their own dashboard
-- View customers assigned to them
-- Create new customers
-- Manage customers owned or assigned to them
-- Create customer activities:
-- Visit
-- Phone call
-- Meeting
-- Email follow-up
-- Other task
-- Write activity outcomes
-- Create projects / opportunities for customers
-- Create offers / quotes related to opportunities
-- Register sales records
-- Schedule follow-up activities
-- Add notes to customers, activities, opportunities, and offers
-- When a sales rep creates a new customer, that sales rep becomes the owner / assigned sales rep for the customer.
-- Sales reps can see all existing customers only if this is explicitly allowed by the business rules. By default, a sales rep should manage only customers assigned to them.

# Customer
-- A customer is a company or organization managed by the CRM system.
-- Customers should hold:
-- Company name
-- Industry sector
-- Customer status
-- Delivery address
-- Administrative address
-- Communication address
-- Main contact name
-- Contact position
-- Contact phone
-- Contact email
-- Additional notes
-- Assigned sales rep
-- Created date
-- Last activity date
-- Customers can have:
-- Multiple activities
-- Multiple projects / opportunities
-- Multiple offers / quotes
-- Multiple sales records
-- Multiple notes

# Sales Manager
-- A sales manager is a registered user responsible for one or more sales reps.
-- Sales managers can:
-- View all customers assigned to their sales reps
-- Manage customers assigned to their sales reps
-- View, create, edit, or delete activities for their sales reps
-- View and manage projects / opportunities for their team
-- View and manage offers / quotes for their team
-- View and manage sales records for their team
-- Monitor sales pipeline and performance
-- Review activity outcomes
-- Assign or reassign customers to sales reps
-- Sales managers should not automatically manage the entire system unless they also have an admin role.

-- Admins Optional
-- Admins can view and manage the entire CRM system.
-- Admins can:
-- Manage all users
-- Manage all sales reps and sales managers
-- Manage customer ownership and assignments
-- View and manage all customers
-- View and manage all activities
-- View and manage all opportunities
-- View and manage all offers
-- View and manage all sales records
-- Configure system-level data if needed
-- The admin role is optional and can be implemented as advanced functionality.

# Visitors
-- Visitors are anonymous actors who visit the app Web site.
-- Visitors can see:
-- Public home page
-- Login page
-- Register page
-- Visitors can register using email and password.
-- After registration, the user should have a basic account but should not access CRM data until the account is approved or assigned a role.
-- Implementation note: for the scope of the workshop, newly registered users may become sales reps automatically if this simplifies development. In a more production-like implementation, an admin or sales manager should approve or assign users.

-- Registered Sales reps
-- Registered sales reps have a profile with:
-- Name
-- Email
-- Password hash
-- Optional photo URL
-- Role
-- Assigned manager
-- Registered sales reps can:
-- Login and logout
-- View their dashboard
-- Create customers
-- View assigned customers
-- Manage their own customers
-- Create customer activities
-- Write activity outcomes
-- Create opportunities
-- Create offers
-- Register sales
-- When a sales rep creates a new customer, the sales rep becomes the customer owner.
-- Sales reps can browse their own CRM data through the Web app and through the mobile app.

# Sales Managers
-- Sales managers manage the work of sales reps assigned to them.
-- Sales managers can:
-- View sales reps assigned to them
-- View customers assigned to their sales reps
-- Create / edit / delete customer records for their team
-- Create / edit / cancel / delete customer activities for their team
-- Review activity outcomes
-- Manage projects / opportunities
-- Manage offers / quotes
-- Register or review sales records
-- Monitor customer activity and pipeline status
-- Sales managers can assign customers to sales reps.
-- Sales managers can reassign customers from one sales rep to another within their team.
-- Sales managers can create follow-up tasks for their sales reps.

# Customer Management
-- Sales reps and sales managers can manage customers according to their permissions.
-- Customers should be displayed with:
-- Company name
-- Industry sector
-- Assigned sales rep
-- Main contact person
-- Phone
-- Email
-- Last activity date
-- Customer status
-- Customer status examples:
-- Lead
-- Prospect
-- Active customer
-- Inactive customer
-- Lost customer
-- Users can create, edit, view, and archive customers.
-- Deleting customers should be restricted or avoided when the customer already has activities, offers, or sales records. In such cases, archiving is preferable.

# Activities and Follow-ups
-- Activities represent sales work performed or planned for a customer.
-- Activity types:
-- Visit
-- Phone call
-- Meeting
-- Email
-- Follow-up task
-- Demo
-- Other
-- Activity states:
-- Upcoming
-- Current
-- Completed
-- Cancelled
-- Activity fields:
-- Customer
-- Assigned sales rep
-- Type
-- Title
-- Description
-- Start date and time
-- End date and time optional
-- Status
-- Outcome
-- Next action
-- Created date
-- An activity is upcoming if its start time has not yet been reached.
-- An activity is current if its start time has been reached and the activity is not completed or cancelled.
-- An activity is completed when the sales rep records the activity outcome.
-- An activity is cancelled when the user cancels it.
-- Sales reps can write an outcome after a visit, phone call, or meeting.
-- After writing an outcome, the user can optionally:
-- Create a new opportunity
-- Create an offer
-- Register a sale
-- Schedule a follow-up activity
-- Add a customer note

# Projects / Opportunities
-- A project / opportunity represents a potential sale.
-- Opportunities belong to customers.
-- Opportunity fields:
-- Customer
-- Assigned sales rep
-- Title
-- Description
-- Estimated value
-- Probability
-- Stage
-- Expected close date
-- Status
-- Created date
-- Updated date
-- Opportunity stages:
-- New
-- Qualified
-- Proposal needed
-- Offer sent
-- Negotiation
-- Won
-- Lost
-- Opportunity statuses:
-- Open
-- Won
-- Lost
-- Cancelled
-- Sales reps can create opportunities from customer details or from an activity outcome.
-- Sales managers can review and manage opportunities for their team.

-- Offers / Quotes
-- An offer / quote represents a commercial proposal sent to a customer.
-- Offers usually belong to an opportunity, but for a simpler implementation they may belong directly to a customer.
-- Offer fields:
-- Customer
-- Opportunity optional
-- Created by
-- Offer number
-- Title
-- Amount
-- Currency
-- Status
-- Valid until date
-- Notes
-- Created date
-- Offer statuses:
-- Draft
-- Sent
-- Accepted
-- Rejected
-- Expired
-- Cancelled
-- Sales reps can create offers.
-- Sales reps can update offer status.
-- When an offer is accepted, the user can register a related sales record.

# Sales Records
-- A sales record represents a completed sale.
-- Sales record fields:
-- Customer
-- Opportunity optional
-- Offer optional
-- Sales rep
-- Amount
-- Currency
-- Sale date
-- Notes
-- Created date
-- Sales records are used for revenue tracking and reporting.
-- Sales managers can view sales records for their sales reps.
-- Admins can view all sales records.

-- Notes and Comments
-- Users can add notes to:
-- Customers
-- Activities
-- Opportunities
-- Offers
-- Sales records
-- Notes should include:
-- Owner user
-- Text
-- Created date
-- Updated date
-- Notes can be edited or deleted by their owner.
Sales managers can edit or delete notes for their team if this is allowed by the business rules.

# Web App and Mobile App
-- Web App
-- The Web app is the primary app for this project.
-- It implements the entire CRM functionality:
-- Users
-- Authentication
-- Sales rep dashboard
-- Sales manager dashboard
-- Customer management
-- Activity management
-- Opportunities
-- Offers
-- Sales records
-- Notes
-- Reporting optional
-- The Web app should be optimized for desktop and mobile browsers.

# Mobile App
-- The mobile app is an additional scope-limited app focused on the most important field-sales functionality.
-- The mobile app implements:
-- Login / logout
-- View assigned customers
-- View upcoming activities
-- View customer details
-- Create activity outcome
-- Create follow-up activity
-- Basic opportunity view
-- Basic offer and sales view optional
-- The mobile app should be simple, fast, and practical for sales reps while visiting customers.

## Project Requirements

# These are the capstone project requirements, which all students should follow.

# Technologies

# Backend: Implement a back-end API with Next.js + PostgreSQL.

# Database: Neon serverless PostgreSQL + Drizzle ORM.

# Frontend: Implement a front-end Web app in Next.js + React + TypeScript + Tailwind.

# Mobile app: Implement a client mobile app with React Native + Expo.

# Deployment: serverless deployment at Netlify.

# Architecture
-- Use a client-server architecture:
React frontend with Next.js backend, communicating via Server Actions.
-- React Native (Expo) mobile client with Next.js backend, communicating via RESTful API.
-- Structure your app in a Node.js monorepo: Next.js Web app + Expo mobile app.
-- The Next.js app will hold your back-end APIs + Web client app.
-- The Expo app will hold your React Native mobile app.
-- Structure the app business logic in a service layer, consumed by the Server Actions and the RESTful API.
-- Use modular design: split the app into self-contained components (e.g. UI pages, UI components, services, route handlers, utils) to improve project maintenance. 
-- When reasonable, use separate files for the UI, business logic, and other app assets. 
-- Avoid big and complex monolith code.
-- Define an AGENTS.md file containing agent instructions, architectural guidelines, technology standards, and project-wide conventions for the AI dev agents.

# User Interface (UI)
-- Implement modern and user-friendly UI design.
-- Implement responsive design for desktop and mobile browsers.
-- Split the UI into components and sub-components. Avoid complex large components.
-- Use icons, effects and visual cues to enhance user experience and make the app more intuitive.
-- Use server-side components in Next.js, unless a browser interaction is needed.

# Backend
-- Use Neon DB as a database to keep app data.
-- Use Drizzle ORM to manage schema migrations and Drizzle APIs to access DB data.
-- Implement the app's business logic as services (a service layer), which access the DB with Drizzle.
-- Implement a RESTful API for the mobile app and Server Actions for the Web app, which use the services.
-- Implement server-side paging to prevent performance degradation or UI freezing for large datasets.
-- Use external object storage service (is needed) to upload photos and files, e.g. Cloudflare R2.

# Authentication and Authorization
-- Use bcrypt, argon2 or other secure password hashing algorithm to store passwords in the DB.
-- Use JWT tokens to implement user sessions. Use cookies for the Web app and "Bearer" auth header in the RESTful API. 
-- Use a random JWT_SECRET key to sign JWT tokens.

# Database
-- Use best practices to design the PostgreSQL DB schema (normalization, relationships, indexing).
-- When changing the DB schema, always use Drizzle Kit migrations.
-- Seed enough sample data in all major tables, to ensure performance.

# Deployment
-- Your Web project should be deployed live on the Internet.
-- Serverless deployment on a managed platform (like Netlify) with serverless database (like Neon).
-- Provide sample credentials (e.g. demo / demo123) to simplify testing your app.
-- First deploy the Next.js project and get its exposed RESTful API endpoints URL.
-- Next, deploy the Expo project (as Web export).
-- Optionally, build Android APK binary and publish it in your GitHub Repo 🡪 Releases.

# GitHub Repo
-- Use a GitHub repo to hold your project assets.
-- Commit and push each successful change during the development.
# Documentation
-- Generate a project documentation in your GitHub repository.
-- Project description: describe briefly your project (what it does, who can do what, etc.).
-- Architecture: front-end, back-end, technologies used, database, etc.
-- Database schema design: visualize the main DB tables and their relationships.
-- Local development setup guide.
-- Key folders and files and their purpose.
