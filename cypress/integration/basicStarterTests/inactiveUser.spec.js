// This test  walks through a basic non-admin user signing in . It checks
// that the email login process works

/// <reference types="Cypress" />

context("Inactive user login", () => {
  it("Site opens", () => {
    cy.visit("", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
      },
    });
  });
  it("Login", () => {
    cy.logonEmail(Cypress.env("inactiveUser"), Cypress.env("inactivePassword"));
  });
  it("Verify not activated user", () => {
    cy.verifyNotActivated();
  });
  it("Navigate to About Page", () => {
    cy.verifyAboutComponent();
  });
  it("Navigate to Home Page", () => {
    cy.verifyHomeComponent();
  });
  it("Logout", () => {
    cy.verifyLogout();
  });
});
