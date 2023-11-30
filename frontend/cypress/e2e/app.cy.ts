describe('Navigation', () => {
  it('should navigate to the login page', () => {
    // Start from the index page
    cy.visit('/')
 
    // Find a link with an href attribute containing "login" and click it
    cy.get('a[href*="login"]').click()
 
    // The new url should include "/login"
    cy.url().should('include', '/login')
 
    // The new page should contain an h1 with "Sign in"
    cy.get('h1').contains('Sign in')
  })
})