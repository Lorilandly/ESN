# Documentation Decisions

This directory is intended to house diagrams, technical decisions and tradeoffs, etc.

## Technology Decisions

### Required Technologies

- Runtime: Node.js (*REQUIRED*)
- Framework: Express (*REQUIRED*)
- HTML *(REQUIRED)*
- CSS *(REQUIRED)*
- Javascript *(REQUIRED)*

### Database

We elected to use PostgreSQL after comparing it to NoSQL options (MongoDB) and other SQL options (such as MySQL).

| Pros                                                                                | Cons                                                                                                               |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Widely used (industry standard) SQL Implementation                                  | Not all members of our team have SQL or PostgreSQL experience                                                      |
| ACID Compliant                                                                      | Comparatively low reading speed compared to MySQL (https://www.ionos.com/digitalguide/server/know-how/postgresql/) |
| Open source with lots of tooling and libraries that integrate with node and express | May require the team to think carefully about the schema in advance                                                |
| Good tooling for local development on MacOS                                         |                                                                                                                    |

### Authentication Library

We elected to use Passport.js for our authentication middleware.

We decided to use this library because our team is familiar with it and its an industry-standard option for authenticating requests over HTTP.

### Web Socket Library

We elected to use Socket.io for establishing communication between clients and the server.

We decided to use this library because our team is familar with it.

### Templating Engine

We elected to use EJS for out templating engine.

We decided to use it because most of our team members are familiar with it and its syntax is easy to understand.

### REST API Specification

[REST API Google Sheet](https://docs.google.com/spreadsheets/d/1T7iUzWzS5vqBZiTEkATTPoX8Ts2FUyHnQ3qYcuLPNeA/edit#gid=0)

### Resources

- [Database Design and Schema](https://app.diagrams.net/#G17hR_xSGP90rC-pllEnbJ8A7NLXeNjATB)

### References

- [AWS Article Discussing Pros and Cons of PostgresSQL and MySQL](https://aws.amazon.com/compare/the-difference-between-mysql-vs-postgresql/#:~:text=PostgreSQL%20is%20an%20object%2Drelational%20database%20management%20system.&text=MySQL%20has%20limited%20support%20of,stored%20procedures%20in%20multiple%20languages.)
- PostgreSQL [Docs](https://www.postgresql.org/docs/)
- EJS [Docs](https://ejs.co/#docs)
- Socket.IO [Docs](https://socket.io/docs/v4/)
- Passport.js [Docs](https://www.passportjs.org/docs/)
