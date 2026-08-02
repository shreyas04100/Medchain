FROM maven:3.9.8-eclipse-temurin-17 AS builder
WORKDIR /workspace
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -B -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/backend/target/backend-1.0.0-SNAPSHOT.jar /app/app.jar
EXPOSE 8081
ENV PORT=8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
