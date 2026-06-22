package com.quizmaster.demo;

import com.quizmaster.category.Category;
import com.quizmaster.category.CategoryRepository;
import com.quizmaster.quiz.Option;
import com.quizmaster.quiz.OptionRepository;
import com.quizmaster.quiz.Question;
import com.quizmaster.quiz.QuestionRepository;
import com.quizmaster.quiz.Quiz;
import com.quizmaster.quiz.QuizRepository;
import com.quizmaster.user.User;
import com.quizmaster.user.UserRepository;
import com.quizmaster.user.UserRole;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_PASSWORD = "password123";

    private static final List<DemoUser> USERS = List.of(
            new DemoUser("demo-admin@quizmaster.local", UserRole.ADMIN),
            new DemoUser("demo-user@quizmaster.local", UserRole.USER),
            new DemoUser("demo-empty@quizmaster.local", UserRole.USER)
    );

    private static final Map<String, String> CATEGORIES = categoryDefinitions();
    private static final List<DemoQuiz> QUIZZES = quizDefinitions();

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        LOGGER.info("Demo data seed enabled; checking local demo data");

        seedUsers();
        Map<String, Category> categoriesBySlug = seedCategories();
        seedQuizzes(categoriesBySlug);

        LOGGER.info("Demo data seed completed");
    }

    private void seedUsers() {
        for (DemoUser demoUser : USERS) {
            if (userRepository.findByEmail(demoUser.email()).isPresent()) {
                continue;
            }

            User user = new User();
            user.setEmail(demoUser.email());
            user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            user.setRole(demoUser.role());
            userRepository.save(user);
            LOGGER.info("Created demo user {}", demoUser.email());
        }
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> categoriesBySlug = new LinkedHashMap<>();

        CATEGORIES.forEach((slug, name) -> {
            Category category = categoryRepository.findBySlug(slug)
                    .orElseGet(() -> createCategory(name, slug));
            categoriesBySlug.put(slug, category);
        });

        return categoriesBySlug;
    }

    private Category createCategory(String name, String slug) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        Category savedCategory = categoryRepository.save(category);
        LOGGER.info("Created demo category {}", name);
        return savedCategory;
    }

    private void seedQuizzes(Map<String, Category> categoriesBySlug) {
        for (DemoQuiz demoQuiz : QUIZZES) {
            Category category = categoriesBySlug.get(demoQuiz.categorySlug());
            if (category == null) {
                throw new IllegalStateException("Missing demo category: " + demoQuiz.categorySlug());
            }

            if (quizRepository.findByTitleAndCategoryId(demoQuiz.title(), category.getId()).isPresent()) {
                LOGGER.info("Demo quiz already exists; skipping content for {}", demoQuiz.title());
                continue;
            }

            validateQuiz(demoQuiz);
            createQuiz(demoQuiz, category);
        }
    }

    private void createQuiz(DemoQuiz demoQuiz, Category category) {
        Quiz quiz = new Quiz();
        quiz.setCategory(category);
        quiz.setTitle(demoQuiz.title());
        quiz.setDescription(demoQuiz.description());
        quiz.setTimeLimitMinutes(demoQuiz.timeLimitMinutes());
        quiz.setPublished(true);
        Quiz savedQuiz = quizRepository.save(quiz);

        for (int questionIndex = 0; questionIndex < demoQuiz.questions().size(); questionIndex++) {
            createQuestion(savedQuiz, demoQuiz.questions().get(questionIndex), questionIndex + 1);
        }

        LOGGER.info("Created demo quiz {} with {} questions", demoQuiz.title(), demoQuiz.questions().size());
    }

    private void createQuestion(Quiz quiz, DemoQuestion demoQuestion, int displayOrder) {
        Question question = new Question();
        question.setQuiz(quiz);
        question.setContent(demoQuestion.content());
        question.setExplanation(demoQuestion.explanation());
        question.setDisplayOrder(displayOrder);
        Question savedQuestion = questionRepository.save(question);

        List<Option> options = java.util.stream.IntStream.range(0, demoQuestion.options().size())
                .mapToObj(optionIndex -> createOption(
                        savedQuestion,
                        demoQuestion.options().get(optionIndex),
                        optionIndex,
                        demoQuestion.correctOptionIndex()
                ))
                .toList();
        optionRepository.saveAll(options);
    }

    private Option createOption(
            Question question,
            String content,
            int optionIndex,
            int correctOptionIndex
    ) {
        Option option = new Option();
        option.setQuestion(question);
        option.setContent(content);
        option.setCorrect(optionIndex == correctOptionIndex);
        option.setDisplayOrder(optionIndex + 1);
        return option;
    }

    private void validateQuiz(DemoQuiz quiz) {
        if (quiz.questions().size() != 8) {
            throw new IllegalStateException("Demo quiz must have exactly 8 questions: " + quiz.title());
        }

        for (DemoQuestion question : quiz.questions()) {
            if (question.options().size() != 4) {
                throw new IllegalStateException("Demo question must have exactly 4 options: " + question.key());
            }
            if (question.correctOptionIndex() < 0 || question.correctOptionIndex() >= question.options().size()) {
                throw new IllegalStateException("Demo question has an invalid correct option: " + question.key());
            }
            if (question.explanation().isBlank()) {
                throw new IllegalStateException("Demo question must have an explanation: " + question.key());
            }
        }
    }

    private static Map<String, String> categoryDefinitions() {
        Map<String, String> categories = new LinkedHashMap<>();
        categories.put("java-core", "Java Core");
        categories.put("spring-boot", "Spring Boot");
        categories.put("sql-database", "SQL & Database");
        categories.put("computer-networking", "Computer Networking");
        categories.put("software-engineering", "Software Engineering");
        categories.put("english-for-it", "English for IT");
        return Map.copyOf(categories);
    }

    private static List<DemoQuiz> quizDefinitions() {
        return List.of(
                new DemoQuiz(
                        "Java Core Basics",
                        "java-core",
                        "Review essential Java runtime, type system, object-oriented, exception, collection, and String concepts.",
                        10,
                        javaCoreQuestions()
                ),
                new DemoQuiz(
                        "Spring Boot Essentials",
                        "spring-boot",
                        "Review common Spring Boot application structure, REST, validation, persistence, and security concepts.",
                        10,
                        springBootQuestions()
                )
        );
    }

    private static List<DemoQuestion> javaCoreQuestions() {
        return List.of(
                question(
                        "java-core-001",
                        "What is the main role of the JVM in a Java application?",
                        1,
                        "The JVM provides the runtime environment that executes Java bytecode on a particular platform. The Java compiler, which is included in the JDK, compiles source code into bytecode.",
                        "It edits Java source files.",
                        "It executes Java bytecode on a specific platform.",
                        "It stores application data in relational tables.",
                        "It converts HTTP requests directly into SQL queries."
                ),
                question(
                        "java-core-002",
                        "Which variable is declared with a Java primitive type?",
                        2,
                        "`int` is one of Java's primitive types. `String`, `Integer`, and `List` are reference types.",
                        "String name = \"QuizMaster\";",
                        "Integer score = 10;",
                        "int questionCount = 8;",
                        "List<String> topics = new ArrayList<>();"
                ),
                question(
                        "java-core-003",
                        "In object-oriented Java, what is an object?",
                        0,
                        "A class defines structure and behavior, while an object is a concrete instance of that class. Multiple objects can be created from the same class.",
                        "An instance created from a class.",
                        "A package that contains source files.",
                        "A keyword used to handle exceptions.",
                        "A compiler option that creates bytecode."
                ),
                question(
                        "java-core-004",
                        "Which keyword declares that one Java class inherits from another class?",
                        2,
                        "A class uses `extends` to inherit accessible fields and methods from another class. `implements` is used when a class fulfills an interface contract.",
                        "implements",
                        "imports",
                        "extends",
                        "inherits"
                ),
                question(
                        "java-core-005",
                        "Which declaration correctly states that `EmailService` fulfills the `NotificationService` interface contract?",
                        1,
                        "A Java class uses the `implements` keyword to declare that it fulfills an interface contract. `extends` is used for class inheritance or for one interface extending another interface.",
                        "class EmailService extends NotificationService",
                        "class EmailService implements NotificationService",
                        "class EmailService imports NotificationService",
                        "class EmailService inherits NotificationService"
                ),
                question(
                        "java-core-006",
                        "What is the purpose of a `catch` block in Java?",
                        2,
                        "A `catch` block handles an exception type that matches an exception thrown while its associated `try` block runs. This lets the program respond to the error instead of leaving it unhandled at that point.",
                        "To declare a new class.",
                        "To repeat a block until no exception occurs.",
                        "To handle a matching exception thrown by its associated `try` block.",
                        "To prevent the compiler from creating bytecode."
                ),
                question(
                        "java-core-007",
                        "Which Java collection interface is designed to contain no duplicate elements?",
                        2,
                        "A `Set` models a collection of unique elements and does not allow duplicate elements according to its equality rules. A `List` can contain duplicates.",
                        "List",
                        "Queue",
                        "Set",
                        "Deque"
                ),
                question(
                        "java-core-008",
                        "Given `String title = \"Java\";`, what happens when `title.concat(\" Basics\")` is called without assigning its result?",
                        1,
                        "`String` objects are immutable, so `concat` returns a new `String` rather than modifying the original one. Without assigning the returned value, `title` still refers to `\"Java\"`.",
                        "title becomes \"Java Basics\".",
                        "title remains \"Java\" because String objects are immutable.",
                        "title becomes null.",
                        "The code fails to compile because concat cannot accept text."
                )
        );
    }

    private static List<DemoQuestion> springBootQuestions() {
        return List.of(
                question(
                        "spring-boot-001",
                        "What does `@SpringBootApplication` commonly provide on the main application class?",
                        0,
                        "`@SpringBootApplication` combines key annotations that enable configuration, component scanning, and Spring Boot auto-configuration. It does not automatically define application-specific persistence or security behavior.",
                        "A combination of configuration, component scanning, and auto-configuration support.",
                        "Automatic creation of every database table without JPA configuration.",
                        "Authentication for every endpoint without security configuration.",
                        "Conversion of every class into a REST controller."
                ),
                question(
                        "spring-boot-002",
                        "Which example uses constructor injection for an `AttemptService` dependency?",
                        0,
                        "Constructor injection supplies a dependency through the receiving class's constructor. This makes required dependencies explicit and allows the Spring container to provide the managed bean.",
                        "QuizController(AttemptService attemptService) { this.attemptService = attemptService; }",
                        "AttemptService attemptService = new AttemptService() inside every controller method.",
                        "A static global variable initialized by the controller.",
                        "A database column named attemptService."
                ),
                question(
                        "spring-boot-003",
                        "Which responsibility assignment best matches a typical layered Spring Boot application?",
                        0,
                        "In a typical layered design, controllers manage the HTTP boundary, services contain or coordinate business rules, and repositories provide data access. This separation keeps responsibilities clear and easier to test.",
                        "Controllers handle HTTP input, services coordinate business logic, and repositories access persistent data.",
                        "Repositories render web pages, controllers create database schemas, and services only hold constants.",
                        "Services handle CSS, repositories validate JWT signatures, and controllers manage database files directly.",
                        "Controllers perform every responsibility so services and repositories are unnecessary."
                ),
                question(
                        "spring-boot-004",
                        "What is the usual purpose of `@RestController` in Spring MVC?",
                        0,
                        "`@RestController` marks a web controller whose handler return values are written to the response body, commonly as JSON. It combines controller semantics with response-body behavior.",
                        "To mark a class whose handler return values are written to the HTTP response body.",
                        "To mark a class as a database entity.",
                        "To schedule every method to run periodically.",
                        "To encrypt all response fields automatically."
                ),
                question(
                        "spring-boot-005",
                        "Why is a DTO often used at a REST API boundary?",
                        0,
                        "A DTO defines the data accepted or returned by an API and decouples that contract from persistence entities. It can also limit exposed fields and provide a focused place for input constraints.",
                        "To define an explicit request or response shape without exposing the persistence entity directly.",
                        "To replace the database engine.",
                        "To make all fields globally writable.",
                        "To disable input validation."
                ),
                question(
                        "spring-boot-006",
                        "In a configured Spring MVC application, what is the purpose of placing `@Valid` on a request DTO parameter?",
                        0,
                        "`@Valid` requests validation of the bound DTO using its declared constraints, such as `@NotBlank`. The application can then reject invalid input through its configured error-handling flow.",
                        "To trigger validation of the DTO against its declared validation constraints.",
                        "To save the DTO to the database automatically.",
                        "To convert the endpoint into an admin-only endpoint.",
                        "To skip deserialization of the request body."
                ),
                question(
                        "spring-boot-007",
                        "What does extending `JpaRepository<Quiz, Long>` primarily provide?",
                        0,
                        "`JpaRepository` provides common repository operations such as saving, finding, and deleting entities. The generic parameters identify the entity type and its identifier type.",
                        "Common persistence operations for Quiz entities with Long identifiers.",
                        "Automatic REST authentication for quiz endpoints.",
                        "A frontend component for displaying quizzes.",
                        "Automatic generation of quiz questions by AI."
                ),
                question(
                        "spring-boot-008",
                        "When a client sends a JWT to access a protected endpoint, what should the backend do before treating the request as authenticated?",
                        1,
                        "The backend must validate the token's integrity and relevant claims before establishing authentication for the request. A token should not be trusted merely because it has the expected text fields.",
                        "Trust every token that contains an email address.",
                        "Validate the token, including its signature and relevant claims such as expiration.",
                        "Store the user's plaintext password inside the token.",
                        "Disable authorization checks for the request."
                )
        );
    }

    private static DemoQuestion question(
            String key,
            String content,
            int correctOptionIndex,
            String explanation,
            String... options
    ) {
        return new DemoQuestion(key, content, List.of(options), correctOptionIndex, explanation);
    }

    private record DemoUser(String email, UserRole role) {
    }

    private record DemoQuiz(
            String title,
            String categorySlug,
            String description,
            int timeLimitMinutes,
            List<DemoQuestion> questions
    ) {
    }

    private record DemoQuestion(
            String key,
            String content,
            List<String> options,
            int correctOptionIndex,
            String explanation
    ) {
    }
}
