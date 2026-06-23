FROM eclipse-temurin:25-jdk AS build

WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw -B -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw -B clean package -DskipTests

FROM eclipse-temurin:25-jre AS runtime

WORKDIR /app

RUN useradd -r -u 10001 appuser

COPY --from=build /app/target/quizmaster-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

USER appuser

CMD ["sh", "-c", "java ${JAVA_OPTS:-} -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
