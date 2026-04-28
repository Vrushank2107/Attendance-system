# Use official Eclipse Temurin OpenJDK 17 runtime as a parent image
FROM eclipse-temurin:17-jdk-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the pom.xml file first to leverage Docker layer caching
COPY pom.xml .

# Copy the Maven wrapper and project files
COPY mvnw .
COPY .mvn .mvn
COPY src ./src

# Make the Maven wrapper executable
RUN chmod +x ./mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose the port the app runs on
EXPOSE 8080

# Run the jar file
CMD ["java", "-jar", "target/attenx-backend-1.0.0.jar"]
