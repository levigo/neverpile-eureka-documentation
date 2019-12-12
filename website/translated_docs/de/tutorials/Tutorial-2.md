---
id: tutorial2
title: neverpile eureka tutorial 2
sidebar_label: Tutorial 2
---

This tutorial is a successor to [tutorial 1](Tutorial-1.md) and aims to expand your neverpile eureka instance to support communication with a spring boot admin instance and enable health and performance monitoring.

## 1. Prerequisites
JDK 1.8+ installed with JAVA_HOME configured appropriately  
Apache Maven 3.5+
## 2. Installation
Clone the git repository: 
```
git clone https://levigo.de/bitbucket/scm/np/neverpile-eureka-getting-started.git
```

Alternatively, download and extract the repository from [here](https://github.com/levigo/neverpile-eureka-getting-started/archive/master.zip).

## 3. Project structure:
Subject to this tutorial is the module `neverpile-eureka-tutorial-02` and `spring-boot-admin-server`.

The project structure is reminiscent of the [standard Maven project structure](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html). Our project structure for the following tutorial is laid out as follows:
```
├── pom.xml						- Project Maven pom file.
├── src/main/java/					- Project Java source directory.
│   └── com/neverpile/eureka/server/			- Tutorial server package name.
│	├── NeverpileEureka.java			- Spring start class.
│	└── configuration/				- Configuration package.
│	    ├── GlobalAuthenticationConfig.java		- Server authentication configuration.
|           ├── SecurityConfig.java			- Server security configuration.
|           └── SpringBootAdminSecurityConfig.java	- Spring boot admin configuration.
└── src/main/resources/					- Static project resources.
    └── application.yml					- neverpile eureka configuration file.
```

### 3.1 Project dependencies
In addition to the dependencies in the first tutorial, one new dependency was added to enable spring boot admin functionality.
```XML
<dependency>
  <groupId>de.codecentric</groupId>
  <artifactId>spring-boot-admin-starter-client</artifactId>
  <version>2.1.6</version>
</dependency>
```

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

  <artifactId>neverpile-eureka-tutorial-02</artifactId>

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
    <dependency>
      <groupId>de.codecentric</groupId>
      <artifactId>spring-boot-admin-starter-client</artifactId>
      <version>2.1.6</version>
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

### 3.2 Configuration
To configure access to the neverpiles application detect and to register with the spring boot admin server a new configuration file is needed.  
For the spring boot admin server to access the necessary and secured endpoints we have to generate a new user with a corresponding `SBA`(spring boot admin) role.  
The credentials of this user will be passed to the spring boot admin server at startup and will be used by the server for communication with neverpile eureka.  

```JAVA
@Configuration
@Order(98)
public class SpringBootAdminSecurityConfig extends WebSecurityConfigurerAdapter implements MetadataContributor {
  private static final String SBA_USER_NAME = "spring-boot-admin";

  private final String randomPassword;

  public SpringBootAdminSecurityConfig() {
    super(true);
    randomPassword = java.util.UUID.randomUUID().toString();
  }

  @Override
  public void configure(final HttpSecurity http) throws Exception {
    http.requestMatcher(EndpointRequest.toAnyEndpoint()).authorizeRequests() //
        .anyRequest().hasRole("SBA") //
        .and().httpBasic().authenticationEntryPoint(authenticationEntryPoint());
  }

  @Bean
  public AuthenticationEntryPoint authenticationEntryPoint() {
    BasicAuthenticationEntryPoint entryPoint = new BasicAuthenticationEntryPoint();
    entryPoint.setRealmName("admin realm");
    return entryPoint;
  }

  @Bean
  GlobalAuthenticationConfigurerAdapter authConfigurer() {
    return new GlobalAuthenticationConfigurerAdapter() {
      @Override
      public void init(final AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication().withUser(SBA_USER_NAME).password("{noop}" + randomPassword).roles("SBA");
      }
    };
  }

  @Override
  public Map<String, String> getMetadata() {
    HashMap<String, String> metadata = new HashMap<>();
    metadata.put("user.name", SBA_USER_NAME);
    metadata.put("user.password", randomPassword);
    return metadata;
  }
}
```
**Constructor**: disable default behavior and generate a random password.

**configure(final HttpSecurity http)**: configure all incoming request by a spring boot admin user to use the later specified entry point

**authenticationEntryPoint()**: defines the `authenticationEntryPoint` to be used by spring boot admin users.

**authConfigurer()**: register a new in-memory authenticated user for spring boot admin.

**getMetadata()**: define the metadata with the user credentials to be sent to spring boot admin when registering as a new application.

Note: this configuration file has a `\@Order` of `98` defined. This ensures this configuration to have precedence over `SecurityConfig` described in tutorial 1, which has a defined order number of `99`.
(Higher values are interpreted as a lower priority.)
```JAVA
@Configuration
@Order(99)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
...
}
```
The SecurityConfig remains unchanged otherwise.  

At last we have to configure some properties in the application.yml configuration file:
```YML
spring:
  boot.admin.client:
      url: [http://localhost:1001]
      username: admin
      password: admin
  endpoints:
    web:
      exposure:
        include: '*'
  endpoint:
    health:
      show-details: always 
...
```

| Configuration key                                                                             | Value                                       | Description                                                                                                                         |
|-----------------------------------------------------------------------------------------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| spring.boot.admin.client.url spring.boot.admin.client.username spring.boot.admin.client.admin | http://localhost:1001<br/> admin<br/> admin | the URL of the spring boot admin server. demo spring boot admin server user. demo spring boot admin server password.                |
| spring.endpoints.web.exposure.include (spring.endpoints.web.exposure.exclude)                 | *<br/>&nbsp;                                          | exposed application endpoints. (Expose all endpoints for simplicity. please choose the exposed endpoints carefully for production.) |
| spring.endpoint.health.show-details                                                           | always                                      | expose all health details at the health endpoint.                                                                                   |

## 4. Set up spring boot admin
An instance of spring boot admin should be run independently from the neverpile eureka cluster. For this tutorial, the spring boot admin server is included in the getting started repository in its own module `spring-boot-admin-server`.

This spring boot admin server implementation is exemplary and can be substituted for any other deployment with the same version.

### 4.1 Project structure
The project structure and setup is similar to the neverpile eureka.
```
├── pom.xml					- Project Maven pom file.
├── src/main/java/				- Project Java source directory.
│   └── com/levigo/springbootserver/		- Tutorial server package name.
│	├── SpringBootAdminServer.java		- Spring start class.
│	└── SecurityConfig.java			- Security configuration file.
└── src/main/resources/				- Static project resources.
    └── application.yml				- Spring boot admin configuration file.
```
### 4.1.1 Project dependencies
We use springs own security framework and the spring boot UI from codecentric in this tutorial:

```XML
<dependency>
	<groupId>de.codecentric</groupId>
	<artifactId>spring-boot-admin-starter-server</artifactId>
	<version>2.1.6</version>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-security</artifactId>
</dependency>
```
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

	<artifactId>spring-boot-admin-server</artifactId>

	<packaging>jar</packaging>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>de.codecentric</groupId>
			<artifactId>spring-boot-admin-starter-server</artifactId>
			<version>2.1.6</version>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<executions>
					<execution>
						<goals>
							<goal>repackage</goal>
							<goal>build-info</goal>
						</goals>
					</execution>
				</executions>
				<configuration>
					<mainClass>com.levigo.springbootadmin.SpringBootAdminServer</mainClass>
					<addResources>true</addResources>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>
```
</details>

### 4.1.2 Project entry point
The server is set up as a spring boot application and therefore needs to be annotated with `@SpringBootApplication`.  This annotation sets up this class as an entry point for spring boot.  
To enable spring boot admin on your application annotate the class with `@EnableAdminServer`.
```JAVA
@EnableAdminServer
@SpringBootApplication
public class SpringBootAdminServer {

  public static void main(final String[] args) {
    SpringApplication.run(SpringBootAdminServer.class, args);
  }
}
```
### 4.1.3 Configuration
The `SecurityConfig` is similar to the config used in neverpile eureka and defines access rules for the spring boot admin server:
```JAVA
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  private final String adminContextPath;

  public SecurityConfig(final AdminServerProperties adminServerProperties) {
    super(false);
    this.adminContextPath = adminServerProperties.getContextPath();
  }

  @Override
  protected void configure(final HttpSecurity http) throws Exception {
      SavedRequestAwareAuthenticationSuccessHandler successHandler = new SavedRequestAwareAuthenticationSuccessHandler();
      successHandler.setTargetUrlParameter("redirectTo");
      http.authorizeRequests()
          .antMatchers(adminContextPath + "/assets/**").permitAll()
          .antMatchers(adminContextPath + "/login").permitAll()
          .anyRequest().authenticated()
          .and()
      .formLogin().loginPage(adminContextPath + "/login").successHandler(successHandler).and()
      .logout().logoutUrl(adminContextPath + "/logout").and()
      .httpBasic().and()
      .csrf().disable();
  }

  @Override
  public void configure(final WebSecurity web) throws Exception {
    web.ignoring().antMatchers(HttpMethod.OPTIONS);
  }

  @Bean
  public FilterRegistrationBean<CorsFilter> corsFilterRegistrationBean() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();
    config.applyPermitDefaultValues();
    config.setAllowCredentials(true);
    config.setAllowedOrigins(Collections.singletonList("*"));
    config.setAllowedHeaders(Collections.singletonList("*"));
    config.setAllowedMethods(Collections.singletonList("*"));
    config.setExposedHeaders(Collections.singletonList("content-length"));
    config.setMaxAge(3600L);
    source.registerCorsConfiguration("/**", config);
    FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
    bean.setOrder(0);
    return bean;
  }
}
```
**Constructor**: enable default behavior and save injected adminServerProperties.

**configure(final HttpSecurity http)**: configure endpoints to the login page and HTML assets to be freely accessible and all other endpoints to require an authenticated user. Also, manage redirects for login and logout calls.

**configure(final WebSecurity web)**: ignore Requests with `OPTION` Method for Browser preflights requests.

**corsFilterRegistrationBean()**: Cors filter to allow requests from all origins.



At last, we have to configure some properties in the application.yml configuration file:
```YML
spring:
  application:
    name: spring-boot-admin
  security:
    user:
      name: "admin"
      password: "admin"
  
server:
  port: 1001
```

| Configuration key                                       | Value                | Description                                                                                      |
|---------------------------------------------------------|----------------------|--------------------------------------------------------------------------------------------------|
| spring.application.name                                 | spring-boot-admin    | The application name as String.                                                                  |
| spring.security.user.name spring.security.user.password | "admin"<br/> "admin" | Demo username for spring boot admin server. Password for demo user for spring boot admin server. |
| server.port                                             | 1001                 | Override the default port 8080.                                                                  |

## 5. Run the servers
Now we have configured both neverpile eureka and a spring boot admin server to communicate with each other.

To see the results first start the spring boot admin server and then start the neverpile server.

If successful the neverpile eureka server should log `Application registered itself as <ID>`. (This may take a view seconds.)

To test the cluster functionality of neverpile eureka you can start multiple instances of neverpile eureka and monitor the cluster through spring boot admin.

To run multiple instances on the same host for testing purposes the instances have to use different ports. to change the used port on your spring boot application you can start the application with the `-Dserver.port=<PortNo>` flag.

## 6. Finish
With both servers running you can now access spring boot admin through your browser at:

[http://localhost:1001](http://localhost:1001) - login page

and login with user "admin" and password "admin".

