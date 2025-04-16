import { UserManager } from "https://cdn.skypack.dev/oidc-client-ts";

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
    const logoutUri = "https://d3jrfcszlt0wkw.cloudfront.net";
    const cognitoDomain = "https://us-east-1xxub0nmom.auth.us-east-1.amazoncognito.com";

    // Notificar logout a otras pestañas
    localStorage.setItem("logout-event", Date.now());

    await userManager.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

// Escuchar eventos de logout en otras pestañas
window.addEventListener("storage", (event) => {
    if (event.key === "logout-event") {
        userManager.removeUser().then(() => {
            window.location.reload();
        });
    }
});
