// This test  walks through a basic non-admin user signing in . It checks
// that the email login process works

/// <reference types="Cypress" />

context("Member user login", () => {
  it("Site opens", () => {
    cy.visit("", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
      },
    });
  });
  it("Login", () => {
    cy.logonEmail(Cypress.env("memberUser"), Cypress.env("memberPassword"));
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
    cy.get(".cdk-column-name > a").should("contain", "Sales");
    cy.get(".cdk-column-name > a").should("not.contain", "Java Developers");
    cy.get(".mat-button-wrapper > span").should("not.contain", "New Team");
  });
  it("Verify My Team", () => {
    cy.get(".cdk-column-name > a").contains("Sales").click();
    cy.get("app-subheading > .mat-toolbar").contains("Team - Update");
    // cy.wait(1000);
    // cy.get("tbody > :nth-child(1) > .cdk-column-displayName").should(
    //   "contain",
    //   "normal user"
    // );
    cy.get("tbody > :nth-child(1) > .cdk-column-displayName").contains(
      "normal user"
    );
    cy.get(".add-button").should("not.contain", "Add");
  });

  it("Not administrator", () => {
    cy.verifyNotAdministrator();
  });
  it("Logout", () => {
    cy.verifyLogout();
  });
});
