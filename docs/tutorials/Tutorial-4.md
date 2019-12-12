---
id: tutorial4
title: neverpile eureka tutorial 4
sidebar_label: Tutorial 4
---

**IMPORTANT:** This tutorial is made for the use with the commertial product [Jadice Web Toolkit (JWT)](https://jadice.com/produkte/web-toolkit/)



This tutorial is a successor to [tutorial 3](Tutorial-3.md) and aims to provide insight into development integration of the [Jadice Web Toolkit (JWT)](https://jadice.com/produkte/web-toolkit/) based on [google web toolkit (GWT)](http://www.gwtproject.org/) and usage of pre-signed URLs (PSU).

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
Subject to this tutorial is the module `neverpile-eureka-tutorial-04` and `jwt`.

The project structure remains unchanged from tutorial 3.

### 3.1 Project Configuration
For this tutorial, we need  to enable another standard functionality of neverpile eureka: pre-signed URLs.  
These URLs have a limited lifetime and have a built-in authorization to make predefined calls without OAuth 2 authentication.
```YML
neverpile-eureka:
  pre-signed-urls:
    enabled: true
    secret-key: "Not#So%Secret"
    patterns: "/**"
```

| Configuration key                                                                                                                        | Value                                | Description                                                                                                                                           |
|------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| neverpile-eureka.pre-signed-urls.enabled<br/> neverpile-eureka.pre-signed-urls.secret-key<br/> neverpile-eureka.pre-signed-urls.patterns | true<br/><br/> "Not#So%Secret"<br/><br/> "/**"<br/><br/> | enables pre-signed URL functionality.<br/> exemplary secret key for signing the URLs.<br/> URL pattern to enable pre-signed URLs on. |

This added configuration is the only change needed on the main project.

## 4 JWT Implementation
For a more detailed Guide on how to set up JWT, take a look at this Tutorial: [Getting Started - jadice web toolkit](https://levigo.de/info/display/JKB/Getting+Started+-+jadice+web+toolkit) and [Getting Started - jadice web toolkit mit Spring Boot](https://levigo.de/info/display/JKB/Getting+Started+-+jadice+web+toolkit+mit+Spring+Boot).

### 4.1 Project structure
We take the aforementioned tutorial project as a base and add a Javascript API to send a command to the JWT.
```
├── pom.xml						- Project Maven pom file.
├── src/main/java/					- Project Java source directory.
│   └── com/levigo/jwt/					- jwt package-name.
|	├── Application.gwt.xml				- GWT module configuration.
│	├── client/					- Client package.
|       |   └── ApplicationEntryPoint.java		- GWT-entry-point.
│	├── client/api/					- Client API package
|       |   └── JadiceApi.java				- JavaScript API.
│	├── client/ui/					- Client UI package.
|       |   └── JadiceWidget.java			- client GUI component.
│	├── server/					- Server package.
|       |   ├── CorsConfig.java				- CORS configuration.
|       |   └── JadiceServer.java			- Start class for spring boot.
|       ├── server/dataprovider/			- Server data provider package.
|       |   └── UrlDocumentDataProvider.java		- Data provider implementation.
|       └── server/model/				- Server model package.
|           ├── UrlHandle.java				- Page segment handler implementation.
|           └── UrlSource.java				- Data source implementation.
├── src/main/resources/					- Static spring boot resources.
│   └── application.yml					- Spring boot configuration file.
└── src/main/webapp/WEB-INF/				- Web application folder.
    └── web.xml						- Web application configuration file.
```
To expose our API in Javascript we use [JSNI](http://www.gwtproject.org/doc/latest/DevGuideCodingBasicsJSNI.html) to write in native Javascript within our Java file.

```JAVA
public class JadiceApi {

	private PageView pageView;

	public JadiceApi(PageView pageView) {
		this.pageView = pageView;
		exposeJavaScriptApi();
	}

	/**
	 * Loads the document referenced by the passed url.
	 * 
	 * @param url
	 */
	public void loadDocument(final String url) {
		Reader r = new Reader();
		r.append(new UrlSource(url));
		r.complete(new AsyncCallback<Document>() {

			@Override
			public void onSuccess(Document doc) {
				pageView.setDocument(doc);
			}

			@Override
			public void onFailure(Throwable caught) {
				caught.printStackTrace();
				Window.alert("Cant load document from \"" + url + "\".");
			}
		});
	}

	public native void exposeJavaScriptApi() /*-{
		var that = this;

		$wnd.getJadiceApi = function() {
		    return {
					loadDocument: function(url) {
						that.@com.levigo.jwt.client.api.JadiceApi::loadDocument(Ljava/lang/String;)(url);
					}
				}
		}
	}-*/;
}
```
**Constructor**: Saves the page view of the viewer and exposes the Javascript API.

**loadDocument(final String url)**: Takes a URL string, downloads the attached file and displays the document on the page view.

**exposeJavaScriptApi()**: Builds a wrapper function to expose the API with. The wrapper function will be injected in the window variable of the viewer div.
For this example, the only function to expose is the earlier declared loadDocument Function.
The API can be accessed by calling `window.getJadiceApi().loadDocument("<URL>")`.

### 4.2 Injection
The injection of JWT works as follows:  
Through the GWT compiler, a js script is created holding the web application.  
The script is available at `/imageviewer/imageviewer.nocache.js`.  
The script can be added to the webpage the viewer is going to be used on.  
The initial execution of the script searches the dom for the root panel to inject itself into.  
The root panel to place the viewer in is searched via ID and this id is defined in `ApplicationEntryPoint.java`.  
```JAVA
...
RootPanel rootPanel = RootPanel.get("Viewer");
rootPanel.add(jadiceWidget);
...
```
The ID for this tutorial is simply "Viewer".

After the JWT is injected in the page the exposed API will be available under the window variable as described above.

### 4.3 PSU (pre-signed URL) Communication
For applications without OAuth 2 flow support, neverpile eureka can generate pre-signed URLs. These PSUs have a limited lifetime and allow access on a single resource without an authenticated request.
To get a PSU on a resource we have two different methods:

1. Call the resource like normal with an authenticated request and add `?X-NPE-PSU-Duration=<DURATION>` as a URL parameter. The request-response will be the PSU as plain text.
2. If you are unable to send an authenticated request you can pass the credentials via URL parameters like: 
```
?X-NPE-PSU-Credential=<ENC_AUTHORIZATION>  
&X-NPE-PSU-Signature=<SIGNATURE>  
&X-NPE-PSU-Date=<TIMESTAMP>  
&X-NPE-PSU-Expires=<TIMESTAMP>  
&X-NPE-PSU-RequestedPath=<URI_PATH>
```   
In this tutorial, we can generate an Oauth 2 authenticated request to generate resource links for the JWT to download the content without Authentication.

## 5. Run the servers
Now we have configured both neverpile eureka and a JWT server to communicate with each other.
To see the results first start the JWT server and then start the neverpile server.
If successful the neverpile eureka server should use the JWT- Viewer to display PDF documents when opening content under: [http://127.0.0.1:8080/#/archive](http://127.0.0.1:8080/#/archive)

