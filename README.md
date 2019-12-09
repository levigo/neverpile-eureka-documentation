# neverpile eureka - documentation
The documentation can be found [here](https://levigo.github.io/neverpile-eureka-documentation/)  
This is the documentation Project for neverpile eureka.  
We use  [Hugo](https://gohugo.io/) in combination with the  [Docsy](https://github.com/google/docsy) theme to generate a documentation page powered by [GitHub Pages](https://pages.github.com/).

## Set up the project

This project contains the [Docsy](https://github.com/google/docsy) theme as a Git submodule a per convention to run themes on hugo. Therefore clone the repository with:
```bash
git clone --recurse-submodules --depth 1 https://github.com/levigo/neverpile-eureka-documentation.git
```
After the repository is downloaded install the necessary development dependencies:
```bash
npm install
```
the project is now ready and can be served on a development server via:
```bash
npm run start
```
After the development server is started you can reach the documentation under:
```
http://localhost:1313/neverpile-eureka-documentation/
```

If you just want to build the site instead, run:
```bash
npm run build
```
