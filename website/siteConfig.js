/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'levigo',
    image: 'img/levigo-logo.png',
    infoLink: 'https://www.levigo.de',
    pinned: true,
  },
];

const siteConfig = {
  title: 'neverpile eureka - dokumentation',
  tagline: 'The archive system for the cloud generation.',
  url: 'https://levigo.github.io',
  baseUrl: '/neverpile-eureka-documentation/',

  // Used for publishing and more
  projectName: 'neverpile-eureka-documentation',
  organizationName: 'levigo solutions',

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
	  { search: true },
	  { languages: true },
    { doc: 'index', label: 'Docs' },
    { doc: 'api', label: 'API' },
    { doc: 'tutorials/index', label: 'Tutorials' },
    { page: 'help', label: 'Help' }
  ],

  users,

  /* path to images for header/footer */
  headerIcon: 'img/levigo-logo-white.svg',
  footerIcon: 'img/levigo-logo-white.svg',
  favicon: 'img/favicon.ico',

  /* Colors for website */
  colors: {
    primaryColor: '#2f35a4',
    secondaryColor: '#202572',
  },

  /* Custom fonts for website */
  fonts: {},

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} levigo solutions gmbH`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

   repoUrl: 'https://github.com/levigo/neverpile-eureka',
  
  algolia: {
    apiKey: '', // TODO: Get
    indexName: '',// TODO: Get
    algoliaOptions: {} // Optional, if provided by Algolia
  }
};

module.exports = siteConfig;
