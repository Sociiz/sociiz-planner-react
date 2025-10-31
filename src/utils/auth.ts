export function getToken() {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem("authToken", token);
  } catch {
    /* empty */
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem("refreshToken");
  } catch {
    return null;
  }
}

export function setRefreshToken(refreshToken: string) {
  try {
    localStorage.setItem("refreshToken", refreshToken);
  } catch {
    /* empty */
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  } catch {
    /* empty */
  }
}
