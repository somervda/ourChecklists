// This test  walks through a admin user signing in . It checks
// that the email login process works and user has
// the expected access to admin functionality

/// <reference types="Cypress" />

context("Checklist", () => {
  const now = new Date();
  const e2eChecklist = "e2eChecklist" + now.valueOf();
  it("Site opens", () => {
    cy.visit("", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
      },
    });
  });
  it("Login", () => {
    cy.logonEmail(Cypress.env("adminUser"), Cypress.env("adminPassword"));
    cy.get("#mainToolBarIsActivated").should("exist");
  });
  it("Navigate to About Page", () => {
    cy.verifyAboutComponent();
  });
  it("Navigate to Home Page", () => {
    cy.verifyHomeComponent();
  });

  it("Create checklist from Templates", () => {
    cy.verifyTemplatesComponent();
    cy.get(".page-container").contains("e2eTemplate").click();
    cy.get("app-subheading > .mat-toolbar").contains("Template");
    cy.get("#file_copy").click();
    cy.get(
      "app-checklistfromtemplatedialog.ng-star-inserted > app-subheading > .mat-toolbar"
    ).contains("Create Checklist from Template");
    cy.get("#checklistName").clear();
    cy.get("#checklistName").type(e2eChecklist);
    cy.get("#checklistTeam").click();
    cy.get("mat-option").contains("None").click();
    cy.get("#createChecklist").click();
    cy.wait(2000);
    cy.get("app-subheading > .mat-toolbar").contains("Checklist Viewer");
  });

  // Update checklist
  it("Update Checklist", () => {
    cy.verifyMyChecklistsComponent();
    cy.get(".page-container").contains(e2eChecklist).click();
    cy.get("app-subheading > .mat-toolbar").contains("Checklist");
    cy.get(".mat-checkbox-inner-container").click();
    cy.get("#statusDialog").click();
    cy.get(
      "app-checkliststatusdialog.ng-star-inserted > app-subheading > .mat-toolbar"
    ).contains("Checklist Status");
    // Click on done
    cy.get("#rbstatus3").click();
    cy.get("#ok").click();
    cy.wait(2000);
    cy.get("app-subheading > .mat-toolbar").contains("Checklist Viewer");
  });

  // delete checklist
  it("Delete Checklist", () => {
    cy.verifyMyChecklistsComponent();
    cy.get("#D" + e2eChecklist).click();
    cy.get("#yes").click();
    cy.wait(2000);
    cy.verifyAdminUtilComponent();
    cy.get("#checklistCleanup").click();
    cy.wait(2000);
  });

  it("Logout", () => {
    cy.verifyLogout();
  });
});
