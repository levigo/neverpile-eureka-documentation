---
id: tutorial1
title: neverpile eureka tutorial 1
sidebar_label: Tutorial 1
---

The goal of this tutorial is to set up neverpile eureka on a local host to try out the provided API and set up for further development.

## 1. Prerequisites
JDK 1.8+ installed with JAVA_HOME configured appropriately  
Apache Maven 3.5+  
## 2. Installation
Clone the git repository: 
```
git clone https://github.com/levigo/neverpile-eureka-getting-started.git
```
Alternatively, download and extract the repository from [here](https://github.com/levigo/neverpile-eureka-getting-started/archive/master.zip).

## 3. Project structure:
Subject to this tutorial is the module `neverpile-eureka-tutorial-01`.

The project structure is reminiscent of the [standard Maven project structure](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html). Our project structure for the following tutorial is laid out as follows:
```
├── pom.xml                                      - Project Maven pom file.
├── src/main/java/                               - Project Java source directory.
│   └── com/neverpile/eureka/server/             - Tutorial server package name.
│       ├── NeverpileEureka.java                 - Spring start class.
│       └── configuration/                       - Configuration package.
│           ├── GlobalAuthenticationConfig.java  - Server authentication configuration.
|           └── SecurityConfig.java              - Server security configuration.
└── src/main/resources/                          - Static project resources.
    └── application.yml                          - neverpile eureka configuration file.
```


### 3.1 Project dependencies
To include neverpile eureka in your application we recommend the usage of a maven dependency. The maven artifact neverpile-eureka-spring-boot-starter bundles the essential components for running neverpile eureka as a Spring boot application.
```XML
<!-- neverpile -->
<dependency>
    <groupId>com.neverpile</groupId>
    <artifactId>neverpile-eureka-spring-boot-starter</artifactId>
    <version>${neverpile-eureka.version}</version>
</dependency>
```
This starter dependency includes:

- **neverpile-eureka-core** - core functionality of neverpile eureka.
- **neverpile-eureka-bridge-storage-filesystem** - datastore implementation using the native filesystem.
- **neverpile-eureka-security-oauth2** - oauth2 authentication implementation.
- **neverpile-eureka-authorization** - neverpile eureka policy authorization.
- **neverpile-eureka-search-elastic** - elasticsearch index implementation.
- **neverpile-eureka-plugin-metadata** - document metadata support. 
- **neverpile-eureka-plugin-audit** - document audit support.
- **neverpile-eureka-client-webjar** - web server landing page.

The complete pom.xml file:
<details>
  <summary>pom.xml</summary>

```XML
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <parent>
    <artifactId>neverpile-eureka-getting-started</artifactId>
    <groupId>com.neverpile</groupId>
    <version>1.0-SNAPSHOT</version>
  </parent>
  <modelVersion>4.0.0</modelVersion>

  <artifactId>neverpile-eureka-tutorial-01</artifactId>

  <packaging>war</packaging>

  <dependencies>
    <!-- neverpile -->
    <dependency>
      <groupId>com.neverpile</groupId>
      <artifactId>neverpile-eureka-spring-boot-starter</artifactId>
      <version>${neverpile-eureka.version}</version>
    </dependency>
    <!-- Spring (-Boot) -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-jta-atomikos</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-devtools</artifactId>
    </dependency>
    <!-- spring and cassandra version incompatibility -->
    <dependency>
      <groupId>io.dropwizard.metrics</groupId>
      <artifactId>metrics-core</artifactId>
      <version>3.2.2</version>
    </dependency>
    <!-- spring and elastic version incompatibility -->
    <dependency>
      <groupId>org.elasticsearch</groupId>
      <artifactId>elasticsearch</artifactId>
      <version>7.3.1</version>
    </dependency>
    <dependency>
      <groupId>org.elasticsearch.client</groupId>
      <artifactId>elasticsearch-rest-client</artifactId>
      <version>7.3.1</version>
    </dependency>
    <dependency>
      <groupId>org.elasticsearch.client</groupId>
      <artifactId>elasticsearch-rest-high-level-client</artifactId>
      <version>7.3.1</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <version>${spring-boot.version}</version>
      </plugin>

      <plugin>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.2.3</version>
        <configuration>
          <failOnMissingWebXml>false</failOnMissingWebXml>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```
</details>

### 3.2 Project entry point
The server is set up as a spring boot application and therefore needs to be annotated with [`@SpringBootApplication`](https://docs.spring.io/spring-boot/docs/current/reference/html/using-boot-using-springbootapplication-annotation.html).  This annotation sets up this class as an entry point for spring boot.

To enable neverpile eureka on your application annotate the class with `@EnableNeverpileEurekaSpringApplication` to set up all included neverpile modules.

For this tutorial, we enable [swagger](https://swagger.io/) with the annotation `@EnableSwagger2` for an easy way to explore the neverpile eureka API and read up on the included documentation.
```JAVA
@EnableSwagger2
@SpringBootApplication
@EnableNeverpileEurekaSpringApplication
public class NeverpileEureka {

  public static void main(final String[] args) throws Exception {
    new SpringApplication(NeverpileEureka.class).run(args);
  }
}
```
### 3.3 Configuration
The SecurityConfig extends Springs [`WebSecurityConfigurerAdapter`](https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#oauth2login-provide-websecurityconfigureradapter) and manages endpoint security.  
For most security features we use the default behavior defined by Spring Security. (See [here](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/config/annotation/web/builders/HttpSecurity.html))  
In this tutorial, we configure all endpoints with the `/api/` prefix to require an authenticated user.
```JAVA
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  public SecurityConfig() {
    super(true);
  }

  @Override
  public void configure(final HttpSecurity http) throws Exception {
    http
      .addFilter(new WebAsyncManagerIntegrationFilter())
      .securityContext() // Sets up management of the SecurityContext on the SecurityContextHolder between request's.
      .and().headers() // Adds the Security headers to the response.
      .and().exceptionHandling() // Allows configuring exception handling.
      .and().sessionManagement() //Allows configuring of Session Management.
      .and().requestCache() // Allows configuring the Request Cache.
      .and().anonymous() // Allows configuring how an anonymous user is represented.
      .and().authorizeRequests() // Allows restricting access based upon the HttpServletRequest using
        .antMatchers("/api/**") // List of path patterns with any http method
          .authenticated() // Specify that URLs are allowed by any authenticated user.
    ;
  }
}
```
The GlobalAuthenticationConfig extends Springs [`GlobalAuthenticationConfigurerAdapter`](https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#jc-authentication) and manages client authentication.

For this tutorial, we use a simple in-memory authentication enabling an admin and standard user with password and roles.
```JAVA
@Configuration
public class GlobalAuthenticationConfig extends GlobalAuthenticationConfigurerAdapter {
  
  @Override
  public void init(final AuthenticationManagerBuilder auth) throws Exception {
    auth.inMemoryAuthentication()
    .withUser("user")
      .password("{noop}password")
      .roles("USER")
    .and().withUser("admin")
      .password("{noop}admin")
      .roles("USER", "ADMIN");
  }
}
```
At last, we have to configure some properties in the application.yml configuration file:
```YML
spring:
  application:
    name: neverpile eureka (tutorial 01)

management:
  health:
    cassandra.enabled: false
    db.enabled: false
    elasticsearch.enabled: false

neverpile-eureka:
  data-path: data

  bridge:
    storage:
      filesystem:
        rootPath: ${neverpile-eureka.data-path}/objects

  wal:
    directory: ${neverpile-eureka.data-path}/wal

  oauth2:
    embedded-authorization-server:
      enabled: true
      key: "Signing§Key"
```

| Configuration key                                                                                        | Value                                 | Description                                                                                              |
|----------------------------------------------------------------------------------------------------------|---------------------------------------|----------------------------------------------------------------------------------------------------------|
| spring.application.name                                                                                  | neverpile eureka (tutorial 01)        | The application name as String.                                                                          |
| management.health.cassandra.enabled management.health.db.enabled management.health.elasticsearch.enabled | false<br/>false<br/>false                     | Disable default heath indicators form spring. (Health indication is managed by neverpile eureka itself.) |
| neverpile-eureka.data-path                                                                               | data                                  | Directory (./data) for lacal application data to be stored.                                              |
| bridge.storage.filesystem.rootPath                                                                       | ${neverpile-eureka.data-path}/objects | Directory (./data/objects) for local documemt store.                                                     |
| wal.directory                                                                                            | ${neverpile-eureka.data-path}/wal     | Directory (./data/wal) for local transaction logs.                                                       |
| oauth2.embedded-authorization-server.enabled oauth2.embedded-authorization-server.enabled.key            | true "Signing§Key"                    | Enable OAuth2 and set some encryption key. Exemplary key to be replaced.                                 |

## 4. Run the server
### 4.a With IDE
The server can be started, by executing the main class `NeverpileEureka` - including the main method.

<details>
  <summary>Start with IntelliJ</summary>
  

To start up the Application, a new  **Run Configuration** is needed. Under the **Run** > **Edit Configurations...** menu the **Run/Debug Configurations...** menu can be opened. Here you can add a new **Spring Boot** Configuration by pressing the **+**-sign:

![](https://user-images.githubusercontent.com/21142074/68842678-0f1c6880-06c7-11ea-98f5-feed312a1fe1.png)

The configuration is mainly pre-configured  and should look like this:

![](https://user-images.githubusercontent.com/21142074/68842668-0a57b480-06c7-11ea-91e7-6b39b9f81b07.PNG)

Make sure that the following settings are configured properly:

**Main class**: com.neverpile.eureka.server.NeverpileEureka
**classpath**: neverpile-eureka-tutorial-01
**Working directory**: $MODULE_WORKING_DIR$

The newly created configuration can be accessed through the **Run** > **Run** menu to start the application.
</details>

### 4.b With command line
Start a maven build for the project:
```
mvn clean install
```
When the build has finished successfully an executable war file will be created in the target folder in the project root directory. 

This file can now be used to start the server through the command line:
```
java -jar neverpile-eureka-tutorial-01-1.0-SNAPSHOT.war
```

## 5. Finish
With the server running you can now access neverpile eureka through your browser at:

[http://localhost:8080](http://localhost:8080) - landing page

[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) - swagger UI

