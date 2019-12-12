---
id: tutorial3
title: neverpile eureka tutorial 3
sidebar_label: Tutorial 3
---

This tutorial is a successor to [tutorial 2](Tutorial-2.md) and aims to provide insight into development with neverpile eureka. We expand the core functionality of neverpile eureka by implementing our own Plugin. This will give insight on how to add specific functionality beyond the core features.

## 1. Prerequisites

JDK 1.8+ installed with JAVA_HOME configured appropriately  
Apache Maven 3.5+

## 2. Installation

Clone the git repository: 
```
git clone https://levigo.de/bitbucket/scm/np/neverpile-eureka-getting-started.git
```
Alternatively, download and extract the repository from [here](https://github.com/levigo/neverpile-eureka-getting-started/archive/master.zip)..

## 3. Project structure:

Subject to this tutorial is the module `neverpile-eureka-tutorial-03` and `neverpile-eureka-my-plugin`.

The project structure remains unchanged from tutorial 2.

### 3.1 Project dependencies
This time we add our own plugin, described next in this tutorial, as a dependency:
```XML
<dependency>
    <groupId>com.neverpile</groupId>
    <artifactId>neverpile-eureka-my-plugin</artifactId>
    <version>1.0-SNAPSHOT</version>
</dependency>
```
This added dependency is the only change needed to enable additional functionality  for neverpile eureka. All configuration and injection of additional plugins are handled by [springs auto configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/using-spring-boot.html#using-boot-auto-configuration).


## 4 Plugin Scenairo

For our first plugin, we construct a spimple scenario: An already established CRM system is present in our environment and we want to use information from this system to enrich the document request response made through neverpile eureka. For this tutorial we create a simple mock to emulate this external system as a datastore with some customer records.

## 5 Plugin Project structure

The project structure and setup is similar to the neverpile eureka.
```
├── pom.xml						- Project Maven pom file.
├── src/main/java/					- Project Java source directory.
│   └── com/neverpile/eureka/myplugin/			- Tutorial plugin package name.
|	├── MyCRMFacet.java				- CRM facet to expand a document.
|	├── MyCRM.java					- Interface to simulate a CRM system.
|	├── MockMyCRMImpl.java				- Mock imlementation of our CRM system
|	├── CustomerInfoRecord.java			- CRM information record.
│	└── config/					- configuration package.
|	    └── MyPluginAutoConfiguration.java		- main plugin configuration file.
└── src/main/resources/					- Static project resources.
    └── META-INF/					- Spring boot admin configuration file.
	└── application.yml				- Spring boot admin configuration file.
```
### 5.1 Plugin Project dependencies

We only need the neverpile eureka core dependency to start implementing our plugin:

```XML
<dependency>
  <groupId>com.neverpile</groupId>
  <artifactId>neverpile-eureka-core</artifactId>
</dependency>
```
The complete pom.xml file:
<details>
  <summary>pom.xml</summary>
```XML
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <artifactId>neverpile-eureka-getting-started</artifactId>
    <groupId>com.neverpile</groupId>
    <version>1.0-SNAPSHOT</version>
  </parent>

  <artifactId>neverpile-eureka-my-plugin</artifactId>
  <groupId>com.neverpile</groupId>

  <dependencies>
    <dependency>
      <groupId>com.neverpile</groupId>
      <artifactId>neverpile-eureka-core</artifactId>
      <version>${neverpile-eureka.version}</version>
    </dependency>
  </dependencies>
</project>
```
</details>

### 5.2 Plugin Configuration
To use Springs auto-configuration functionality we define a autoconfiguration factory to link to our main configuration file for the plugin.
```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\  
com.neverpile.eureka.myplugin.config.MyPluginAutoConfiguration
```
In the auto configuration file, we have the possibility to define beans to replace default behavior or configure other settings.

For this tutorial, we keep it as simple as possible and our configuration is only used to define the configuration scan, for spring to discover our newly implemented classes:
```JAVA
@Configuration
@ComponentScan(basePackageClasses = {MyCRMFacet.class, MockMyCRMImpl.class})
public class MyPluginAutoConfiguration { }
```

### 5.3 Facet Implementation
To expand the information provided by a call to the Eureka API we use a DocumentFacet.  
To implement a Facet we implement the `DocumentFacet` interface.  
This interface only requires two functions to be implemented for the Facet to work: `getName` and `getValueType`, all other functionality has built-in default behavior which can be overwritten.  
The main tool to implement our functionality is to use the document lifecycle hooks (`beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `onDelete`, `onRetrieve`).  
Another functionality we are going to implement is a validation mechanic to veto on an API call (`validateCreate`, `validateUpdate`, `validateDelete`).  
The CRM implementation will be injected via `@Autowired`.
```JAVA
@Component
public class MyCRMFacet implements DocumentFacet<CustomerInfoRecord> {
  @Autowired
  private MyCRM crm;

  @Override
  public String getName() {
    return "myCRM";
  }

  @Override
  public JavaType getValueType(final TypeFactory f) {
    return f.constructType(CustomerInfoRecord.class);
  }

  @Override
  public Set<ConstraintViolation> validateCreate(DocumentDto requestDto) {
    String customerId = getCustomerIdFromDto(requestDto);
    if (!crm.isCustomerIdValid(customerId)) {
      return ConstraintViolation.fail(this, "Invalid customer ID: " + customerId);
    }
    return ConstraintViolation.none();
  }

  @Override
  public void beforeCreate(Document toBeCreated, DocumentDto requestDto) {
    String customerId = getCustomerIdFromDto(requestDto);
    crm.associateCustomerDocument(customerId, toBeCreated.getDocumentId());
  }

  @Override
  public void afterCreate(Document persisted, DocumentDto responseDto) {
    onRetrieve(persisted, responseDto);
  }

  @Override
  public void onRetrieve(final Document document, final DocumentDto dto) {
    dto.setFacet(getName(), crm.getCustomerInfo(document.getDocumentId()));
  }

  @Override
  public void onDelete(Document currentDocument){
    crm.removeDocumentAssociation(currentDocument.getDocumentId());
  }

  private String getCustomerIdFromDto(DocumentDto dto) {
    return dto.getFacetData(this).orElseThrow(
        () -> new InvalidParameterException("DTO must have customer-ID!")).getCustomerId();
  }
}
```
**getName()**: return the name of the Facet must be unique.

**getValueType(TypeFactory)**: Using a Jackson TypeFactory to return a JavaType. This is used for serialization of your facet data. In our case, the `CustomerInfoRecord` class is used.

**validateCreate(DocumentDto)**: Here we have the ability to veto on the API call. In our case, we check if the call contains a customer ID and whether it is valid. Otherwise, we reject the call and return a  `ConstraintViolation`.

**beforeCreate(Document, DocumentDto)**: At this point, we can tell our CRM system that there will be a new document for our customer.

**afterCreate(Document, DocumentDto)**: After creation, the new document will be returned to the API caller so we use the `onRetrieve` function to prevent redundancy.

**onRetrieve(Document, DocumentDto)**: On retrieve we use the document ID to ask the CRM system to give us the customer information to add to the returned document.

5.4 CRM Implementation
The CRM interface is an exemplary interface to communicate with another system:
```JAVA
public interface MyCRM {
  public CustomerInfoRecord getCustomerInfo(String documentId);

  boolean isCustomerIdValid(String customerId);

  void associateCustomerDocument(String customerId, String documentId);

  void removeDocumentAssociation(String documentId);
}
```
**getCustomerInfo(String)**: Returns a `CustomerInfoRecord ` dependent on the document ID.

**isCustomerIdValid(String)**: Checks if the customer Id exists or is otherwise valid.

**associateCustomerDocument(String, String)**: This method is called when a new document gets associated with a customer.

**removeDocumentAssociation(String)**: This method disassociates a document from its user.


For our tutorial, we implement this interface with a mock implementation (`MockMyCRMImpl`).

This mock has only two customers with the IDs `0` and `1`.

<details>
  <summary>MockMyCRMImpl.java</summary>

```JAVA
@Component
public class MockMyCRMImpl implements MyCRM {

  Map<String, CustomerInfoRecord> mockCustomerInfo;
  Map<String, String> mockDocumentInfo;

  public MockMyCRMImpl() {
    this.mockCustomerInfo = new HashMap<>();
    mockCustomerInfo.put("0", generateCustomerInfo("0"));
    mockCustomerInfo.put("1", generateCustomerInfo("1"));
    this.mockDocumentInfo = new HashMap<>();
  }

  @Override
  public CustomerInfoRecord getCustomerInfo(String documentId) {
    return mockCustomerInfo.get(mockDocumentInfo.get(documentId));
  }

  @Override
  public boolean isCustomerIdValid(String customerId) {
    return mockCustomerInfo.containsKey(customerId);
  }

  @Override
  public void associateCustomerDocument(String customerId, String documentId) {
    mockDocumentInfo.put(documentId, customerId);
  }

  @Override
  public void removeDocumentAssociation(String documentId) {
    mockDocumentInfo.remove(documentId);
  }

  private CustomerInfoRecord generateCustomerInfo(String id) {
    CustomerInfoRecord record = new CustomerInfoRecord();
    record.setCustomerId(id);
    record.setAddress(id.equals("0") ? "Bebelsbergstraße 31 - 71088 Holzgerlingen" : "Haupstraße 1 - 10827 Berlin");
    record.setFirstName(id.equals("0") ? "Luigi" : "Max");
    record.setLastName(id.equals("0") ? "Levigo" : "Mustermann");
    return record;
  }
}
```
</details>

To work with our Customer info and aid with communication between the Facet and our CRM implementation we define a simple data Object with fields for  `customerId`, `firstName`, `lastName` and `address`.

<details>
  <summary>CustomerInfoRecord.java</summary>

```JAVA
public class CustomerInfoRecord {
  private String customerId;

  private String firstName;
  private String lastName;
  private String address;

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getCustomerId() {
    return customerId;
  }

  public void setCustomerId(String customerId) {
    this.customerId = customerId;
  }
}
```
</details>

## 6. Test the results
Start the Eureka server as described in previous tutorials.

To easily test the results we recommend to use an API-testing Software like [postman](https://www.getpostman.com/).

1. First, you have to get an authentification token:  
In the **authorization  **tab choose OAuth2.0 as your **type **-> klick **get new access token**

![](https://user-images.githubusercontent.com/21142074/68847582-3414d980-06cf-11ea-85e7-a2ef1a316a51.png)

2. For your **grant type** select **password credentials** and fill in the information as shown in the picture.
When all information is filled in click **request token**

![](https://user-images.githubusercontent.com/21142074/68847601-3b3be780-06cf-11ea-8a85-f0db098260fe.png)

3. If successful a new token is generated and you can click use token.

![](https://user-images.githubusercontent.com/21142074/68847611-3e36d800-06cf-11ea-9a5c-cfbf0da5d34c.png)

4. Now the Token is set you can build your API request:  
Choose the HTTP-Method **POST **and type in the URL `localhost:8080/api/v1/documents/`

![](https://user-images.githubusercontent.com/21142074/68847622-4131c880-06cf-11ea-899a-f8d3b5f13d02.png)

5. In the **body **tab choose **raw **-> then choose **JSON  **
In the body editor paste the following JSON object containing a document ID and a customer ID under the myCRM facet:
```
{
    "documentId": "00000000-0000-0000-0000-000000000001",
    "myCRM": {"customerId": "0"}
}
```
![](https://user-images.githubusercontent.com/21142074/68847633-442cb900-06cf-11ea-905d-95c73f9bcc12.png)

6. Now click send and the result should look similar to this:

![](https://user-images.githubusercontent.com/21142074/68848071-f3699000-06cf-11ea-9786-ca9b498f3f55.png)

The customer information has been added to your response DTO.


