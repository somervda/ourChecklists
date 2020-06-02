// This test  walks through a basic non-admin user signing in . It checks
// that the email login process works

/// <reference types="Cypress" />

context("Manager user login", () => {
  it("Site opens", () => {
    cy.visit("", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
      },
    });
  });
  it("Login", () => {
    cy.logonEmail(Cypress.env("managerUser"), Cypress.env("managerPassword"));
    cy.get("#mainToolBarIsActivated").should("exist");
  });
  it("Navigate to About Page", () => {
    cy.verifyAboutComponent();
  });
  it("Navigate to Home Page", () => {
    cy.verifyHomeComponent();
  });
  it("Navigate to MyProfile", () => {
    cy.verifyMyProfileComponent();
  });
  it("Verify My Teams", () => {
    cy.openMyTeamsComponent();
    cy.get(".cdk-column-name > a").should("contain", "Angular");
    cy.get(".cdk-column-name > a").should("contain", "e2eTeam");
    cy.get("app-subheading > .mat-toolbar").contains("My Teams");
  });
  it("Verify My Team", () => {
    cy.get(".cdk-column-name > a").contains("e2eTeam").click();
    cy.get("app-subheading > .mat-toolbar").contains("Team - Update");
    cy.contains("Manager User");
    cy.get(".add-button").should("contain", "Add");
  });

  it("Verify all non-admin roles", () => {
    cy.verifyAllNonAdminRoles();
  });

  it("Not administrator", () => {
    cy.verifyNotAdministrator();
  });
  it("Logout", () => {
    cy.verifyLogout();
  });
});
