## KWIK HELP

[![Build Status](https://travis-ci.org/oahray/kwik-help.svg?branch=develop)](https://travis-ci.org/oahray/kwik-help)
[![Coverage Status](https://coveralls.io/repos/github/oahray/kwik-help/badge.svg?branch=develop)](https://coveralls.io/github/oahray/kwik-help?branch=develop)

# Kwik Help
Kwik Help is a platform that helps organizations manage their customer service.

### Dependencies
This is a NodeJS application with an express server and a Mongo Database. These two dependencies must be installed on your machine before you install the others listed in this project's `package.json`.

### Installing dependencies.
#### NodeJS
There are two options you can choose from.
- [Download a native installer](https://nodejs.org/en/download)
- [Use package managers](https://nodejs.org/en/download/package-manager/)

#### MongoDB
See [installation options](https://docs.mongodb.com/manual/installation/)

#### Other dependencies
Other dependencies are listed on the `package.json` and can be installed with npm (which comes bundled with Node) or yarn.

To install with npm, run `npm install` at the root directory of this project.
If you prefer yarn and have it available on your machine, run `yarn install` at the project's root directory.

### Creating and initializing the database.
This project uses MongoDB, a no-SQL database. As such, it does not require database migrations. However, there is provision for seeding the database on the development environment.

To setup, simply make sure there is a MONGO_URL in your environment variables set to the Mongo database you wish to use.

If you are running locally, this variable should be included in a `.env` file (you should create it) and should have the variables listed in the `.sample.env` file.

See the section above to see how to install dependencies (including MongoDB) on your local machine.

### Application configuration
This application relies on some data, that cannot be made public, to run. Commonly termed environment variables, they can be configured differently for any environment.

To run this application locally, create a `.env` file at the root of the project. A sample file named `.sample.env` which includes the necessary configuration environment variables has been created as a guide.

### Seeding the database
Use the command `npm run seed`. This would create seed data in your database based on the seed file at `/seeds/users.json`


### Features available and base assumptions
#### Implemented features
All required features have been implement, with a little extra. Below are the endpoints that satisfy each requirement.

Note: Every route listed below is preceeded by `/api/v1` prefix. Besides the auth routes - `/api/v1/signup` - every other route is protected, and would require JWT authentication to access them.

To authenticate a request, set the Authorization header to `Bearer <TOKEN_STRING>`, for example, `Bearer eydjdyxhdyro.eh363jshs7`.

1) **User Authentication with JWT**
    - **Sign up** (`POST /signup`)
			 - required attributes in request body - `username`, `email`, `password`.
    - **Sign in** (`POST /signin` or `POST /login`)
			- required attributes in request body - `username` or`email`, and `password`.
2) **Create tickets** (`POST /tickets`)
Anyone can create tickets
			- required attributes in request body `title` and `description`

3) **Read tickets**
A customer can only view their own tickets, i.e tickets they created. However, agents and admin users can view all tickets.
	- **View list of tickets** (`GET /tickets`)
    - **View a single ticket** (`GET /tickets/:ticket_id`)

4) **Comment on a ticket** (`POST /tickets/:ticket_id/comments`)
A customer can comment on their own tickets, but only if an agent or admin has already commented.

5) **View comments on a ticket** (`GET /tickets/:ticket_id/comments`)
Customers can view comments on their tickets. Agents and admin users can view the content of any ticket.

6) **Managing tickets**
These are not available to customers. Only agents or admin users can manage tickets.
    - **Process a ticket** (`PATCH /tickets/:ticket_id/comments`)
		    - Only open tickets can be processed.
    - **Close a ticket** (`PATCH /tickets/:ticket_id/comments`)
		    - Only tickets that are currently being processed can be closed. An open ticket has to first be processed before being closed.
    - **Reset a ticket** (`PATCH /tickets/:ticket_id/comments`)
		    - This changes the status of a processing or closed ticket back to open.

7) **Viewing and downloading ticket report**
These are not available to customers.
    - ****View report** (`GET /report`)**
		    - An agent or admin can view a report of all tickets that have been closed in the last 30 days (my assumption of what a month should mean to our application).
    - ****Download report** (`GET /report/download`)**
		    - The report can be downloaded as a `CSV` file.

8) **Delete a ticket** (`DELETE /tickets/:ticket_id`)
This is an admin-only route, not available to customers or even agents.

9) **View user data**
Only admin users can access these.
    - View users by role (`GET /admin/users`)
		    - An admin can view users on the system. If a scope is passed as a **url query** (`scope=<SCOPE>`) where scope can be one of [`customer`, `customers`, `agent`, `agents`, `admin`]. If no scope is passed, or if it does not match any on the supported ones, it is set to a list of all users.
    - View a user (`GET /admin/users/:user_id`)

10) Manage user roles
These admin-only routes are used to manage users.
    - Grant  agent role (`PATCH /admin/users/:user_id/promote`)
    - Revoke agent role (`PATCH /admin/users/:user_id/demote`)

#### Other assumptions that guided implementation
1) **Standard API responses contribute to great User Experience (UX):**
In my own way of building upon the requirements (outside of extra features) and ensuring great UX for our API consumers, I sought to introduce serializers that would be updated on an API version basis. That way, consumers would always be sure certain values would exist (even if null) for an endpoint. Also, that would make it easier to **never break the API**.
However, my Serializer implementation was basic - for the User, Ticket and Comment models. For each instance of those classes, a property named `object` identifies it as a user, ticket or comment. This would make it easier for anyone consuming the API to easily  know the kind of data they are looking at.
I also had a standard pattern for error responses that includes the term `error` as the object, a message and a list of violations per scope (in the case of input validation). The idea was to have an error class and an error serializer that ensures a standard response is returned for errors in a clean, reusable way. This has not been fully implemented yet. While we have standard error responses, there's still a lot of repeated code requiring some abstraction and cleanup.
The end goal would be to have a smart serializer that returns standard, easy-to-understand and easy-to-document data.

2) No one should ever be able to sign up as anything other than a regular user - a customer. In a role-based system, it only makes sense that roles be managed by trusted individuals. For this reason, even agents start out as regular users, until they are granted the agent role by an Admin. For security reasons, the only way to make any user an admin would be to update the database directly.

3) Admin users can do everything agents can do, and some more.

4) It would be great to be able to delete tickets and related data. Not only would this help reduce unnecessary clutter of old tickets, it would also help save precious database storage. However, this can be easily abused, and so the feature is restricted to Admin users only. In future iterations, a soft delete feature would be included that makes a ticket inaccessible by other users except admin users. For others, it would seem like it has been deleted.


### Pending Requirements
All functional requirements have been covered. However end-to-end tests with Cypress have not been included as, given the project time frame, the unit and integration tests were prioritized.


### Issues faced while completing the assignment.

I had this issue where, after doing a mass change of all occurrences of a variable name, tests started failing with the former name still showing in the error logs. This had me stumped for a few hours.

It seemed to me to that it had something to do with cached code. I tried different things including exiting my code editor, deleting and reinstalling node modules, restarting my machine, but the issue persisted.

Finally I looked up Jest docs on how to check if Jest caches my test code and how clear to the cache. The simple command `jest --clearCache` saved me some extra headache. Pheeewww!

### In retrospect
#### A) Improving my implementation
- Make my code a lot more dry by introducing an error class that eliminates code duplication. Also, in future iterations, I could introduce pagination for endpoints that return a list.

#### B) Improving the assignment
I think the assignment was great. I liked that it was sort of open ended, which encourages different kinds of interpretations for features. It did make me think.

In the future, the scope of the project - fullstack/backend could be a bit more explicit. Seeing generic terms that subtly implies a full-stack implementation might be confusing since everything else seems to point to a backend-only implementation. On the flip side, that is room to ask questions. So, yeah, great on the whole.

### Dev Team
- Oare Arene
