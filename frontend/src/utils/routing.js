export function getInitialRoute(user) {
    const route = window.location.hash.replace("#/", "");
    if (route) return route;
    return user ? "dashboard" : "home";
}

export function setRoute(next, setSidebarOpen) {
    window.location.hash = `/${next}`;
    setSidebarOpen?.(false);
}
