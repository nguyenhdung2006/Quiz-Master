# Phase 6.1 - Initial Demo Content Source of Truth

## 1. Purpose

This document is the human-reviewable source of truth for QuizMaster demo content. It contains six public quizzes, two admin-oriented validation drafts, and one locked historical quiz.

Correct answers and explanations are included because this is an internal content source. A future seeder may consume this content, but the public API must not expose correct answers or explanations before a quiz attempt is submitted and the existing authorization rules permit access.

## 2. Content Rules

- Quiz titles, questions, options, and explanations use English consistently.
- Questions are single-choice and have exactly one correct answer.
- Every question has four options labeled A, B, C, and D.
- Every question has a stable key, one topic, and an `easy` or `medium` difficulty.
- Wording must be clear, beginner/intermediate friendly, and independent of exact framework versions.
- Questions must not rely on tricks, obscure edge cases, jokes, filler, or outdated behavior.
- Explanations must be one to three sentences and state why the correct answer is correct.
- Keys are stable content identifiers and should not be changed casually after seeding begins.

## 3. Category Overview

| Category | Phase 6.1 state | Intended coverage |
| --- | --- | --- |
| Java Core | Complete | Java runtime and core language fundamentals |
| Spring Boot | Complete | Common Spring Boot application concepts |
| SQL & Database | Complete | Relational database and SQL fundamentals |
| Computer Networking | Complete | Core networking protocols and concepts |
| Software Engineering | Complete | Development lifecycle and engineering practices |
| English for IT | Complete | Practical English used in software work |

## 4. Quiz Overview

| Quiz | Category | Status | Time limit | Questions | Difficulty range |
| --- | --- | --- | ---: | ---: | --- |
| Java Core Basics | Java Core | Public | 10 minutes | 8 | Easy-Medium |
| Spring Boot Essentials | Spring Boot | Public | 10 minutes | 8 | Easy-Medium |
| SQL Basics | SQL & Database | Public | 10 minutes | 8 | Easy-Medium |
| Networking Fundamentals | Computer Networking | Public | 10 minutes | 8 | Easy-Medium |
| Software Engineering Basics | Software Engineering | Public | 10 minutes | 8 | Easy-Medium |
| English for IT Basics | English for IT | Public | 8 minutes | 6 | Easy-Medium |
| Locked Demo Quiz | Software Engineering | Draft after submitted attempt | 8 minutes | 4 | Easy-Medium |

## 5. Full Content: Java Core Basics

**Category:** Java Core
**Status:** Public
**Time limit:** 10 minutes
**Question count:** 8

### Question 1

**Key:** `java-core-001`
**Topic:** JVM/JDK/JRE
**Difficulty:** easy

**Question:** What is the main role of the JVM in a Java application?

**Options:**

- A. It edits Java source files.
- B. It executes Java bytecode on a specific platform.
- C. It stores application data in relational tables.
- D. It converts HTTP requests directly into SQL queries.

**Correct answer:** B

**Explanation:** The JVM provides the runtime environment that executes Java bytecode on a particular platform. The Java compiler, which is included in the JDK, compiles source code into bytecode.

### Question 2

**Key:** `java-core-002`
**Topic:** Primitive vs reference types
**Difficulty:** easy

**Question:** Which variable is declared with a Java primitive type?

**Options:**

- A. `String name = "QuizMaster";`
- B. `Integer score = 10;`
- C. `int questionCount = 8;`
- D. `List<String> topics = new ArrayList<>();`

**Correct answer:** C

**Explanation:** `int` is one of Java's primitive types. `String`, `Integer`, and `List` are reference types.

### Question 3

**Key:** `java-core-003`
**Topic:** Class and object
**Difficulty:** easy

**Question:** In object-oriented Java, what is an object?

**Options:**

- A. An instance created from a class.
- B. A package that contains source files.
- C. A keyword used to handle exceptions.
- D. A compiler option that creates bytecode.

**Correct answer:** A

**Explanation:** A class defines structure and behavior, while an object is a concrete instance of that class. Multiple objects can be created from the same class.

### Question 4

**Key:** `java-core-004`
**Topic:** Inheritance
**Difficulty:** easy

**Question:** Which keyword declares that one Java class inherits from another class?

**Options:**

- A. `implements`
- B. `imports`
- C. `extends`
- D. `inherits`

**Correct answer:** C

**Explanation:** A class uses `extends` to inherit accessible fields and methods from another class. `implements` is used when a class fulfills an interface contract.

### Question 5

**Key:** `java-core-005`
**Topic:** Interface
**Difficulty:** easy

**Question:** Which declaration correctly states that `EmailService` fulfills the `NotificationService` interface contract?

**Options:**

- A. `class EmailService extends NotificationService`
- B. `class EmailService implements NotificationService`
- C. `class EmailService imports NotificationService`
- D. `class EmailService inherits NotificationService`

**Correct answer:** B

**Explanation:** A Java class uses the `implements` keyword to declare that it fulfills an interface contract. `extends` is used for class inheritance or for one interface extending another interface.

### Question 6

**Key:** `java-core-006`
**Topic:** Exception handling
**Difficulty:** easy

**Question:** What is the purpose of a `catch` block in Java?

**Options:**

- A. To declare a new class.
- B. To repeat a block until no exception occurs.
- C. To handle a matching exception thrown by its associated `try` block.
- D. To prevent the compiler from creating bytecode.

**Correct answer:** C

**Explanation:** A `catch` block handles an exception type that matches an exception thrown while its associated `try` block runs. This lets the program respond to the error instead of leaving it unhandled at that point.

### Question 7

**Key:** `java-core-007`
**Topic:** Collections basics
**Difficulty:** easy

**Question:** Which Java collection interface is designed to contain no duplicate elements?

**Options:**

- A. `List`
- B. `Queue`
- C. `Set`
- D. `Deque`

**Correct answer:** C

**Explanation:** A `Set` models a collection of unique elements and does not allow duplicate elements according to its equality rules. A `List` can contain duplicates.

### Question 8

**Key:** `java-core-008`
**Topic:** String immutability
**Difficulty:** medium

**Question:** Given `String title = "Java";`, what happens when `title.concat(" Basics")` is called without assigning its result?

**Options:**

- A. `title` becomes `"Java Basics"`.
- B. `title` remains `"Java"` because `String` objects are immutable.
- C. `title` becomes `null`.
- D. The code fails to compile because `concat` cannot accept text.

**Correct answer:** B

**Explanation:** `String` objects are immutable, so `concat` returns a new `String` rather than modifying the original one. Without assigning the returned value, `title` still refers to `"Java"`.

## 6. Full Content: Spring Boot Essentials

**Category:** Spring Boot
**Status:** Public
**Time limit:** 10 minutes
**Question count:** 8

### Question 1

**Key:** `spring-boot-001`
**Topic:** `@SpringBootApplication`
**Difficulty:** easy

**Question:** What does `@SpringBootApplication` commonly provide on the main application class?

**Options:**

- A. A combination of configuration, component scanning, and auto-configuration support.
- B. Automatic creation of every database table without JPA configuration.
- C. Authentication for every endpoint without security configuration.
- D. Conversion of every class into a REST controller.

**Correct answer:** A

**Explanation:** `@SpringBootApplication` combines key annotations that enable configuration, component scanning, and Spring Boot auto-configuration. It does not automatically define application-specific persistence or security behavior.

### Question 2

**Key:** `spring-boot-002`
**Topic:** Dependency injection
**Difficulty:** easy

**Question:** Which example uses constructor injection for an `AttemptService` dependency?

**Options:**

- A. `QuizController(AttemptService attemptService) { this.attemptService = attemptService; }`
- B. `AttemptService attemptService = new AttemptService()` inside every controller method.
- C. A static global variable initialized by the controller.
- D. A database column named `attemptService`.

**Correct answer:** A

**Explanation:** Constructor injection supplies a dependency through the receiving class's constructor. This makes required dependencies explicit and allows the Spring container to provide the managed bean.

### Question 3

**Key:** `spring-boot-003`
**Topic:** Controller/Service/Repository layers
**Difficulty:** medium

**Question:** Which responsibility assignment best matches a typical layered Spring Boot application?

**Options:**

- A. Controllers handle HTTP input, services coordinate business logic, and repositories access persistent data.
- B. Repositories render web pages, controllers create database schemas, and services only hold constants.
- C. Services handle CSS, repositories validate JWT signatures, and controllers manage database files directly.
- D. Controllers perform every responsibility so services and repositories are unnecessary.

**Correct answer:** A

**Explanation:** In a typical layered design, controllers manage the HTTP boundary, services contain or coordinate business rules, and repositories provide data access. This separation keeps responsibilities clear and easier to test.

### Question 4

**Key:** `spring-boot-004`
**Topic:** REST controller
**Difficulty:** easy

**Question:** What is the usual purpose of `@RestController` in Spring MVC?

**Options:**

- A. To mark a class whose handler return values are written to the HTTP response body.
- B. To mark a class as a database entity.
- C. To schedule every method to run periodically.
- D. To encrypt all response fields automatically.

**Correct answer:** A

**Explanation:** `@RestController` marks a web controller whose handler return values are written to the response body, commonly as JSON. It combines controller semantics with response-body behavior.

### Question 5

**Key:** `spring-boot-005`
**Topic:** DTO usage
**Difficulty:** medium

**Question:** Why is a DTO often used at a REST API boundary?

**Options:**

- A. To define an explicit request or response shape without exposing the persistence entity directly.
- B. To replace the database engine.
- C. To make all fields globally writable.
- D. To disable input validation.

**Correct answer:** A

**Explanation:** A DTO defines the data accepted or returned by an API and decouples that contract from persistence entities. It can also limit exposed fields and provide a focused place for input constraints.

### Question 6

**Key:** `spring-boot-006`
**Topic:** Validation
**Difficulty:** medium

**Question:** In a configured Spring MVC application, what is the purpose of placing `@Valid` on a request DTO parameter?

**Options:**

- A. To trigger validation of the DTO against its declared validation constraints.
- B. To save the DTO to the database automatically.
- C. To convert the endpoint into an admin-only endpoint.
- D. To skip deserialization of the request body.

**Correct answer:** A

**Explanation:** `@Valid` requests validation of the bound DTO using its declared constraints, such as `@NotBlank`. The application can then reject invalid input through its configured error-handling flow.

### Question 7

**Key:** `spring-boot-007`
**Topic:** Spring Data JPA basics
**Difficulty:** easy

**Question:** What does extending `JpaRepository<Quiz, Long>` primarily provide?

**Options:**

- A. Common persistence operations for `Quiz` entities with `Long` identifiers.
- B. Automatic REST authentication for quiz endpoints.
- C. A frontend component for displaying quizzes.
- D. Automatic generation of quiz questions by AI.

**Correct answer:** A

**Explanation:** `JpaRepository` provides common repository operations such as saving, finding, and deleting entities. The generic parameters identify the entity type and its identifier type.

### Question 8

**Key:** `spring-boot-008`
**Topic:** Spring Security/JWT basics
**Difficulty:** medium

**Question:** When a client sends a JWT to access a protected endpoint, what should the backend do before treating the request as authenticated?

**Options:**

- A. Trust every token that contains an email address.
- B. Validate the token, including its signature and relevant claims such as expiration.
- C. Store the user's plaintext password inside the token.
- D. Disable authorization checks for the request.

**Correct answer:** B

**Explanation:** The backend must validate the token's integrity and relevant claims before establishing authentication for the request. A token should not be trusted merely because it has the expected text fields.

## 7. Admin Demo Quizzes

### Draft — Spring Security Practice

**Category:** Spring Boot
**Status:** Draft / Unpublished
**Purpose:** Allow an admin to demonstrate editing quiz metadata, questions, and options before publishing.
**Question count:** 3

#### Question 1

**Key:** `spring-security-draft-001`
**Topic:** Authentication vs authorization
**Difficulty:** easy

**Question:** Which statement correctly distinguishes authentication from authorization?

**Options:**

- A. Authentication verifies identity, while authorization checks permitted actions.
- B. Authentication checks permitted actions, while authorization verifies identity.
- C. Authentication encrypts the database, while authorization creates user accounts.
- D. Authentication and authorization always mean exactly the same thing.

**Correct answer:** A

**Explanation:** Authentication verifies who a user is, while authorization determines what an authenticated user is allowed to do. Applications commonly perform authentication before applying authorization rules.

#### Question 2

**Key:** `spring-security-draft-002`
**Topic:** JWT purpose in stateless APIs
**Difficulty:** easy

**Question:** What is a common purpose of a JWT in a stateless API after a user logs in?

**Options:**

- A. To store the user's plaintext password in each request.
- B. To carry signed claims that the backend can validate on later requests.
- C. To make every endpoint public automatically.
- D. To replace all database tables used by the application.

**Correct answer:** B

**Explanation:** A JWT can carry signed claims that the backend validates on later requests without relying on a server-side login session. The backend must still verify the token before trusting those claims.

#### Question 3

**Key:** `spring-security-draft-003`
**Topic:** Password hashing
**Difficulty:** easy

**Question:** Why should an application store password hashes instead of plaintext passwords?

**Options:**

- A. It avoids storing the original password and reduces exposure if credentials are leaked.
- B. It allows administrators to read every user's password more easily.
- C. It removes the need to authenticate users.
- D. It guarantees that every user chooses a unique password.

**Correct answer:** A

**Explanation:** Password hashing lets the application verify a submitted password without storing the original password. A strong adaptive password hash also reduces the impact of a credential database exposure.

### Draft — Empty Quiz For Publish Validation

**Category:** Java Core
**Status:** Draft / Unpublished
**Purpose:** Allow an admin to demonstrate that the existing publish validation blocks an empty quiz.
**Question count:** 0

This quiz intentionally has no questions or options. It must remain unpublished until valid question content is added through the normal admin workflow.

## 8. Full Content: SQL Basics

**Category:** SQL & Database
**Status:** Public
**Time limit:** 10 minutes
**Question count:** 8

### Question 1

**Key:** `sql-basics-001`
**Topic:** SELECT
**Difficulty:** easy

**Question:** Which SQL statement retrieves the `name` column from every row in the `users` table?

**Options:**
- A. `SELECT name FROM users;`
- B. `UPDATE users SET name;`
- C. `DELETE name FROM users;`
- D. `INSERT name INTO users;`

**Correct answer:** A

**Explanation:** `SELECT name FROM users;` requests the `name` column from all rows in the `users` table. A `SELECT` statement reads data without changing those rows.

### Question 2

**Key:** `sql-basics-002`
**Topic:** WHERE
**Difficulty:** easy

**Question:** Which SQL clause filters rows according to a condition?

**Options:**
- A. `ORDER BY`
- B. `WHERE`
- C. `GROUP BY`
- D. `SELECT`

**Correct answer:** B

**Explanation:** The `WHERE` clause keeps only rows that satisfy its condition. For example, `WHERE active = true` filters out inactive rows.

### Question 3

**Key:** `sql-basics-003`
**Topic:** JOIN
**Difficulty:** medium

**Question:** What does an `INNER JOIN` return?

**Options:**
- A. Every row from the first table, even without a match.
- B. Every possible combination of rows from both tables.
- C. Rows that satisfy the join condition in both tables.
- D. Only rows that contain null values.

**Correct answer:** C

**Explanation:** An `INNER JOIN` returns combined rows where the join condition matches in both tables. Rows without a match are excluded from the result.

### Question 4

**Key:** `sql-basics-004`
**Topic:** PRIMARY KEY
**Difficulty:** easy

**Question:** What is the main purpose of a primary key?

**Options:**
- A. To uniquely identify each row in a table.
- B. To sort every query result automatically.
- C. To store the longest text value in a row.
- D. To allow duplicate identifiers in a table.

**Correct answer:** A

**Explanation:** A primary key uniquely identifies each row in a table and cannot be null. This gives other tables and queries a stable way to refer to a specific row.

### Question 5

**Key:** `sql-basics-005`
**Topic:** FOREIGN KEY
**Difficulty:** easy

**Question:** What does a foreign key represent in a relational database?

**Options:**
- A. A password used to connect to the database.
- B. A reference from one table to a key in another table.
- C. A temporary name for a selected column.
- D. A rule that makes every column unique.

**Correct answer:** B

**Explanation:** A foreign key references a key in another table, creating and protecting a relationship between rows. It helps prevent references to records that do not exist.

### Question 6

**Key:** `sql-basics-006`
**Topic:** GROUP BY
**Difficulty:** medium

**Question:** Why is `GROUP BY` commonly used with aggregate functions such as `COUNT`?

**Options:**
- A. To rename the result table permanently.
- B. To remove every duplicate row from storage.
- C. To calculate an aggregate separately for each group of rows.
- D. To prevent the query from returning columns.

**Correct answer:** C

**Explanation:** `GROUP BY` divides rows into groups that share selected values, allowing an aggregate to be calculated for each group. For example, it can count quizzes in each category.

### Question 7

**Key:** `sql-basics-007`
**Topic:** ORDER BY
**Difficulty:** easy

**Question:** What is the purpose of `ORDER BY score DESC` in a query?

**Options:**
- A. To delete rows with duplicate scores.
- B. To group rows that have the same score.
- C. To return only rows with negative scores.
- D. To sort rows from the highest score to the lowest score.

**Correct answer:** D

**Explanation:** `ORDER BY` sorts the result, and `DESC` requests descending order. Higher score values therefore appear before lower score values.

### Question 8

**Key:** `sql-basics-008`
**Topic:** Transaction basics
**Difficulty:** medium

**Question:** What is the purpose of rolling back a database transaction?

**Options:**
- A. To make all transaction changes permanent.
- B. To cancel uncommitted changes in the transaction.
- C. To create a backup of the entire database.
- D. To grant every user administrator access.

**Correct answer:** B

**Explanation:** A rollback cancels the uncommitted changes made in the current transaction. It helps preserve consistency when an operation cannot complete successfully.

## 9. Full Content: Networking Fundamentals

**Category:** Computer Networking
**Status:** Public
**Time limit:** 10 minutes
**Question count:** 8

### Question 1

**Key:** `networking-001`
**Topic:** HTTP
**Difficulty:** easy

**Question:** What is HTTP primarily used for?

**Options:**
- A. Exchanging web requests and responses between clients and servers.
- B. Assigning physical addresses to network cards.
- C. Compressing every file stored on a computer.
- D. Replacing the operating system's file system.

**Correct answer:** A

**Explanation:** HTTP defines how clients and servers exchange web requests and responses. It is an application-layer protocol used by browsers, APIs, and other web clients.

### Question 2

**Key:** `networking-002`
**Topic:** DNS
**Difficulty:** easy

**Question:** What is the main role of DNS?

**Options:**
- A. To encrypt every packet sent over a network.
- B. To translate domain names into IP addresses.
- C. To assign application port numbers automatically.
- D. To store web page source code.

**Correct answer:** B

**Explanation:** DNS resolves human-readable domain names to IP addresses and other DNS records. This lets users access services by name instead of remembering numeric addresses.

### Question 3

**Key:** `networking-003`
**Topic:** TCP vs UDP
**Difficulty:** medium

**Question:** Which statement correctly compares TCP and UDP?

**Options:**
- A. UDP guarantees ordered delivery, while TCP does not.
- B. TCP and UDP always provide identical delivery guarantees.
- C. TCP provides reliable ordered delivery, while UDP does not guarantee it.
- D. TCP can only be used inside a local network.

**Correct answer:** C

**Explanation:** TCP provides a connection-oriented byte stream with reliable, ordered delivery. UDP sends independent datagrams without guaranteeing delivery or order.

### Question 4

**Key:** `networking-004`
**Topic:** IP address
**Difficulty:** easy

**Question:** What is an IP address used for in an IP network?

**Options:**
- A. To identify a network interface so packets can be addressed and routed.
- B. To name a database column.
- C. To describe the format of an HTML document.
- D. To hash a user's password.

**Correct answer:** A

**Explanation:** An IP address identifies a network interface for addressing and routing packets. Routers use destination IP addresses to move packets toward the correct network.

### Question 5

**Key:** `networking-005`
**Topic:** Port
**Difficulty:** easy

**Question:** What does a network port number help identify?

**Options:**
- A. The physical location of a computer building.
- B. A particular application or service on a host.
- C. The brand of the network cable.
- D. The username of the current user.

**Correct answer:** B

**Explanation:** A port number helps direct traffic to a particular application or service on a host. An IP address identifies the host interface, while the port distinguishes services on it.

### Question 6

**Key:** `networking-006`
**Topic:** Client-server model
**Difficulty:** easy

**Question:** In the client-server model, what does a client typically do?

**Options:**
- A. It permanently replaces the server.
- B. It assigns all IP addresses on the internet.
- C. It sends requests to a server for data or services.
- D. It must store every server database locally.

**Correct answer:** C

**Explanation:** A client initiates a request for data or a service, and a server processes the request and returns a response. A browser requesting a web page is a common example.

### Question 7

**Key:** `networking-007`
**Topic:** HTTP status code
**Difficulty:** easy

**Question:** What does HTTP status code 404 usually indicate?

**Options:**
- A. The request succeeded and returned content.
- B. The client must switch to a different network protocol.
- C. The server created a new resource successfully.
- D. The requested resource was not found.

**Correct answer:** D

**Explanation:** HTTP 404 means the server did not find the requested resource. It does not by itself mean the entire server is offline.

### Question 8

**Key:** `networking-008`
**Topic:** Latency
**Difficulty:** easy

**Question:** What does network latency measure?

**Options:**
- A. The delay before data reaches its destination or a response returns.
- B. The total storage capacity of a server disk.
- C. The number of user accounts in an application.
- D. The maximum length of a domain name.

**Correct answer:** A

**Explanation:** Latency measures the time delay involved in sending data across a network. Higher latency generally makes interactive requests feel slower.

## 10. Full Content: Software Engineering Basics

**Category:** Software Engineering
**Status:** Public
**Time limit:** 10 minutes
**Question count:** 8

### Question 1

**Key:** `software-engineering-001`
**Topic:** Requirement
**Difficulty:** easy

**Question:** What is a software requirement?

**Options:**
- A. A random implementation detail chosen after release.
- B. A documented need or constraint that the system should satisfy.
- C. A list of every variable name in the source code.
- D. A backup copy of the production database.

**Correct answer:** B

**Explanation:** A requirement describes a needed capability, behavior, quality, or constraint of a system. Clear requirements help teams agree on what the software should achieve.

### Question 2

**Key:** `software-engineering-002`
**Topic:** Use case
**Difficulty:** easy

**Question:** What does a use case primarily describe?

**Options:**
- A. The exact memory address of each object.
- B. The color palette used by an operating system.
- C. An interaction between an actor and the system to achieve a goal.
- D. A list of database passwords.

**Correct answer:** C

**Explanation:** A use case describes how an actor interacts with a system to achieve a goal. It focuses on observable behavior rather than internal implementation details.

### Question 3

**Key:** `software-engineering-003`
**Topic:** Agile
**Difficulty:** easy

**Question:** Which practice is commonly associated with agile development?

**Options:**
- A. Delivering in short iterations and adapting based on feedback.
- B. Preventing stakeholders from reviewing work until the project ends.
- C. Avoiding all testing to increase delivery speed.
- D. Fixing every requirement permanently before any discussion.

**Correct answer:** A

**Explanation:** Agile approaches commonly deliver work in short iterations and use feedback to adapt priorities and implementation. This supports incremental learning and delivery.

### Question 4

**Key:** `software-engineering-004`
**Topic:** Testing
**Difficulty:** easy

**Question:** What is the main purpose of software testing?

**Options:**
- A. To guarantee that software can never contain a defect.
- B. To evaluate behavior and detect defects before they affect users.
- C. To replace requirements and design activities completely.
- D. To make source code unavailable to developers.

**Correct answer:** B

**Explanation:** Testing evaluates whether software behaves as expected and helps reveal defects. Different test levels examine behavior at different scopes.

### Question 5

**Key:** `software-engineering-005`
**Topic:** Waterfall
**Difficulty:** medium

**Question:** How does the waterfall model traditionally organize development work?

**Options:**
- A. As unrelated tasks with no planned order.
- B. As continuous deployment with no requirements phase.
- C. As daily releases driven only by production incidents.
- D. As a sequence of distinct phases completed largely in order.

**Correct answer:** D

**Explanation:** The waterfall model traditionally moves through defined phases in sequence, such as requirements, design, implementation, and testing. Returning to earlier phases can be more formal and costly than in iterative approaches.

### Question 6

**Key:** `software-engineering-006`
**Topic:** UML
**Difficulty:** easy

**Question:** What is UML commonly used for?

**Options:**
- A. Modeling and communicating software structure and behavior with diagrams.
- B. Encrypting network traffic between services.
- C. Compiling source code into machine code.
- D. Managing user passwords in a database.

**Correct answer:** A

**Explanation:** UML provides standardized diagram types for visualizing and communicating aspects of a software system. Examples include class, sequence, and use case diagrams.

### Question 7

**Key:** `software-engineering-007`
**Topic:** Maintenance
**Difficulty:** easy

**Question:** What does software maintenance include after a system is released?

**Options:**
- A. Only deleting the source code after deployment.
- B. Only writing the first project requirements.
- C. Fixing defects, adapting the system, and making improvements.
- D. Preventing any future change to the application.

**Correct answer:** C

**Explanation:** Maintenance includes correcting defects, adapting to environmental changes, and improving the system after release. It is a normal part of the software lifecycle.

### Question 8

**Key:** `software-engineering-008`
**Topic:** Version control
**Difficulty:** easy

**Question:** What is a key benefit of version control?

**Options:**
- A. It removes the need to review any code change.
- B. It tracks changes and helps teams collaborate on source code.
- C. It guarantees that every committed change has no defects.
- D. It replaces all application tests.

**Correct answer:** B

**Explanation:** Version control records changes over time and supports collaboration, review, and recovery of earlier versions. It provides a shared history of the codebase.

## 11. Full Content: English for IT Basics

**Category:** English for IT
**Status:** Public
**Time limit:** 8 minutes
**Question count:** 6

### Question 1

**Key:** `english-it-001`
**Topic:** Bug/fix
**Difficulty:** easy

**Question:** In software development, what does it mean to fix a bug?

**Options:**
- A. To correct a defect in the software.
- B. To add the same defect to more files.
- C. To publish a database password.
- D. To remove every feature from the application.

**Correct answer:** A

**Explanation:** A bug is a defect or unintended behavior in software, and to fix it means to correct that problem. The fix should normally be verified with appropriate testing.

### Question 2

**Key:** `english-it-002`
**Topic:** Deploy
**Difficulty:** easy

**Question:** What does the verb `deploy` usually mean in a software project?

**Options:**
- A. To write a requirement without implementing it.
- B. To release or install an application in a target environment.
- C. To rename every variable in the source code.
- D. To disconnect all users permanently.

**Correct answer:** B

**Explanation:** To deploy means to release or install an application version into a target environment. That environment might be used for testing, staging, or production.

### Question 3

**Key:** `english-it-003`
**Topic:** Database terms
**Difficulty:** easy

**Question:** In database terminology, what is a query?

**Options:**
- A. A physical cable connecting two servers.
- B. A visual icon used to start an application.
- C. A request or instruction for working with database data.
- D. A password that is stored without hashing.

**Correct answer:** C

**Explanation:** A query is a request or instruction used to read or manipulate data in a database. SQL is a common language for expressing relational database queries.

### Question 4

**Key:** `english-it-004`
**Topic:** API terms
**Difficulty:** easy

**Question:** What does an API endpoint refer to?

**Options:**
- A. A specific API address and operation that a client can call.
- B. The final line of every source file.
- C. A backup battery inside a server.
- D. A private password shared by all users.

**Correct answer:** A

**Explanation:** An API endpoint is a specific address and operation through which a client interacts with an API. For HTTP APIs, it is commonly described by a path and an HTTP method.

### Question 5

**Key:** `english-it-005`
**Topic:** Error message vocabulary
**Difficulty:** easy

**Question:** What does the error message `Permission denied` usually mean?

**Options:**
- A. The operation completed successfully.
- B. The current user or process lacks the required permission.
- C. The database contains no tables.
- D. The network connection is always too slow.

**Correct answer:** B

**Explanation:** `Permission denied` means the current user or process is not allowed to perform the requested operation. The relevant permissions or identity should be checked.

### Question 6

**Key:** `english-it-006`
**Topic:** Common development verbs
**Difficulty:** easy

**Question:** What does it mean to refactor code?

**Options:**
- A. To change every public behavior without reviewing it.
- B. To delete all tests before editing code.
- C. To copy a defect into another module.
- D. To improve internal code structure without changing intended behavior.

**Correct answer:** D

**Explanation:** Refactoring improves the internal structure of code while preserving its intended external behavior. It can make code clearer, simpler, or easier to maintain.

## 12. Locked Demo Quiz

**Category:** Software Engineering

**Final status:** Unpublished after its seeded attempt is submitted

**Time limit:** 8 minutes

**Question count:** 4

**Purpose:** Preserve a realistic historical attempt and demonstrate the existing structural editing lock without hardcoding it.

### Question 1

**Key:** `locked-demo-001`

**Topic:** Historical result integrity

**Difficulty:** easy

**Question:** Why can editing an old quiz question damage historical result accuracy?

**Options:**
- A. It can make stored answers and scores inconsistent with the original quiz.
- B. It automatically improves every historical score.
- C. It removes the need to preserve submitted answers.
- D. It changes only the quiz title and nothing else.

**Correct answer:** A

**Explanation:** Submitted results refer to the question and option structure used when the attempt was scored. Changing that structure can make an old score or review inconsistent with what the learner answered.

### Question 2

**Key:** `locked-demo-002`

**Topic:** Published content stability

**Difficulty:** easy

**Question:** Why should published quiz structure remain stable after learners submit attempts?

**Options:**
- A. So the quiz can expose correct answers before submission.
- B. So submitted answers, scores, and reviews keep their original meaning.
- C. So every learner receives the same score regardless of answers.
- D. So authentication is no longer required.

**Correct answer:** B

**Explanation:** Stable questions and options preserve the meaning of submitted answers, scores, and reviews. Metadata may follow separate rules, but structural changes must not rewrite history.

### Question 3

**Key:** `locked-demo-003`

**Topic:** Review data

**Difficulty:** medium

**Question:** What data does an answer review need for a submitted single-choice attempt?

**Options:**
- A. Only the quiz title.
- B. Only the learner's email address.
- C. The selected option, correct option, and explanation for each question.
- D. A public list of every user's attempts.

**Correct answer:** C

**Explanation:** A useful review connects each question to the learner's selected option, the correct option, and the explanation. This data is shown only after submission under the existing ownership rules.

### Question 4

**Key:** `locked-demo-004`

**Topic:** Unpublishing with history

**Difficulty:** easy

**Question:** Why might a quiz be unpublished while its old attempts are still preserved?

**Options:**
- A. To delete all historical answers silently.
- B. To make the draft visible in the public catalog.
- C. To allow anyone to edit another user's result.
- D. To stop new public starts while retaining legitimate attempt history.

**Correct answer:** D

**Explanation:** Unpublishing prevents new public starts without erasing legitimate learner history. Existing submitted attempts can still support owned result and review flows.

## 13. Demo Attempt Plan

- Seed one submitted attempt for `demo-user@quizmaster.local` on Java Core Basics with 7 correct answers out of 8.
- Seed one submitted attempt for `demo-user@quizmaster.local` on Locked Demo Quiz with 2 correct answers out of 4.
- Fully answer both attempts through the existing attempt start/submit domain service so scoring, answer rows, result data, and review data use normal invariants.
- Keep `demo-empty@quizmaster.local` at zero attempts.
- Treat manual QA attempt `309` on SQL Basics as local QA history, not seeded data; never modify or use it for seed idempotency.
- Identify seeded attempts by demo user, quiz, and submitted state so repeated seed runs create neither duplicate attempts nor duplicate answers.

## 14. Review Checklist

- [x] Java Core Basics has exactly 8 questions.
- [x] Spring Boot Essentials has exactly 8 questions.
- [x] SQL Basics has exactly 8 questions.
- [x] Networking Fundamentals has exactly 8 questions.
- [x] Software Engineering Basics has exactly 8 questions.
- [x] English for IT Basics has exactly 6 questions.
- [x] Draft — Spring Security Practice has exactly 3 questions and is unpublished.
- [x] Draft — Empty Quiz For Publish Validation has 0 questions and is unpublished.
- [x] Locked Demo Quiz has 4 questions, a submitted attempt, and is unpublished afterward.
- [x] Every question has exactly 4 options.
- [x] Every question declares exactly 1 correct answer.
- [x] Every question has a 1-3 sentence explanation.
- [x] Questions use clear wording and avoid ambiguous answers.
- [x] No question is duplicated.
- [x] No question depends on an exact Java, Spring, or Spring Boot version number.
- [x] Quiz content is consistently written in English.
- [x] No public API behavior is changed by this document.
- [x] The completed content is ready for seeder implementation review.

## 15. Notes for the Seeder

- Preserve each question key as a stable content identifier or lookup key.
- Preserve quiz metadata exactly unless a later content review explicitly changes it.
- Map exactly one option to the correct-answer field for every question.
- Keep option order deterministic so seeded content remains stable across runs.
- Create or update records idempotently using stable account emails, quiz identifiers, and question keys rather than database-generated IDs.
- Hash demo account passwords with the backend's configured password encoder; never persist plaintext passwords.
- Run only behind the approved demo profile or explicit seed property and never by default in test or production.
- Verify that public quiz responses omit correctness and explanations before submission. Do not change API behavior merely to fit the source document.
- Seed all six approved public quizzes and both approved admin drafts without changing their publication status.
