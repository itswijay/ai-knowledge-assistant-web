"use client";

import * as React from "react";

import {
  OrganizationContext,
  type OrganizationContextValue,
} from "./organization-context";

export function useOrganization(): OrganizationContextValue {
  const context = React.useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider",
    );
  }
  return context;
}
