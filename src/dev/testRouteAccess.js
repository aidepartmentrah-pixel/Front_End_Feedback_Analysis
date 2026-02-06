// src/dev/testRouteAccess.js

/**
 * DEV-ONLY: Logger for role-based route access decisions
 * Helps visualize which users can access which routes during testing
 */
export const logRouteAccessCheck = (userRoles, requiredRoles, routeName) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const hasAccess = requiredRoles.some((role) => userRoles?.includes(role));

  console.group(`🔐 Route Access Check: ${routeName}`);
  console.log("Required Roles:", requiredRoles);
  console.log("User Roles:", userRoles || "(none)");
  console.log("Decision:", hasAccess ? "✓ ALLOW" : "✗ DENY");
  console.groupEnd();
};
