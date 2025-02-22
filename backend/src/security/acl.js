module.exports = {
    middleware: {
        isAdmin(request, response, next) {
            return next();
        },
        isEditor(request, response, next) {
            return next();
        },
        isViewer(request, response, next) {
            return next();
        },
        isConnectionCreator(request, response, next) {
            return next();
        },
        noRestrictedRoles(request, response, next) {
            return next();
        },
    },
    isAdmin(user) {
        return true;
    },
    isEditor(user) {
        return true;
    },
    isViewer(user) {
        return true;
    },
    isConnectionCreator(user) {
        return true;
    },
    noRestrictedRoles(user) {
        return true;
    },
}