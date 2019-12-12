const React = require('react');
const Redirect = require("../../core/Redirect.js");

const siteConfig = require(process.cwd() + "/siteConfig.js");

function docUrl(doc, language) {
  return (
    siteConfig.baseUrl +
    "docs/" +
    (language ? language + "/" : "") +
    doc +
    ".html"
  );
}

class Index extends React.Component {
  render() {
    return (
      <Redirect
        redirect={docUrl("index", this.props.language)}
        config={siteConfig}
      />
    );
  }
}

module.exports = Index;
