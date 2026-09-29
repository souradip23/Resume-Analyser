# =========================
# 1. Build React frontend
# =========================
FROM node:22 AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

RUN npm run build


# =========================
# 2. Build Spring Boot
# =========================
FROM maven:3.9.5-eclipse-temurin-21 AS backend-build

WORKDIR /app

COPY pom.xml .

COPY src ./src

# Copy React production build
COPY --from=frontend-build /src/main/resources/static ./src/main/resources/static

RUN mvn clean package -DskipTests


# =========================
# 3. Run application
# =========================
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]