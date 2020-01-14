---
id: web-client-setup
title: web client setup
---

neverpile eureka has a built in admin frontend that allows users to directly access to maintenance features, manage user policies, directly upload content of access the connected storage.

This guide describes how to use and configure this web client in your project.

## dependency

Using maven the webjar can be used by including the artefact dependency:

```XML
<dependency>
  <groupId>com.neverpile.eureka.client</groupId>
  <artifactId>neverpile-eureka-client-webjar</artifactId>
</dependency>
```
Also consider using the `neverpile-eureka-spring-boot-starter` dependency which includes the webjar among other useful dependencies when starting a neverpile integration based on spring boot. More on the topic see: [dependency management / BOM](starter-bom.md)

The webjar contains a fully build angular webapp ready to be used for managing the neverpile eureka cluster.
When the webjar is present on the classpath in your spring boot application it will be available when navigating to the server host base path (e.g. localhost:8080/).

## configuration

To configure the webapp for your deployment of neverpile eureka a configuration file can be used to point to various services and define credentials. 

The configuration file is a simple json file located under `/web/configuration.json`.
This file will be loaded dynamically and the settings will applied accordingly.

The webjar has a builtin fallback configuration, which can be used as reference to create your own configuration and looks like this:
```
{
  "neverpileUrl": "http://127.0.0.1:8080",
  "springBootAdminUrl": "http://127.0.0.1:1001",
  "jwtUrl": "http://127.0.0.1:8888",
  "authUsername": "admin",
  "authPassword": "admin",
  "authClientName": "trusted-app",
  "authSecret": "secret",
  "authType": "OAuth2"
}
```
| Configuration key  | Value                      | Description                                          |
|--------------------|----------------------------|------------------------------------------------------|
| neverpileUrl       | "http://\<HOST\>:\<PORT\>" | the neverpile eureka host url with port              |
| springBootAdminUrl | "http://\<HOST\>:\<PORT\>" | the spring boot admin host url with port (if any)    |
| jwtUrl             | "http://\<HOST\>:\<PORT\>" | the jadice webtoolkit host url with port (if any)    |
| authUsername       | "\<USERNAME\>"             | technical username for the webapp                    |
| authPassword       | "\<PASSWORD\>"             | password for the technical user                      |
| authClientName     | "\<CLIENT_NAME\>"          | client name for the OAuth2 flow                      |
| authSecret         | "\<CLIENT_SECRET\>"        | secret for the OAuth2 flow                           |
| authType           | {"basic", "OAuth2"}        | Authentication-type for the authentication against<br/>your neverpile eureka instance. |


For a local development deployment the default configuration may be sufficient, but to accommodate for different deployments and configurations it has to be defined manually.  

