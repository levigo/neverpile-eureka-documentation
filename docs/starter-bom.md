---
id: starter-bom
title: dependency management / BOM
---

nerverpile eureka has a very modular structure and allows the developers to pick and choose modules freely.

## BOM

To prevent issues with version conflicts between these modules a [BOM dependency](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html) is used. 
neverpile eureka prepares two different BOM's for development with and without spring boot.
Whereas the spring boot BOM expands the basic BOM.
```XML
<dependency>
  <groupId>com.neverpile.eureka</groupId>
  <artifactId>neverpile-eureka-bom</artifactId>
</dependency>
```
```XML
<dependency>
  <groupId>com.neverpile.eureka</groupId>
  <artifactId>neverpile-eureka-spring-boot-bom</artifactId>
</dependency>
```
These two dependencies are only used for dependency management and do not add any transitive dependencies by itself.
When included in your project POM the version tags for all neverpile eureka modules can be omitted. When using the spring boot version all artefact versions for spring boot modules can also be left out.

## Starter

For an easy start in development with spring boot and eureka there is a starter dependency which includes the eureka-spring-boot-bom and some useful spring eureka modules for getting started wth development by only using a single dependency. 

```XML
<dependency>
  <groupId>com.neverpile.eureka</groupId>
  <artifactId>neverpile-eureka-spring-boot-starter</artifactId>
</dependency>
```

This starter dependency includes:

- **neverpile-eureka-core** - core functionality of neverpile eureka.
- **neverpile-eureka-bridge-storage-filesystem** - datastore implementation using the native filesystem.
- **neverpile-eureka-authorization** - neverpile eureka policy authorization.
- **neverpile-eureka-search-elastic** - elasticsearch index implementation.
- **neverpile-eureka-plugin-metadata** - document metadata support. 
- **neverpile-eureka-plugin-audit** - document audit support.
- **neverpile-eureka-client-webjar** - web server landing page.
- **neverpile-openapi** - Open-API module to generate a Swagger API definition.

