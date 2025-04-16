function logout() {
    // Borrar todo lo de localStorage y sessionStorage (incluye los tokens de Cognito)
      localStorage.clear();
      sessionStorage.clear();
  
    // Opcional: puedes eliminar claves específicas si no quieres borrar todo
    // localStorage.removeItem("CognitoIdentityServiceProvider.xxxxxx.idToken");
  
    // Redirigir al login de Cognito
    window.location.href = 'https://us-east-1xxub0nmom.auth.us-east-1.amazoncognito.com/login?client_id=72asbaqe7ot2fiuh10g308pj0o&redirect_uri=https://d3jrfcszlt0wkw.cloudfront.net&response_type=code&scope=email+openid+phone';
  }

  import { UserManager } from "https://esm.sh/oidc-client-ts";

  const cognitoAuthConfig = {
      authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XxUB0nmoM",
      client_id: "72asbaqe7ot2fiuh10g308pj0o",
      redirect_uri: "https://d3jrfcszlt0wkw.cloudfront.net",
      response_type: "code",
      scope: "email openid phone"
  };
  
  // create a UserManager instance
  export const userManager = new UserManager({
      ...cognitoAuthConfig,
  });
  
  export async function signOutRedirect () {
      const clientId = "72asbaqe7ot2fiuh10g308pj0o";
      const logoutUri = "<logout uri>";
      const cognitoDomain = "https://us-east-1xxub0nmom.auth.us-east-1.amazoncognito.com";
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  